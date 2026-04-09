"use client"

import dynamic from "next/dynamic"
import type { RecentWaiver } from "@/lib/waivers"

type RecentWaiversFeedLazyProps = {
  enabled: boolean
  initialWaivers: RecentWaiver[]
  limit: number
  variant: "cards" | "table"
}

const RecentWaiversFeed = dynamic(
  () =>
    import("@/components/recent-waivers-feed").then(
      (module) => module.RecentWaiversFeed
    ),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-[48ch] text-base text-pretty text-neutral-400 sm:text-sm">
        Loading recent waiver activity…
      </div>
    ),
  }
)

export function RecentWaiversFeedLazy(props: RecentWaiversFeedLazyProps) {
  return <RecentWaiversFeed {...props} />
}
