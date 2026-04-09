export type SessionStatus = "unprepared" | "prepared" | "completed"

export interface NotarySession {
  id: string
  clientName: string
  clientEmail: string
  documentType: string
  scheduledTime: string
  status: SessionStatus
}

export const sessions: NotarySession[] = [
  {
    id: "1",
    clientName: "Sarah Chen",
    clientEmail: "sarah.chen@example.com",
    documentType: "Power of Attorney",
    scheduledTime: "Today 2:00 PM",
    status: "unprepared",
  },
  {
    id: "2",
    clientName: "Michael Torres",
    clientEmail: "michael.torres@example.com",
    documentType: "Affidavit",
    scheduledTime: "Today 3:30 PM",
    status: "prepared",
  },
  {
    id: "3",
    clientName: "Jennifer Walsh",
    clientEmail: "jennifer.walsh@example.com",
    documentType: "Real Estate Deed",
    scheduledTime: "Tomorrow 10:00 AM",
    status: "unprepared",
  },
  {
    id: "4",
    clientName: "David Kim",
    clientEmail: "david.kim@example.com",
    documentType: "Will Testament",
    scheduledTime: "Completed",
    status: "completed",
  },
]

export function getSession(id: string): NotarySession | undefined {
  return sessions.find((s) => s.id === id)
}
