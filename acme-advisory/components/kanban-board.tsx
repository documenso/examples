import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { type PipelineCard, type PipelineStage } from "@/lib/pipeline-data"

const columns: {
  stage: PipelineStage
  label: string
  description: string
  empty: string
}[] = [
  {
    stage: "prospect",
    label: "Prospect",
    description: "Qualified households waiting for the first packet launch.",
    empty: "No prospects available.",
  },
  {
    stage: "onboarding",
    label: "Onboarding",
    description: "Live packets already sent and signing in sequence.",
    empty: "No live onboarding sessions yet.",
  },
  {
    stage: "active",
    label: "Active",
    description: "Relationship is live and the full packet is complete.",
    empty: "No active clients yet.",
  },
]

function getStageSummary(card: PipelineCard) {
  if (card.stage === "active") {
    return "3 of 3 documents complete"
  }

  if (card.stage === "onboarding") {
    return `${card.signedCount}/${card.totalDocs} signed so far`
  }

  return "Ready to launch packet"
}

function getNextAction(card: PipelineCard) {
  if (card.stage === "active") {
    return "Open household record"
  }

  if (card.stage === "onboarding") {
    return "Resume signature sequence"
  }

  return "Start onboarding packet"
}

function ClientCard({ client }: { client: PipelineCard }) {
  return (
    <li>
      <Link
        href={client.href}
        className="flex flex-col gap-4 rounded-xl border border-border/70 bg-background p-4 transition-transform hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-foreground">
              {client.name}
            </p>
            <p className="text-base text-pretty text-muted-foreground sm:text-sm">
              {client.email ?? getStageSummary(client)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-base font-medium text-foreground tabular-nums sm:text-sm">
              {client.aumLabel}
            </p>
            <p className="text-base text-muted-foreground sm:text-sm">AUM</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-base text-muted-foreground sm:text-sm">
              {client.riskProfile}
            </p>
            <p className="text-base text-muted-foreground tabular-nums sm:text-sm">
              Advisory fee {client.feeLabel}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span>{getNextAction(client)}</span>
            <ArrowRight className="size-4 shrink-0" />
          </div>
        </div>
      </Link>
    </li>
  )
}

export function KanbanBoard({ cards }: { cards: PipelineCard[] }) {
  return (
    <div className="grid gap-8 xl:grid-cols-3">
      {columns.map((column) => {
        const columnCards = cards.filter((card) => card.stage === column.stage)

        return (
          <section
            key={column.stage}
            className="min-w-0 rounded-2xl border border-border/70 bg-muted/35 p-4"
          >
            <div className="border-b border-border/70 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold tracking-tight text-balance">
                    {column.label}
                  </h3>
                  <p className="max-w-[38ch] text-base text-pretty text-muted-foreground sm:text-sm">
                    {column.description}
                  </p>
                </div>
                <p className="rounded-full border border-border/70 bg-background px-3 py-1 text-sm font-medium text-foreground tabular-nums">
                  {columnCards.length}
                </p>
              </div>
            </div>

            <div className="min-h-[24rem] pt-4">
              {columnCards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
                  <p className="text-base text-muted-foreground sm:text-sm">
                    {column.empty}
                  </p>
                </div>
              ) : (
                <ul role="list" className="space-y-3">
                  {columnCards.map((card) => (
                    <ClientCard key={card.prospectId} client={card} />
                  ))}
                </ul>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
