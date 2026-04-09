export type ScopeChange = {
  id: string
  description: string
  amount: number
}

export type DocumentRecord = {
  name: string
  type: "SOW" | "Change Order" | "Invoice"
  date: string
  status: "Draft" | "Sent" | "Signed" | "Expired"
}

export type Project = {
  id: string
  name: string
  client: string
  clientEmail: string
  budget: number
  status: "Pending" | "Active" | "Completed"
  sowStatus: "Draft" | "Sent" | "Signed"
  startDate: string
  endDate: string
  deliverables: string[]
  scopeChanges: ScopeChange[]
  documentHistory: DocumentRecord[]
}

export const projects: Project[] = [
  {
    id: "acme-corp",
    name: "Acme Corp Website Redesign",
    client: "Acme Corp",
    clientEmail: "contact@acmecorp.com",
    budget: 45000,
    status: "Pending",
    sowStatus: "Draft",
    startDate: "2026-04-01",
    endDate: "2026-07-31",
    deliverables: [
      "Brand audit & competitive analysis",
      "Wireframes & information architecture",
      "Visual design (desktop + mobile)",
      "Frontend development (Next.js)",
      "CMS integration & content migration",
      "QA testing & launch support",
    ],
    scopeChanges: [],
    documentHistory: [
      {
        name: "Statement of Work v1",
        type: "SOW",
        date: "2026-03-15",
        status: "Draft",
      },
    ],
  },
  {
    id: "bluesky-app",
    name: "BlueSky App Launch",
    client: "BlueSky Technologies",
    clientEmail: "pm@bluesky.io",
    budget: 28000,
    status: "Active",
    sowStatus: "Signed",
    startDate: "2026-02-01",
    endDate: "2026-05-31",
    deliverables: [
      "App strategy & user research",
      "UI/UX design (iOS + Android)",
      "Marketing landing page",
      "App Store assets & screenshots",
      "Launch campaign creative",
    ],
    scopeChanges: [
      {
        id: "bs-sc-1",
        description: "+$5,000 for additional landing pages",
        amount: 5000,
      },
      {
        id: "bs-sc-2",
        description: "+$3,000 for mobile optimization",
        amount: 3000,
      },
    ],
    documentHistory: [
      {
        name: "Statement of Work",
        type: "SOW",
        date: "2026-01-20",
        status: "Signed",
      },
      {
        name: "Invoice #1 — Milestone 1",
        type: "Invoice",
        date: "2026-03-01",
        status: "Signed",
      },
    ],
  },
  {
    id: "greenleaf-brand",
    name: "GreenLeaf Brand Identity",
    client: "GreenLeaf Organics",
    clientEmail: "hello@greenleaf.co",
    budget: 15000,
    status: "Active",
    sowStatus: "Signed",
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    deliverables: [
      "Discovery workshop & mood boards",
      "Logo design (3 concepts)",
      "Color palette & typography system",
      "Brand guidelines document",
      "Business card & letterhead design",
    ],
    scopeChanges: [
      {
        id: "gl-sc-1",
        description: "+$2,500 for social media templates",
        amount: 2500,
      },
    ],
    documentHistory: [
      {
        name: "Statement of Work",
        type: "SOW",
        date: "2026-02-15",
        status: "Signed",
      },
    ],
  },
]

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
