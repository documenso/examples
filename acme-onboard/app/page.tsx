import { db } from "@/lib/db"
import { DashboardClient, type HireWithProgress } from "@/components/dashboard-client"

export const dynamic = "force-dynamic"
const NEW_HIRES = [
  { name: "Alex Rivera", role: "Software Engineer", startDate: "Apr 7, 2025", salary: "$145,000" },
  { name: "Priya Patel", role: "Product Designer", startDate: "Apr 14, 2025", salary: "$135,000" },
  { name: "Marcus Johnson", role: "DevOps Engineer", startDate: "Apr 21, 2025", salary: "$155,000" },
]

export default async function DashboardPage() {
  const sessions = await db.onboardingSession.findMany({
    where: {
      employeeName: { in: NEW_HIRES.map((h) => h.name) },
    },
    orderBy: { createdAt: "desc" },
  })

  // Build a map of employee name → most recent session
  const sessionByName = new Map<string, (typeof sessions)[number]>()
  for (const session of sessions) {
    // Sessions are ordered desc by createdAt; first seen = most recent
    if (!sessionByName.has(session.employeeName)) {
      sessionByName.set(session.employeeName, session)
    }
  }

  const hires: HireWithProgress[] = NEW_HIRES.map((hire) => {
    const session = sessionByName.get(hire.name)
    if (!session) {
      return { ...hire, signedCount: 0, sessionId: null }
    }

    const signedCount =
      (session.offerSigned ? 1 : 0) +
      (session.ndaSigned ? 1 : 0) +
      (session.handbookSigned ? 1 : 0)

    return { ...hire, signedCount, sessionId: session.id }
  })

  return <DashboardClient hires={hires} />
}
