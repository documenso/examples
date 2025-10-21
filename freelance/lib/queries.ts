import { useQuery } from "@tanstack/react-query"
import { Job, Application, Contract } from "./types"

export const queryKeys = {
  jobs: ["jobs"] as const,
  job: (id: string) => ["jobs", id] as const,
  applications: (filters?: { jobId?: string; freelancerId?: string; status?: string }) =>
    ["applications", filters] as const,
  contracts: (filters?: { clientId?: string; freelancerId?: string; status?: string }) =>
    ["contracts", filters] as const,
  contract: (id: string) => ["contracts", id] as const,
}

async function fetchJobs(): Promise<Job[]> {
  const response = await fetch("/api/jobs")
  if (!response.ok) {
    throw new Error("Failed to fetch jobs")
  }
  return response.json()
}

async function fetchJob(id: string): Promise<Job> {
  const response = await fetch(`/api/jobs/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch job")
  }
  return response.json()
}

async function fetchApplications(filters?: {
  jobId?: string
  freelancerId?: string
  status?: string
}): Promise<Application[]> {
  const params = new URLSearchParams()
  if (filters?.jobId) params.append("jobId", filters.jobId)
  if (filters?.freelancerId) params.append("freelancerId", filters.freelancerId)
  if (filters?.status) params.append("status", filters.status)

  const url = `/api/applications${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch applications")
  }
  return response.json()
}

async function fetchContracts(filters?: {
  clientId?: string
  freelancerId?: string
  status?: string
}): Promise<Contract[]> {
  const params = new URLSearchParams()
  if (filters?.clientId) params.append("clientId", filters.clientId)
  if (filters?.freelancerId) params.append("freelancerId", filters.freelancerId)
  if (filters?.status) params.append("status", filters.status)

  const url = `/api/contracts${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch contracts")
  }
  return response.json()
}

async function fetchContract(id: string): Promise<Contract> {
  const response = await fetch(`/api/contracts/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch contract")
  }
  return response.json()
}

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: fetchJobs,
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => fetchJob(id),
    enabled: !!id,
  })
}

export function useApplications(filters?: { jobId?: string; freelancerId?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.applications(filters),
    queryFn: () => fetchApplications(filters),
  })
}

export function useContracts(filters?: { clientId?: string; freelancerId?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.contracts(filters),
    queryFn: () => fetchContracts(filters),
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: queryKeys.contract(id),
    queryFn: () => fetchContract(id),
    enabled: !!id,
  })
}
