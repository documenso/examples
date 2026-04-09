"use client"

import Link from "next/link"
import { TrendingUp, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockClients, formatAum, type PipelineStage, type MockClient } from "@/lib/mock-clients"

const columns: { stage: PipelineStage; label: string; color: string }[] = [
  { stage: "prospect", label: "Prospect", color: "bg-muted-foreground" },
  { stage: "onboarding", label: "Onboarding", color: "bg-muted-foreground/60" },
  { stage: "active", label: "Active", color: "bg-primary" },
]

function ClientCard({ client }: { client: MockClient }) {
  const isClickable = client.stage === "prospect"

  const card = (
    <Card
      className={`transition-all ${
        isClickable
          ? "cursor-pointer hover:shadow-md hover:border-primary/50"
          : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
              <User className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{client.name}</p>
              <p className="text-muted-foreground text-xs">
                {formatAum(client.aum)} AUM
              </p>
            </div>
          </div>
          <Badge
            variant={
              client.stage === "active"
                ? "default"
                : client.stage === "onboarding"
                  ? "secondary"
                  : "outline"
            }
          >
            {client.stage === "onboarding"
              ? `${client.signedCount}/${client.totalDocs} signed`
              : client.stage === "active"
                ? "Active"
                : "New"}
          </Badge>
        </div>
        <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
          <span>Fee: {client.feePercent}%</span>
          <span>{client.riskProfile}</span>
        </div>
      </CardContent>
    </Card>
  )

  if (isClickable) {
    return <Link href={`/clients/${client.id}`}>{card}</Link>
  }
  return card
}

export function KanbanBoard() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {columns.map((col) => {
        const clients = mockClients.filter((c) => c.stage === col.stage)
        return (
          <div key={col.stage} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                {col.label}
              </h2>
              <span className="text-muted-foreground text-xs">
                ({clients.length})
              </span>
            </div>
            <div className="bg-muted/50 space-y-3 rounded-lg border border-dashed p-3">
              {clients.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No clients
                </p>
              ) : (
                clients.map((client) => (
                  <ClientCard key={client.id} client={client} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
