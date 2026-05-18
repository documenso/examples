"use client"

import { useState, type ElementType, type ReactNode } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"
import {
  AlertCircle,
  Car,
  CheckCircle2,
  ClipboardList,
  Fence,
  FileText,
  Snowflake,
  WashingMachine,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useLeasingSession } from "@/components/leasing-session-provider"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  formatLeaseDate,
  getStatusLabel,
  type UnitStatus,
} from "@/lib/mock-data"

type SigningStep =
  | "idle"
  | "preparing-lease"
  | "signing-lease"
  | "addendum-required"
  | "preparing-addendum"
  | "signing-addendum"
  | "complete"

interface GeneratedDocument {
  signingToken: string
  documentId: number
}

const embedHost = process.env.NEXT_PUBLIC_DOCUMENSO_HOST ?? "https://app.documenso.com"

const amenityIcons: Record<string, ElementType> = {
  "In-unit W/D": WashingMachine,
  Balcony: Fence,
  "Central AC": Snowflake,
}

const moveInChecklist = [
  "Schedule walkthrough",
  "Set up utilities",
  "Get keys from leasing office",
]

const signingStepLabels: Record<SigningStep, string> = {
  idle: "Ready to send",
  "preparing-lease": "Preparing lease",
  "signing-lease": "Lease in signature",
  "addendum-required": "Pet addendum required",
  "preparing-addendum": "Preparing addendum",
  "signing-addendum": "Addendum in signature",
  complete: "Packet complete",
}

