export type Placement = {
  id: string
  candidateName: string
  clientCompany: string
  role: string
  hourlyRate: number
  startDate: string
  status: "pending" | "ready_to_start"
}

export const placements: Placement[] = [
  {
    id: "1",
    candidateName: "Sarah Kim",
    clientCompany: "TechCorp Inc",
    role: "Frontend Developer",
    hourlyRate: 85,
    startDate: "May 1, 2025",
    status: "pending",
  },
  {
    id: "2",
    candidateName: "James O'Brien",
    clientCompany: "DataFlow Systems",
    role: "Data Engineer",
    hourlyRate: 95,
    startDate: "May 5, 2025",
    status: "pending",
  },
  {
    id: "3",
    candidateName: "Maria Santos",
    clientCompany: "CloudBase",
    role: "DevOps Lead",
    hourlyRate: 110,
    startDate: "May 12, 2025",
    status: "ready_to_start",
  },
  {
    id: "4",
    candidateName: "Tom Chen",
    clientCompany: "Fintech Labs",
    role: "Backend Developer",
    hourlyRate: 90,
    startDate: "Apr 28, 2025",
    status: "pending",
  },
  {
    id: "5",
    candidateName: "Aisha Patel",
    clientCompany: "Northstar Health",
    role: "UX Designer",
    hourlyRate: 82,
    startDate: "May 19, 2025",
    status: "pending",
  },
  {
    id: "6",
    candidateName: "Daniel Brooks",
    clientCompany: "Vertex Commerce",
    role: "Product Manager",
    hourlyRate: 98,
    startDate: "May 22, 2025",
    status: "pending",
  },
  {
    id: "7",
    candidateName: "Priya Nair",
    clientCompany: "Orbit Analytics",
    role: "QA Lead",
    hourlyRate: 76,
    startDate: "May 27, 2025",
    status: "ready_to_start",
  },
]

export function getPlacement(id: string): Placement | undefined {
  return placements.find((p) => p.id === id)
}
