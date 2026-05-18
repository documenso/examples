import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import { matters } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <main className="min-h-dvh bg-background">
      <AppHeader />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <h1 className="max-w-[35ch] text-xl font-semibold text-balance text-zinc-950 dark:text-zinc-50">
            Active matters
          </h1>
          <p className="max-w-[48ch] text-base text-pretty text-zinc-600 dark:text-zinc-400">
            Manage client matters and send custom documents.
          </p>
        </div>

        <div className="-mx-4 -my-2 overflow-x-auto whitespace-nowrap sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-6 lg:px-8">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-950/5">
                  <th className="h-12 py-3 pr-3 font-medium whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                    Client
                  </th>
                  <th className="h-12 px-3 font-medium whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                    Matter type
                  </th>
                  <th className="h-12 px-3 font-medium whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="h-12 px-3 text-right font-medium whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                    Retainer
                  </th>
                  <th className="h-12 pl-3 text-right font-medium whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {matters.map((matter) => (
                  <tr key={matter.id} className="border-b border-zinc-950/5">
                    <td className="py-4 pr-3 text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {matter.clientName}
                    </td>
                    <td className="px-3 text-sm text-zinc-600 dark:text-zinc-300">{matter.matterType}</td>
                    <td className="px-3">
                      <Badge
                        variant="secondary"
                        className="bg-zinc-900/5 text-zinc-700 dark:bg-zinc-50/10 dark:text-zinc-300"
                      >
                        {matter.status}
                      </Badge>
                    </td>
                    <td className="px-3 text-right tabular-nums text-sm text-zinc-950 dark:text-zinc-50">
                      ${matter.retainerAmount.toLocaleString()}
                    </td>
                    <td className="pl-3 text-right">
                      <Link
                        href={`/dashboard/${matter.id}/compose`}
                        className="inline-flex h-8 items-center justify-center rounded-4xl border border-zinc-950/10 bg-transparent px-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-50/10"
                      >
                        Send custom document
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