const statusTone = {
  occupied: "bg-zinc-300",
  vacant: "bg-zinc-700",
  "lease-pending": "bg-amber-500",
  leased: "bg-zinc-950",
} satisfies Record<UnitStatus, string>

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong while preparing the Documenso signing flow."
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function UnitDetail({ unitId }: { unitId: string }) {
  const { completedPackets, getUnitById, markUnitLeased } = useLeasingSession()
  const unit = getUnitById(unitId)

  const completedPacket = unit ? completedPackets[unit.id] : undefined
  const [step, setStep] = useState<SigningStep>(completedPacket ? "complete" : "idle")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tenantEmail, setTenantEmail] = useState(completedPacket?.tenantEmail ?? "")
  const [error, setError] = useState<string | null>(null)
  const [leaseToken, setLeaseToken] = useState<string | null>(null)
  const [leaseDocumentId, setLeaseDocumentId] = useState<number | null>(
    completedPacket?.leaseDocumentId ?? null,
  )
  const [addendumToken, setAddendumToken] = useState<string | null>(null)
  const [addendumDocumentId, setAddendumDocumentId] = useState<number | null>(
    completedPacket?.petAddendumDocumentId ?? null,
  )

  const tenantName = unit?.pendingTenantName ?? completedPacket?.tenantName ?? "Jordan Lee"
  const emailReady = isValidEmail(tenantEmail.trim())

  if (!unit) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4 shrink-0" />
        <AlertTitle>Unit unavailable</AlertTitle>
        <AlertDescription>
          This unit could not be loaded from the current leasing session.
        </AlertDescription>
      </Alert>
    )
  }

  const activeUnit = unit
  const leaseWindow =
    activeUnit.leaseStartDate && activeUnit.leaseEndDate
      ? `${formatLeaseDate(activeUnit.leaseStartDate)} – ${formatLeaseDate(activeUnit.leaseEndDate)}`
      : null
  const isComplete = step === "complete" || Boolean(completedPacket)
  const displayStatus = isComplete ? "leased" : activeUnit.status
  const canCreateAddendum =
    activeUnit.petFriendly && typeof activeUnit.petDeposit === "number"
  const leasePacketReady = Boolean(activeUnit.leaseStartDate && activeUnit.leaseEndDate)
  const canSendLease = activeUnit.status === "lease-pending" && !completedPacket
  const packetStage = isComplete ? signingStepLabels.complete : signingStepLabels[step]
  const packetStageSummary = isComplete
    ? "All required documents are signed and the unit now reads as leased in the portfolio."
    : canCreateAddendum
      ? "Lease and pet paperwork will run as one move-in packet once the lease is signed."
      : "Lease details are ready to send as soon as the tenant email is confirmed."

  async function requestDocument(
    templateEnvVar: "DOCUMENSO_TEMPLATE_LEASE" | "DOCUMENSO_TEMPLATE_PET_ADDENDUM",
  ): Promise<GeneratedDocument> {
    const response = await fetch("/api/generate-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateEnvVar,
        tenantName,
        tenantEmail: tenantEmail.trim(),
        unitNumber: activeUnit.unit,
        monthlyRent: activeUnit.rent,
        securityDeposit: activeUnit.securityDeposit,
        petDeposit: activeUnit.petDeposit,
        leaseStartDate: activeUnit.leaseStartDate,
        leaseEndDate: activeUnit.leaseEndDate,
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      throw new Error(
        typeof payload.error === "string"
          ? payload.error
          : "Documenso rejected the document request.",
      )
    }

    if (!payload.signingToken || typeof payload.documentId !== "number") {
      throw new Error("Documenso did not return a signing token for this document.")
    }

    return {
      signingToken: payload.signingToken,
      documentId: payload.documentId,
    }
  }

  async function handleSendLease() {
    if (!emailReady || !leasePacketReady) {
      return
    }

    setDialogOpen(false)
    setError(null)
    setStep("preparing-lease")

    try {
      const document = await requestDocument("DOCUMENSO_TEMPLATE_LEASE")
      setLeaseToken(document.signingToken)
      setLeaseDocumentId(document.documentId)
      setStep("signing-lease")
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setStep("idle")
    }
  }

  async function launchPetAddendum() {
    setError(null)
    setStep("preparing-addendum")

    try {
      const document = await requestDocument("DOCUMENSO_TEMPLATE_PET_ADDENDUM")
      setAddendumToken(document.signingToken)
      setAddendumDocumentId(document.documentId)
      setStep("signing-addendum")
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setStep("addendum-required")
    }
  }

  function finalizeLease(packetPetAddendumDocumentId?: number) {
    if (!leaseDocumentId) {
      setError(
        "The completed lease did not return a document ID, so the unit cannot be marked leased.",
      )
      return
    }

    markUnitLeased(activeUnit.id, {
      tenantName,
      tenantEmail: tenantEmail.trim(),
      leaseDocumentId,
      petAddendumDocumentId: packetPetAddendumDocumentId,
    })

    setStep("complete")
    setError(null)
  }

  async function handleLeaseCompleted() {
    if (!canCreateAddendum) {
      finalizeLease()
      return
    }

    await launchPetAddendum()
  }

  function handleAddendumCompleted() {
    finalizeLease(addendumDocumentId ?? undefined)
  }

  function renderActionButton(className?: string) {
    if (!canSendLease) {
      return null
    }

    return (
      <Button type="button" onClick={() => setDialogOpen(true)} className={className}>
        <FileText className="size-4 shrink-0" />
        Send lease to tenant
      </Button>
    )
  }

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Leasing workspace</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Unit {activeUnit.unit}
            </h1>
            <StatusText status={displayStatus} />
            {activeUnit.petFriendly && (
              <span className="text-sm text-muted-foreground">Pet-friendly</span>
            )}
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(activeUnit.rent)}
            </p>
            <p className="pb-1 text-sm text-muted-foreground">per month</p>
          </div>
          <p className="max-w-[64ch] text-base text-muted-foreground text-pretty">
            Review the move-in packet for {tenantName}, confirm lease details, and
            continue the embedded signing flow when the paperwork is ready.
          </p>
        </div>

        {renderActionButton()}
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="space-y-8">
          <DetailSection title="Lease context">
            <DetailGrid>
              <DetailItem label="Tenant" value={tenantName} />
              <DetailItem
                label="Tenant email"
                value={completedPacket?.tenantEmail || tenantEmail.trim() || "Not entered yet"}
              />
              <DetailItem label="Lease window" value={leaseWindow ?? `${activeUnit.term} months`} />
              <DetailItem label="Packet stage" value={packetStage} />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Home details">
            <DetailGrid>
              <DetailItem label="Bedrooms" value={`${activeUnit.bedrooms}`} />
              <DetailItem label="Bathrooms" value={`${activeUnit.bathrooms}`} />
              <DetailItem label="Square feet" value={`${activeUnit.sqft}`} />
              <DetailItem label="Lease term" value={`${activeUnit.term} months`} />
              <DetailItem label="Parking" value={activeUnit.parkingSpot ?? "None assigned"} />
              <DetailItem
                label="Pet policy"
                value={activeUnit.petFriendly ? "Pet-friendly" : "No pets listed"}
              />
              <DetailItem label="Amenities" value={activeUnit.amenities.join(", ")} />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Deposits">
            <DetailGrid>
              <DetailItem
                label="Security deposit"
                value={formatCurrency(activeUnit.securityDeposit)}
                tabular
              />
              <DetailItem
                label="Pet deposit"
                value={
                  typeof activeUnit.petDeposit === "number"
                    ? formatCurrency(activeUnit.petDeposit)
                    : "Not required"
                }
                tabular={typeof activeUnit.petDeposit === "number"}
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Move-in packet">
            <DetailGrid>
              <DetailItem label="Lease agreement" value={leaseWindow ?? "Lease dates pending"} />
              <DetailItem
                label="Pet addendum"
                value={
                  typeof activeUnit.petDeposit === "number"
                    ? `${formatCurrency(activeUnit.petDeposit)} pet deposit`
                    : "Not required for this unit"
                }
              />
              {leaseDocumentId && (
                <DetailItem label="Lease document" value={`#${leaseDocumentId}`} tabular />
              )}
              {addendumDocumentId && (
                <DetailItem label="Addendum document" value={`#${addendumDocumentId}`} tabular />
              )}
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Amenities in use">
            <ul role="list" className="grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2">
              {activeUnit.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] ?? (amenity.startsWith("Parking") ? Car : null)

                return (
                  <li key={amenity} className="flex items-center gap-2 text-muted-foreground">
                    {Icon && <Icon className="size-4 shrink-0 stroke-muted-foreground" />}
                    <span>{amenity}</span>
                  </li>
                )
              })}
            </ul>
          </DetailSection>
        </div>

        <aside className="space-y-6 border-l border-border pl-6 lg:pl-8">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Packet status</p>
            <p className="text-2xl font-semibold tracking-tight text-balance">
              {packetStage}
            </p>
            <p className="text-sm text-muted-foreground text-pretty">
              {packetStageSummary}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Primary signer</p>
            <p className="text-lg font-semibold">{tenantName}</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Security deposit is {formatCurrency(activeUnit.securityDeposit)}.
              {typeof activeUnit.petDeposit === "number"
                ? ` Pet deposit is ${formatCurrency(activeUnit.petDeposit)}.`
                : ""}
            </p>
          </div>

          {isComplete ? (
            <div className="border-l-2 border-zinc-950 pl-4 text-sm text-muted-foreground">
              Packet complete. The home now appears as leased in this session.
            </div>
          ) : canSendLease ? (
            <div className="space-y-3">
              <div className="border-l-2 border-amber-500 pl-4 text-sm text-muted-foreground">
                Lease details are prepared for the next send step.
              </div>
              {renderActionButton("w-full justify-center")}
            </div>
          ) : (
            <div className="border-l-2 border-border pl-4 text-sm text-muted-foreground">
              Signing activity will appear here as documents are generated.
            </div>
          )}
        </aside>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-balance">Send lease packet</DialogTitle>
            <DialogDescription className="text-pretty">
              We&apos;ll prepare the lease and pet paperwork for {tenantName}. Add the
              tenant email to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">
            <dl className="grid gap-3 text-sm">
              <PacketMetaItem label="Tenant on file" value={tenantName} />
              <PacketMetaItem
                label="Lease term"
                value={leaseWindow ?? `${activeUnit.term} months`}
              />
              <PacketMetaItem
                label="Security deposit"
                value={formatCurrency(activeUnit.securityDeposit)}
                tabular
              />
              {typeof activeUnit.petDeposit === "number" && (
                <PacketMetaItem
                  label="Pet deposit"
                  value={formatCurrency(activeUnit.petDeposit)}
                  tabular
                />
              )}
            </dl>

            <div className="space-y-2">
              <Label htmlFor="tenant-email">Tenant email</Label>
              <Input
                id="tenant-email"
                name="tenant-email"
                type="email"
                placeholder="jordan@example.com"
                value={tenantEmail}
                onChange={(event) => setTenantEmail(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleSendLease}
              disabled={!emailReady || !leasePacketReady}
            >
              Generate and send packet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4 shrink-0" />
          <AlertTitle>Signing flow error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(step === "preparing-lease" || step === "preparing-addendum") && (
        <section className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center gap-3">
            <Spinner className="size-5 stroke-foreground" />
            <p className="text-sm text-muted-foreground">
              {step === "preparing-lease"
                ? "Preparing the lease packet."
                : "Preparing the pet addendum."}
            </p>
          </div>
        </section>
      )}

      {step === "signing-lease" && leaseToken && (
        <section className="space-y-4 border-t border-border pt-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-balance">
              Sign lease agreement
            </h2>
            <p className="text-sm text-muted-foreground">
              Complete the embedded signing step for Unit {activeUnit.unit}.
            </p>
          </div>
          <div className="overflow-hidden rounded-md border border-border/70 bg-background">
            <EmbedSignDocument
              token={leaseToken}
              host={embedHost}
              name={tenantName}
              lockName
              onDocumentCompleted={() => {
                void handleLeaseCompleted()
              }}
              onDocumentError={(message) => {
                setLeaseToken(null)
                setError(message || "The embedded lease could not be loaded.")
                setStep("idle")
              }}
              className="h-[680px] w-full"
            />
          </div>
        </section>
      )}

      {step === "addendum-required" && (
        <section className="space-y-3 border-t border-border pt-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-balance">
              Pet addendum required
            </h2>
            <p className="text-sm text-muted-foreground text-pretty">
              The lease is complete. Send the pet paperwork to finish the move-in
              packet and mark Unit {activeUnit.unit} as leased.
            </p>
          </div>
          <Button type="button" onClick={() => void launchPetAddendum()}>
            Send pet addendum
          </Button>
        </section>
      )}

      {step === "signing-addendum" && addendumToken && (
        <section className="space-y-4 border-t border-border pt-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-balance">
              Sign pet addendum
            </h2>
            <p className="text-sm text-muted-foreground">
              Complete the second signing step for Unit {activeUnit.unit}.
            </p>
          </div>
          <div className="overflow-hidden rounded-md border border-border/70 bg-background">
            <EmbedSignDocument
              token={addendumToken}
              host={embedHost}
              name={tenantName}
              lockName
              onDocumentCompleted={handleAddendumCompleted}
              onDocumentError={(message) => {
                setAddendumToken(null)
                setError(message || "The embedded pet addendum could not be loaded.")
                setStep("addendum-required")
              }}
              className="h-[680px] w-full"
            />
          </div>
        </section>
      )}

      {step === "complete" && completedPacket && (
        <section className="space-y-6 border-t border-border pt-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Lease packet complete</span>
            </div>
            <p className="max-w-[62ch] text-sm text-muted-foreground text-pretty">
              {completedPacket.petAddendumDocumentId
                ? `${completedPacket.tenantName} signed the lease and pet addendum for Unit ${activeUnit.unit}.`
                : `${completedPacket.tenantName} signed the lease for Unit ${activeUnit.unit}.`}
            </p>
          </div>

          <DetailGrid>
            <DetailItem label="Tenant email" value={completedPacket.tenantEmail} />
            <DetailItem label="Lease document" value={`#${completedPacket.leaseDocumentId}`} tabular />
            {completedPacket.petAddendumDocumentId && (
              <DetailItem
                label="Addendum document"
                value={`#${completedPacket.petAddendumDocumentId}`}
                tabular
              />
            )}
          </DetailGrid>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ClipboardList className="size-4 shrink-0" />
              <span>Move-in checklist</span>
            </div>
            <ul role="list" className="space-y-2">
              {moveInChecklist.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked disabled aria-label={item} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}

function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-balance">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function DetailGrid({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-10 gap-y-5 text-sm sm:grid-cols-2">{children}</dl>
}

function DetailItem({
  label,
  value,
  tabular = false,
}: {
  label: string
  value: string
  tabular?: boolean
}) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium text-pretty", tabular && "tabular-nums")}>{value}</dd>
    </div>
  )
}

function PacketMetaItem({
  label,
  value,
  tabular = false,
}: {
  label: string
  value: string
  tabular?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", tabular && "tabular-nums")}>{value}</dd>
    </div>
  )
}

function StatusText({ status }: { status: UnitStatus }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", statusTone[status])} aria-hidden="true" />
      {getStatusLabel(status)}
    </span>
  )
}
