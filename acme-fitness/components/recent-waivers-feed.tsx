"use client"

import { useEffect, useMemo, useState } from "react"
import type { RecentWaiver } from "@/lib/waivers"

type RecentWaiversFeedProps = {
  enabled: boolean
  initialWaivers: RecentWaiver[]
  limit: number
  variant: "cards" | "table"
}

type RecentWaiversResponse = {
  enabled: boolean
  waivers: RecentWaiver[]
}

function formatCompletedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function RecentWaiversFeed({
  enabled: initialEnabled,
  initialWaivers,
  limit,
  variant,
}: RecentWaiversFeedProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [waivers, setWaivers] = useState(initialWaivers)

  useEffect(() => {
    if (!initialEnabled) {
      return
    }

    let active = true

    const refresh = async () => {
      const response = await fetch(`/api/waivers/recent?limit=${limit}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        return
      }

      const data = (await response.json()) as RecentWaiversResponse

      if (!active) {
        return
      }

      setEnabled(data.enabled)
      setWaivers(data.waivers)
    }

    const interval = window.setInterval(() => {
      void refresh()
    }, 15000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [initialEnabled, limit])

  const content = useMemo(() => {
    if (!enabled) {
      return (
        <div className="max-w-[48ch] text-base text-pretty text-neutral-400 sm:text-sm">
          Live feed unavailable until <code>DATABASE_URL</code> is configured
          and the Documenso webhook is connected.
        </div>
      )
    }

    if (waivers.length === 0) {
      return (
        <div className="max-w-[48ch] text-base text-pretty text-neutral-400 sm:text-sm">
          No waivers have been signed yet.
        </div>
      )
    }

    if (variant === "table") {
      return (
        <div className="-mx-6 -my-2 overflow-x-auto whitespace-nowrap lg:-mx-8">
          <div className="inline-block min-w-full px-6 py-2 align-middle lg:px-8">
            <table className="w-full text-left text-sm">
              <thead className="text-neutral-400">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                    Member
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {waivers.map((waiver) => (
                  <tr key={waiver.id} className="border-t border-white/5">
                    <td className="px-4 py-4 text-white">
                      {waiver.memberName}
                    </td>
                    <td className="px-4 py-4 text-neutral-300">
                      {waiver.memberEmail}
                    </td>
                    <td className="px-4 py-4 text-neutral-300 tabular-nums">
                      <time dateTime={waiver.completedAt}>
                        {formatCompletedAt(waiver.completedAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {waivers.map((waiver) => (
          <div
            key={waiver.id}
            className="rounded-[calc(var(--radius)*2.5)] bg-white/[0.03] p-4 ring-1 ring-white/5"
          >
            <div className="flex flex-col gap-1">
              <div className="text-base font-medium text-white sm:text-sm">
                {waiver.memberName}
              </div>
              <div className="text-base text-neutral-400 sm:text-sm">
                {waiver.memberEmail}
              </div>
            </div>
            <div className="pt-3 text-sm text-neutral-500 tabular-nums">
              <time dateTime={waiver.completedAt}>
                {formatCompletedAt(waiver.completedAt)}
              </time>
            </div>
          </div>
        ))}
      </div>
    )
  }, [enabled, variant, waivers])

  return content
}
