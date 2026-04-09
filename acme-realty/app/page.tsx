"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, DollarSign, Users } from "lucide-react"
import { TRANSACTIONS } from "@/lib/mock-data"

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  under_contract: "Under Contract",
  closed: "Closed",
}

export default function DashboardPage() {
  return (
    <div className="mx-auto min-h-svh max-w-5xl p-6 md:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Building className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Acme Realty
          </h1>
          <p className="text-sm text-muted-foreground">
            Transaction management dashboard
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {TRANSACTIONS.map((txn) => (
          <Link key={txn.id} href={`/transactions/${txn.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Building className="h-6 w-6 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">{txn.property}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {txn.price}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {txn.buyerName} &middot; {txn.sellerName}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={txn.status === "closed" ? "default" : txn.status === "under_contract" ? "secondary" : "outline"}
                >
                  {STATUS_LABELS[txn.status]}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
