import Link from "next/link"
import { TransactionStatus } from "@prisma/client"
import { ChevronRight } from "lucide-react"
import { getTransactionStatusLabel, listDemoTransactions } from "@/lib/transactions"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const transactions = await listDemoTransactions()
  const draftCount = transactions.filter(
    (transaction) => transaction.status === TransactionStatus.DRAFT,
  ).length
  const underContractCount = transactions.filter(
    (transaction) => transaction.status === TransactionStatus.UNDER_CONTRACT,
  ).length
  const closedCount = transactions.filter(
    (transaction) => transaction.status === TransactionStatus.CLOSED,
  ).length

  const statusTone: Record<
    TransactionStatus,
    { dot: string; text: string }
  > = {
    [TransactionStatus.DRAFT]: {
      dot: "bg-zinc-400 dark:bg-zinc-500",
      text: "text-muted-foreground",
    },
    [TransactionStatus.UNDER_CONTRACT]: {
      dot: "bg-amber-500",
      text: "text-foreground",
    },
    [TransactionStatus.CLOSED]: {
      dot: "bg-emerald-500",
      text: "text-foreground",
    },
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 border-b border-border/80 pb-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Transaction management
          </p>
          <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance text-foreground">
            Active files across the brokerage.
          </h1>
          <p className="max-w-[56ch] text-base text-pretty text-muted-foreground">
            Track each purchase agreement, keep signatures moving, and manage
            addendums without clutter.
          </p>
        </div>
      </section>

      <section className="border-b border-border/80 py-6">
        <dl className="grid gap-6 sm:grid-cols-3 sm:gap-0" role="list">
          <div className="sm:pr-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-border/80 sm:[&:not(:first-child)]:pl-6">
            <dt className="text-sm font-medium text-foreground">Draft</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {draftCount}
            </dd>
          </div>
          <div className="border-t border-border/80 pt-6 sm:border-t-0 sm:pr-6 sm:pl-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-border/80">
            <dt className="text-sm font-medium text-foreground">
              Under contract
            </dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {underContractCount}
            </dd>
          </div>
          <div className="border-t border-border/80 pt-6 sm:border-t-0 sm:pl-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-border/80">
            <dt className="text-sm font-medium text-foreground">Closed</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {closedCount}
            </dd>
          </div>
        </dl>
      </section>

      <section className="pt-8">
        <div className="-mx-4 -my-2 overflow-x-auto whitespace-nowrap sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-6 lg:px-8">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground">
                  <th className="whitespace-nowrap py-3 pr-6 font-medium">
                    Property
                  </th>
                  <th className="whitespace-nowrap px-6 font-medium">Price</th>
                  <th className="whitespace-nowrap px-6 font-medium">Parties</th>
                  <th className="whitespace-nowrap px-6 font-medium">Status</th>
                  <th className="whitespace-nowrap py-3 pl-6 font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border/70 align-top last:border-b-0"
                  >
                    <td className="py-4 pr-6">
                      <div className="space-y-1">
                        <Link
                          href={`/transactions/${transaction.id}`}
                          className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {transaction.property}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {transaction.addendums.length} addendum
                          {transaction.addendums.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium tabular-nums text-foreground">
                      {transaction.price}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {transaction.buyerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.sellerName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 text-sm ${statusTone[transaction.status].text}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${statusTone[transaction.status].dot}`}
                        />
                        {getTransactionStatusLabel(transaction.status)}
                      </div>
                    </td>
                    <td className="py-4 pl-6">
                      <Link
                        href={`/transactions/${transaction.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        Open file
                        <ChevronRight className="size-4 shrink-0" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
