export interface CampSession {
  id: string
  week: number
  dates: string
  price: number
  spotsLeft: number
}

export const sessions: CampSession[] = [
  { id: "week-1", week: 1, dates: "Jun 15–19", price: 450, spotsLeft: 12 },
  { id: "week-2", week: 2, dates: "Jun 22–26", price: 450, spotsLeft: 8 },
  { id: "week-3", week: 3, dates: "Jun 29–Jul 3", price: 450, spotsLeft: 0 },
  { id: "week-4", week: 4, dates: "Jul 6–10", price: 450, spotsLeft: 15 },
]

export function getSession(id: string): CampSession | undefined {
  return sessions.find((s) => s.id === id)
}
