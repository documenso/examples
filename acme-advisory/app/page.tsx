import { AppHeader } from "@/components/app-header"
import { KanbanBoard } from "@/components/kanban-board"
import { getPipelineCards } from "@/lib/pipeline-data"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const cards = await getPipelineCards()
  const prospectCount = cards.filter((card) => card.stage === "prospect").length
  const onboardingCount = cards.filter(
    (card) => card.stage === "onboarding"
  ).length
  const activeCount = cards.filter((card) => card.stage === "active").length
  const summaryItems = [
    {
      label: "Households",
      value: String(cards.length),
      detail: `${prospectCount} ready to launch`,
    },
    {
      label: "Live onboarding",
      value: String(onboardingCount),
      detail: "Signing packets in progress",
    },
    {
      label: "Active clients",
      value: String(activeCount),
      detail: "All three documents complete",
    },
  ]

  return (
    <div className="isolate min-h-dvh bg-background">
      <AppHeader
        subtitle="Advisory pipeline"
        meta="Three-document household onboarding"
        containerClassName="max-w-6xl"
      />

      <main>
        <section className="border-b border-border/70 py-10">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[12fr_7fr] lg:items-end">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Meridian household onboarding
              </p>
              <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance">
                Track every household from intake to signed advisory packet.
              </h1>
              <p className="max-w-[58ch] text-base text-pretty text-muted-foreground">
                This demo keeps the flow simple: qualify the prospect, launch a
                three-document packet, then move the household into active
                service once the sequence is complete.
              </p>
            </div>

            <div className="border-t border-border/70 pt-4 lg:pt-0 lg:pl-8">
              <dl className="grid gap-4">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-muted-foreground">Packet</dt>
                  <dd className="text-right text-sm font-medium text-foreground">
                    IMA, Fee Acknowledgment, ADV Part 2
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-border/70 pt-4">
                  <dt className="text-sm text-muted-foreground">Sequence</dt>
                  <dd className="text-right text-sm font-medium text-foreground">
                    Signed in order, one document at a time
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-border/70 pt-4">
                  <dt className="text-sm text-muted-foreground">Outcome</dt>
                  <dd className="text-right text-sm font-medium text-foreground">
                    Household is promoted to active service
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 py-6">
          <div className="mx-auto grid max-w-6xl px-6 sm:grid-cols-3">
            {summaryItems.map((item, index) => (
              <div
                key={item.label}
                className={[
                  "py-4",
                  index > 0
                    ? "border-t border-border/70 sm:border-t-0 sm:border-l"
                    : "",
                  index === 0 ? "sm:pr-6" : "",
                  index === 1 ? "sm:px-6" : "",
                  index === 2 ? "sm:pl-6" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <p className="truncate text-sm text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-pretty text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6">
            <div className="flex flex-col gap-2">
              <h2 className="max-w-[28ch] text-2xl font-semibold tracking-tight text-balance">
                Advisory pipeline
              </h2>
              <p className="max-w-[60ch] text-base text-pretty text-muted-foreground">
                The pipeline below keeps the flat visual language from the other
                demos, but restores clear kanban lanes and stacked cards so each
                stage reads like an actual board.
              </p>
            </div>

            <KanbanBoard cards={cards} />
          </div>
        </section>
      </main>
    </div>
  )
}
