import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { createInitialProjects, type Project } from "@/lib/mock-data"

const APP_STATE_KEY = "acme-agency"

function toJson(projects: Project[]) {
  return projects as unknown as Prisma.InputJsonValue
}

export async function getProjectsState(): Promise<Project[]> {
  const state = await db.appState.findUnique({
    where: { key: APP_STATE_KEY },
  })

  if (!state) {
    const projects = createInitialProjects()

    await db.appState.create({
      data: {
        key: APP_STATE_KEY,
        projects: toJson(projects),
      },
    })

    return projects
  }

  return state.projects as unknown as Project[]
}

export async function saveProjectsState(projects: Project[]) {
  const next = toJson(projects)

  await db.appState.upsert({
    where: { key: APP_STATE_KEY },
    update: { projects: next },
    create: {
      key: APP_STATE_KEY,
      projects: next,
    },
  })
}
