"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { useLeasingSession } from "@/components/leasing-session-provider"
import { cn } from "@/lib/utils"
import { formatCurrency, getStatusLabel, type Unit } from "@/lib/mock-data"

const statusTone = {
  occupied: "bg-zinc-300",
  vacant: "bg-zinc-700",
  "lease-pending": "bg-amber-500",
  leased: "bg-zinc-950",
} satisfies Record<Unit["status"], string>

export default function HomePage() {
  const { units } = useLeasingSession()

  const orderedUnits = [...units].sort((left, right) => {
    if (left.id === "4b") return -1
    if (right.id === "4b") return 1

    return left.unit.localeCompare(right.unit)
  })

  const stats = {
    total: units.length,
    occupied: units.filter((unit) => unit.status === "occupied").length,
    vacant: units.filter((unit) => unit.status === "vacant").length,
    pending: units.filter((unit) => unit.status === "lease-pending").length,
  }

  const statItems = [
    { label: "Homes", value: stats.total },
    { label: "Occupied", value: stats.occupied },
    { label: "Vacant", value: stats.vacant },
    { label: "Lease pending", value: stats.pending },
  ]

  return (
    <div className="min-h-svh bg-background">
      <AppHeader context="Portfolio" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-12">
          <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Property overview</p>
                <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Leasing activity across the current portfolio.
                </h2>
                <p className="max-w-[62ch] text-base text-muted-foreground text-pretty">
                  Review availability, track the live move-in, and open the lease packet
                  where work is already in motion.
                </p>
              </div>

              <ul
                role="list"
                className="grid gap-y-4 border-y border-border py-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {statItems.map((stat, index) => (
                  <li key={stat.label} className={getStatItemClassName(index)}>
                    <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="space-y-4 border-l border-border pl-6 lg:pl-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Current priority</p>
                <p className="text-2xl font-semibold tracking-tight text-balance">
                  Unit 4B is ready for lease review.
                </p>
                <p className="text-sm text-muted-foreground text-pretty">
                  The open packet stays at the top of the roster so the next action is
                  visible without turning the page into a dashboard template.
                </p>
              </div>
            </aside>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold tracking-tight text-balance">
                Unit roster
              </h3>
              <p className="text-sm text-muted-foreground">
                Open a unit to continue the move-in packet or review current inventory.
              </p>
            </div>

            <ul role="list" className="border-t border-border">
              {orderedUnits.map((unit) => (
                <li key={unit.id} className="border-b border-border">
                  {unit.id === "4b" ? (
                    <Link href={`/units/${unit.id}`} className="block py-4">
                      <UnitRow unit={unit} interactive />
                    </Link>
                  ) : (
                    <div className="py-4">
                      <UnitRow unit={unit} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}

function UnitRow({ unit, interactive = false }: { unit: Unit; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem] md:items-center",
        interactive && "border-l border-foreground pl-4",
      )}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h4 className="text-lg font-semibold tracking-tight">Unit {unit.unit}</h4>
          <StatusText status={unit.status} />
          {unit.petFriendly && (
            <span className="text-sm text-muted-foreground">Pet-friendly</span>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {unit.bedrooms} bed · {unit.bathrooms} bath · {unit.sqft} sqft · {unit.term}
          -month term
        </p>

        {interactive && unit.pendingTenantName && (
          <p className="text-sm text-foreground">
            {unit.pendingTenantName} is ready for the lease packet.
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-1 md:items-end">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(unit.rent)}
        </p>
        <p className="text-sm text-muted-foreground">per month</p>
        {interactive && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
            Open lease packet
            <ArrowUpRight className="size-4 shrink-0" />
          </span>
        )}
      </div>
    </div>
  )
}

function StatusText({ status }: { status: Unit["status"] }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", statusTone[status])} aria-hidden="true" />
      {getStatusLabel(status)}
    </span>
  )
}

function getStatItemClassName(index: number) {
  const classes = [
    "space-y-1 sm:border-b sm:pr-4 sm:pb-4 lg:border-b-0 lg:pr-4 lg:pb-0",
    "space-y-1 sm:border-b sm:border-l sm:pl-4 sm:pb-4 lg:border-b-0 lg:px-4 lg:pb-0",
    "space-y-1 sm:pt-4 sm:pr-4 lg:border-l lg:px-4 lg:pt-0",
    "space-y-1 sm:border-l sm:pt-4 sm:pl-4 lg:px-4 lg:pt-0 lg:pr-0",
  ]

  return classes[index] ?? "space-y-1"
}
