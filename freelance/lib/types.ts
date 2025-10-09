export interface Job {
  id: string
  title: string
  description: string
  budget: {
    min: number
    max: number
    type: "fixed" | "hourly"
  }
  duration: string
  skills: string[]
  postedBy: {
    name: string
    avatar: string
    rating: number
    jobsPosted: number
  }
  postedAt: string
  applicants: number
  status: "open" | "in-progress" | "completed"
}

export interface Application {
  id: string
  jobId: string
  freelancer: {
    id: string
    name: string
    avatar: string
    title: string
    rating: number
    completedJobs: number
    hourlyRate: number
  }
  coverLetter: string
  proposedBudget: number
  proposedDuration: string
  status: "pending" | "accepted" | "rejected"
  appliedAt: string
}

export interface Contract {
  id: string
  jobId: string
  clientId: string
  freelancerId: string
  status: "pending-signatures" | "active" | "completed"
  clientSigned: boolean
  freelancerSigned: boolean
  clientSignedAt?: string | null
  freelancerSignedAt?: string | null
  milestones: Milestone[]
  createdAt: string
}

export interface Milestone {
  id: string
  title: string
  description: string
  amount: number
  dueDate: string
  status: "pending" | "in-progress" | "completed" | "paid"
}
