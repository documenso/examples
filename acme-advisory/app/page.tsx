import { TrendingUp } from "lucide-react"
import { KanbanBoard } from "@/components/kanban-board"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Meridian Wealth Advisors</h1>
              <p className="text-muted-foreground text-xs">Client Pipeline</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Client Pipeline</h2>
          <p className="text-muted-foreground mt-1">
            Manage client onboarding and document signing workflow
          </p>
        </div>

        <KanbanBoard />
      </main>
    </div>
  )
}
