"use client"

import * as React from "react"
import {
  createInitialProjects,
  formatDateLabel,
  getProjectFromList,
  type Project,
} from "@/lib/mock-data"

const STORAGE_KEY = "acme-agency-projects"
const STATE_ENDPOINT = "/api/projects/state"

function readProjectsFromStorage(): Project[] {
  if (typeof window === "undefined") {
    return createInitialProjects()
  }

  const stored = window.sessionStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return createInitialProjects()
  }

  try {
    return JSON.parse(stored) as Project[]
  } catch {
    return createInitialProjects()
  }
}

function writeProjectsToStorage(projects: Project[]) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

async function fetchProjectsFromServer() {
  const response = await fetch(STATE_ENDPOINT, { cache: "no-store" })

  if (!response.ok) {
    throw new Error("Failed to load project state")
  }

  const data = await response.json()

  return data.projects as Project[]
}

async function persistProjectsToServer(projects: Project[]) {
  const response = await fetch(STATE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projects }),
  })

  if (!response.ok) {
    throw new Error("Failed to save project state")
  }
}

function updateProjects(
  projects: Project[],
  projectId: string,
  updater: (project: Project) => Project
) {
  return projects.map((project) =>
    project.id === projectId ? updater(project) : project
  )
}

export function useProjectsState() {
  const [projects, setProjects] = React.useState<Project[]>(createInitialProjects)
  const projectsRef = React.useRef<Project[]>(createInitialProjects())

  React.useEffect(() => {
    let isMounted = true

    const cachedProjects = readProjectsFromStorage()
    projectsRef.current = cachedProjects
    setProjects(cachedProjects)

    void fetchProjectsFromServer()
      .then((serverProjects) => {
        if (!isMounted) {
          return
        }

        projectsRef.current = serverProjects
        setProjects(serverProjects)
        writeProjectsToStorage(serverProjects)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setProjects(cachedProjects)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const setAndPersist = React.useCallback(
    async (updater: (current: Project[]) => Project[]) => {
      const next = updater(projectsRef.current)
      projectsRef.current = next
      setProjects(next)

      if (typeof window !== "undefined") {
        writeProjectsToStorage(next)
        await persistProjectsToServer(next)
      }

      return next
    },
    []
  )

  const resetProjects = React.useCallback(() => {
    const next = createInitialProjects()
    projectsRef.current = next
    setProjects(next)

    if (typeof window !== "undefined") {
      writeProjectsToStorage(next)
      void persistProjectsToServer(next).catch(() => undefined)
    }
  }, [])

  const markSowSent = React.useCallback(
    async (projectId: string, details: { envelopeId?: string; name?: string }) => {
      await setAndPersist((current) =>
        updateProjects(current, projectId, (project) => {
          const existingSowIndex = project.documentHistory.findIndex(
            (document) => document.envelopeId === details.envelopeId
          )

          const sowRecord = {
            envelopeId: details.envelopeId,
            name: details.name ?? "Statement of Work",
            type: "SOW" as const,
            date: formatDateLabel(),
            status: "Sent" as const,
          }

          const documentHistory =
            existingSowIndex >= 0
              ? project.documentHistory.map((document, index) =>
                  index === existingSowIndex
                    ? { ...document, ...sowRecord }
                    : document
                )
              : [
                  sowRecord,
                  ...project.documentHistory.filter(
                    (document) =>
                      document.type !== "SOW" || document.status === "Signed"
                  ),
                ]

          return {
            ...project,
            sowStatus: "Sent",
            documentHistory,
          }
        })
      )
    },
    [setAndPersist]
  )

  const markSowSigned = React.useCallback(
    async (projectId: string, details: { envelopeId?: string; name?: string }) => {
      await setAndPersist((current) =>
        updateProjects(current, projectId, (project) => {
          const existingSowIndexByEnvelope = project.documentHistory.findIndex(
            (document) => document.envelopeId === details.envelopeId
          )
          const existingSowIndex =
            existingSowIndexByEnvelope >= 0
              ? existingSowIndexByEnvelope
              : project.documentHistory.findIndex(
                  (document) =>
                    document.type === "SOW" && document.status !== "Signed"
                )

          const documentHistory =
            existingSowIndex >= 0
              ? project.documentHistory.map((document, index) =>
                  index === existingSowIndex
                    ? {
                        ...document,
                        envelopeId: details.envelopeId ?? document.envelopeId,
                        status: "Signed" as const,
                        date: formatDateLabel(),
                      }
                    : document
                )
              : [
                  {
                    envelopeId: details.envelopeId,
                    name: details.name ?? "Statement of Work",
                    type: "SOW" as const,
                    date: formatDateLabel(),
                    status: "Signed" as const,
                  },
                  ...project.documentHistory,
                ]

          return {
            ...project,
            status: "Active",
            sowStatus: "Signed",
            documentHistory,
          }
        })
      )
    },
    [setAndPersist]
  )

  const markChangeOrderSent = React.useCallback(
    async (
      projectId: string,
      details: {
        documentId: number
        scopeChangeId: string
        description: string
      }
    ) => {
      await setAndPersist((current) =>
        updateProjects(current, projectId, (project) => ({
          ...project,
          documentHistory: [
            {
              documentId: details.documentId,
              scopeChangeId: details.scopeChangeId,
              name: details.description,
              type: "Change Order",
              date: formatDateLabel(),
              status: "Sent",
            },
            ...project.documentHistory.filter(
              (document) => document.documentId !== details.documentId
            ),
          ],
        }))
      )
    },
    [setAndPersist]
  )

  const markChangeOrderSigned = React.useCallback(
    async (
      projectId: string,
      details: {
        documentId?: number
        scopeChangeId: string
        amount: number
        description: string
      }
    ) => {
      await setAndPersist((current) =>
        updateProjects(current, projectId, (project) => {
          const existingDocumentIndex = project.documentHistory.findIndex(
            (document) =>
              document.documentId === details.documentId ||
              document.scopeChangeId === details.scopeChangeId
          )

          const documentHistory =
            existingDocumentIndex >= 0
              ? project.documentHistory.map((document, index) =>
                  index === existingDocumentIndex
                    ? {
                        ...document,
                        documentId: details.documentId ?? document.documentId,
                        name: details.description,
                        status: "Signed" as const,
                        date: formatDateLabel(),
                      }
                    : document
                )
              : [
                  {
                    documentId: details.documentId,
                    scopeChangeId: details.scopeChangeId,
                    name: details.description,
                    type: "Change Order" as const,
                    date: formatDateLabel(),
                    status: "Signed" as const,
                  },
                  ...project.documentHistory,
                ]

          return {
            ...project,
            budget: project.budget + details.amount,
            scopeChanges: project.scopeChanges.filter(
              (scopeChange) => scopeChange.id !== details.scopeChangeId
            ),
            documentHistory,
          }
        })
      )
    },
    [setAndPersist]
  )

  return {
    projects,
    resetProjects,
    getProject: React.useCallback(
      (projectId: string) => getProjectFromList(projects, projectId),
      [projects]
    ),
    markSowSent,
    markSowSigned,
    markChangeOrderSent,
    markChangeOrderSigned,
  }
}
