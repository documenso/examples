"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { participants } from "@/lib/mock-data"
import {
  deriveParticipantStatus,
  formatParticipantConsentTimestamp,
  getParticipantAuditHref,
} from "@/lib/participant-consents"
import { useParticipantConsents } from "@/hooks/use-participant-consents"
import { StatusBadge } from "@/components/status-badge"

export function ParticipantRoster() {
  const { records } = useParticipantConsents()

  const roster = participants.map((participant) => {
    const consent = records[participant.id]
    const derived = deriveParticipantStatus(participant, consent)

    return {
      ...participant,
      consent,
      status: derived.status,
      consentDate: derived.consentDate,
    }
  })

  const stats = {
    total: roster.length,
    consented: roster.filter((participant) => participant.status === "consented").length,
    pending: roster.filter((participant) => participant.status === "pending").length,
    screening: roster.filter((participant) => participant.status === "screening").length,
  }

  const statItems = [
    { label: "Participants", value: stats.total },
    { label: "Consented", value: stats.consented },
    { label: "Pending", value: stats.pending },
    { label: "Screening", value: stats.screening },
  ]

  return (
    <div className="space-y-8">
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

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-balance">
            Participant roster
          </h2>
          <p className="text-sm text-muted-foreground">
            Track consent progress and open a participant record for the full
            signing flow.
          </p>
        </div>

        <div className="-mx-6 -my-2 overflow-x-auto whitespace-nowrap">
          <div className="inline-block min-w-full px-6 py-2 align-middle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Consent timestamp</TableHead>
                  <TableHead className="text-right">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.map((participant) => {
                  const auditHref = getParticipantAuditHref(
                    participant.id,
                    participant.consent,
                  )

                  return (
                    <TableRow key={participant.id} className="hover:bg-transparent">
                      <TableCell>
                        <Link
                          href={`/participants/${participant.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {participant.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {participant.dob}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {participant.site}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={participant.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {formatParticipantConsentTimestamp(participant.consentDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {auditHref ? (
                          <Link
                            href={auditHref}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View trail
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
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
