import Link from "next/link"
import { RecentWaiversFeedLazy } from "@/components/recent-waivers-feed-lazy"
import { buttonVariants } from "@/components/ui/button-variants"
import { getRecentWaivers } from "@/lib/waivers"

export const dynamic = "force-dynamic"

function formatUpdatedAt(value: string | undefined) {
  if (!value) {
    return "No activity yet"
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function DashboardPage() {
  const { enabled, waivers } = await getRecentWaivers(50)

  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="py-8 lg:py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-sm tracking-wide text-lime-300/80 uppercase">
                Staff view
              </p>
              <h1 className="max-w-[20ch] text-4xl font-semibold tracking-tight text-balance">
                Recent signed waivers, refreshed automatically.
              </h1>
              <p className="max-w-[48ch] text-base text-pretty text-neutral-400 sm:text-sm">
                Monitor the latest completed waiver submissions without leaving
                the front desk.
              </p>
            </div>

            <Link
              href="/"
              className={buttonVariants({
                variant: "outline",
                className:
                  "w-fit rounded-full border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10",
              })}
            >
              Back to kiosk
            </Link>
          </div>

          <dl className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2 sm:gap-6">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:border-r sm:border-b-0 sm:pr-6 sm:pb-0">
              <dt className="truncate text-base text-neutral-400 sm:text-sm">
                Feed status
              </dt>
              <dd className="text-2xl font-semibold tracking-tight text-balance">
                {enabled ? "Live" : "Offline"}
              </dd>
            </div>
            <div className="flex flex-col gap-2 sm:pl-6">
              <dt className="truncate text-base text-neutral-400 sm:text-sm">
                Latest completion
              </dt>
              <dd className="text-lg font-semibold tracking-tight text-balance tabular-nums">
                {formatUpdatedAt(waivers[0]?.completedAt)}
              </dd>
            </div>
          </dl>

          <RecentWaiversFeedLazy
            enabled={enabled}
            initialWaivers={waivers}
            limit={50}
            variant="table"
          />
        </div>
      </section>
    </main>
  )
}
