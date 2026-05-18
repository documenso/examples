"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  ClipboardCheck,
  FileClock,
  FlaskConical,
  MapPin,
  User,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import type { Participant } from "@/lib/mock-data"
import { STUDY } from "@/lib/mock-data"
import {
  deriveParticipantStatus,
  formatParticipantConsentTimestamp,
  getParticipantAuditHref,
} from "@/lib/participant-consents"
import { useParticipantConsents } from "@/hooks/use-participant-consents"
import { StatusBadge } from "@/components/status-badge"
import { ConsentForm } from "@/components/consent-form"

export function ParticipantDetail({ participant }: { participant: Participant }) {
  const { records } = useParticipantConsents()
  const consent = records[participant.id]
  const derived = deriveParticipantStatus(participant, consent)
  const auditHref = getParticipantAuditHref(participant.id, consent)
  const consentTimestamp = derived.consentDate
    ? formatParticipantConsentTimestamp(derived.consentDate, {
        pattern: "MMMM d, yyyy 'at' h:mm a",
      })
    : null

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Study dashboard
        </Link>
      </div>

      <section className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {participant.id} · {STUDY.id}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {participant.name}
          </h1>
          <p className="max-w-[60ch] text-sm text-muted-foreground">
            {participant.site} · {participant.visitSchedule}
          </p>
        </div>
        <StatusBadge status={derived.status} />
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-8">
          <DetailSection
            title="Participant details"
            icon={<User className="size-4 shrink-0 stroke-primary" />}
          >
            <DetailGrid>
              <DetailItem label="Full name" value={participant.name} />
              <DetailItem label="Date of birth" value={participant.dob} />
              <DetailItem label="Sex" value={participant.sex} />
              <DetailItem
                label="Protocol version"
                value={participant.protocolVersion}
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection
            title="Study context"
            icon={<FlaskConical className="size-4 shrink-0 stroke-primary" />}
          >
            <DetailGrid>
              <DetailItem
                label="Site"
                value={participant.site}
                icon={<MapPin className="size-4 shrink-0 stroke-muted-foreground" />}
              />
              <DetailItem
                label="Randomization"
                value={participant.randomizationStatus}
              />
              <DetailItem
                label="Visit schedule"
                value={participant.visitSchedule}
                icon={<Calendar className="size-4 shrink-0 stroke-muted-foreground" />}
              />
              <DetailItem label="Study title" value={STUDY.title} />
              <DetailItem label="Study ID" value={STUDY.id} />
              <DetailItem label="Sponsor" value={STUDY.sponsor} />
            </DetailGrid>
          </DetailSection>
        </div>

        <aside className="space-y-6 border-l border-border pl-6 lg:pl-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ClipboardCheck className="size-4 shrink-0 stroke-primary" />
              <span>Informed consent</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Current protocol
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {participant.protocolVersion}
              </p>
              <p className="text-sm text-pretty text-muted-foreground">
                Template values should pre-fill participant name, study
                ID, protocol version, and site name before signing
                begins.
              </p>
            </div>

            {consentTimestamp ? (
              <div className="space-y-1 rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-4 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                <p className="text-sm font-medium">Consent collected</p>
                <p className="text-sm">
                  Participant status changed to Consented on {consentTimestamp}.
                </p>
              </div>
            ) : derived.status === "pending" ? (
              <div className="space-y-1 rounded-lg border border-amber-200/80 bg-amber-50/70 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="text-sm font-medium">Signature required</p>
                <p className="text-sm">
                  Consent can be recorded once the participant completes the
                  embedded signing flow.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No signed ICF recorded for this browser session yet.
              </div>
            )}
          </div>
        </aside>
      </section>

      {derived.status === "pending" ? (
        <ConsentForm participant={participant} />
      ) : derived.status === "consented" ? (
        <section className="flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Informed consent is complete.
            </p>
            <p className="text-sm text-muted-foreground">
              {consentTimestamp
                ? `Signed ${consentTimestamp}.`
                : "This participant is already marked consented in the mock roster."}
            </p>
          </div>
          {auditHref ? (
            <Link href={auditHref} className={buttonVariants({ variant: "outline" })}>
              <FileClock className="size-4 shrink-0" />
              View audit trail
            </Link>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Audit trail becomes available for consent collected in this demo
                session.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Participant is still in screening. Consent collection becomes
            available after screening is complete.
          </p>
        </section>
      )}
    </div>
  )
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-base font-medium">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-x-10 gap-y-5 text-sm sm:grid-cols-2">{children}</dl>
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="flex items-start gap-2 font-medium text-pretty">
        {icon}
        <span>{value}</span>
      </dd>
    </div>
  )
}
