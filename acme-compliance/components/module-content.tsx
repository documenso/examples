"use client"

import type { CSSProperties } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { EmbedSignDocument } from "@documenso/embed-react"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhaseStepper, type PhaseStep } from "@/components/phase-stepper"
import { SiteHeader } from "@/components/site-header"
import { useCertifications } from "@/hooks/use-certifications"
import {
  mergeModuleWithCertification,
  saveCertification,
} from "@/lib/certification-store"
import type { TrainingModule } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type Phase = "training" | "signing-form" | "signing" | "certified"

function getAutoplayVideoUrl(videoUrl: string) {
  const url = new URL(videoUrl)

  url.searchParams.set("autoplay", "1")
  url.searchParams.set("playsinline", "1")

  return url.toString()
}

function SummaryItem({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

export function ModuleContent({ module }: { module: TrainingModule }) {
  const certifications = useCertifications()
  const storedCertification = certifications[module.id]
  const resolvedModule = useMemo(
    () => mergeModuleWithCertification(module, storedCertification),
    [module, storedCertification]
  )
  const autoplayVideoUrl = useMemo(
    () => getAutoplayVideoUrl(resolvedModule.videoUrl),
    [resolvedModule.videoUrl]
  )
  const isCertified = resolvedModule.status === "certified"

  const [checked, setChecked] = useState<boolean[]>(
    module.keyPoints.map(() => false)
  )
  const [phase, setPhase] = useState<Phase>(
    isCertified ? "certified" : "training"
  )
  const [name, setName] = useState(storedCertification?.workerName ?? "")
  const [email, setEmail] = useState("")
  const [signingToken, setSigningToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<number | undefined>(
    storedCertification?.documentId
  )
  const [certDate, setCertDate] = useState(resolvedModule.certifiedDate ?? "")
  const [expDate, setExpDate] = useState(resolvedModule.expiryDate ?? "")

  const isComplete = isCertified || phase === "certified"
  const allChecked = checked.every(Boolean)
  const confirmedCount = checked.filter(Boolean).length
  const completionPercent = Math.round(
    (confirmedCount / resolvedModule.keyPoints.length) * 100
  )
  const progressStyle = {
    "--progress": `${completionPercent}%`,
  } as CSSProperties

  const steps = useMemo<PhaseStep[]>(() => {
    if (isComplete) {
      return [
        { label: "Review", detail: "Module watched", state: "complete" },
        {
          label: "Acknowledge",
          detail: "Points confirmed",
          state: "complete",
        },
        {
          label: "Signer details",
          detail: "Record prepared",
          state: "complete",
        },
        { label: "Sign", detail: "Document finished", state: "complete" },
        { label: "Certified", detail: "Record stored", state: "active" },
      ]
    }

    return [
      {
        label: "Review",
        detail: "Watch module",
        state: phase === "training" && !allChecked ? "active" : "complete",
      },
      {
        label: "Acknowledge",
        detail: "Confirm points",
        state:
          phase === "training"
            ? allChecked
              ? "active"
              : "pending"
            : "complete",
      },
      {
        label: "Signer details",
        detail: "Prefill record",
        state: phase === "signing-form" ? "active" : "pending",
      },
      {
        label: "Sign",
        detail: "Documenso",
        state: phase === "signing" ? "active" : "pending",
      },
      { label: "Certified", detail: "Completion stored", state: "pending" },
    ]
  }, [allChecked, isComplete, phase])

  useEffect(() => {
    if (!storedCertification) {
      return
    }

    setName((currentValue) => currentValue || storedCertification.workerName)
    setDocumentId(storedCertification.documentId)
    setCertDate(storedCertification.certifiedDate)
    setExpDate(storedCertification.expiryDate)
    setPhase("certified")
    setChecked(module.keyPoints.map(() => true))
  }, [module.keyPoints, storedCertification])

  function toggleCheck(index: number) {
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)))
  }

  function handleMarkComplete() {
    setPhase("signing-form")
  }

  async function handleGenerateDocument() {
    if (!name.trim() || !email.trim()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          moduleName: resolvedModule.title,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(
          data?.error || "Failed to generate certification document"
        )
      }

      const data = await res.json()
      setSigningToken(data.signingToken)
      setDocumentId(data.documentId)
      setCertDate(data.completionDate)
      setExpDate(data.expiryDate)
      setPhase("signing")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader
        aside={
          <span
            className={cn(
              isComplete ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {isComplete ? "Certified" : "In progress"}
          </span>
        }
      />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to modules
        </Link>

        <section className="panel p-6 sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  Assigned module
                </span>
                <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {resolvedModule.oshaRef}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-[14ch] text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                  {resolvedModule.title}
                </h1>
                <p className="max-w-[60ch] text-base text-pretty text-muted-foreground">
                  {resolvedModule.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 border-t border-border pt-4 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
              <SummaryItem
                label="Duration"
                value={resolvedModule.duration}
                detail="Estimated review time"
              />
              <SummaryItem
                label="Checkpoints"
                value={resolvedModule.keyPoints.length.toString()}
                detail="Required acknowledgements"
              />
              <SummaryItem
                label={isComplete ? "Status" : "Next step"}
                value={
                  isComplete
                    ? "Certified"
                    : phase === "signing"
                      ? "Sign now"
                      : phase === "signing-form"
                        ? "Enter details"
                        : allChecked
                          ? "Continue"
                          : "Review"
                }
                detail={
                  isComplete
                    ? `Expires ${expDate || "on file"}`
                    : phase === "training"
                      ? "Finish acknowledgements"
                      : "Complete the active step"
                }
              />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <PhaseStepper steps={steps} />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-8">
            {!isComplete ? (
              <section className="panel overflow-hidden">
                <div className="border-b border-border px-6 py-4 sm:px-8">
                  <p className="section-label">Training video</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    Review the module
                  </h2>
                </div>

                <div className="aspect-video bg-black">
                  <iframe
                    src={autoplayVideoUrl}
                    title={`${resolvedModule.title} training video`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </section>
            ) : null}

            <section className="panel p-6 sm:p-8">
              <div className="space-y-3">
                <p className="section-label">
                  {isComplete
                    ? "Certification scope"
                    : "Required acknowledgements"}
                </p>
                <h2 className="max-w-[30ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
                  {isComplete ? "What this record covers" : "Acknowledgements"}
                </h2>
                <p className="max-w-[64ch] text-base text-pretty text-muted-foreground">
                  {isComplete
                    ? "These are the checkpoints confirmed as part of the signed training record."
                    : "Each item must be confirmed before signer details and document generation are available."}
                </p>
              </div>

              <ul role="list" className="mt-6 space-y-3">
                {resolvedModule.keyPoints.map((point, index) => (
                  <li key={point} className="flex items-start gap-3">
                    <Checkbox
                      id={`point-${index}`}
                      checked={checked[index]}
                      onCheckedChange={() => toggleCheck(index)}
                      disabled={phase !== "training"}
                      className="mt-1 border-border bg-white data-checked:border-foreground data-checked:bg-foreground data-checked:text-background"
                    />
                    <div className="min-w-0">
                      <Label
                        htmlFor={`point-${index}`}
                        className="cursor-pointer text-sm/6 font-medium text-foreground"
                      >
                        {point}
                      </Label>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {phase === "signing" && signingToken ? (
              <section className="panel overflow-hidden">
                <div className="border-b border-border px-6 py-4 sm:px-8">
                  <p className="section-label">Document workspace</p>
                  <h2 className="mt-2 max-w-[24ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
                    Sign the certificate
                  </h2>
                </div>

                <EmbedSignDocument
                  token={signingToken}
                  host={
                    process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
                    "https://app.documenso.com"
                  }
                  onDocumentCompleted={() => {
                    saveCertification({
                      moduleId: resolvedModule.id,
                      workerName: name.trim(),
                      certifiedDate: certDate,
                      expiryDate: expDate,
                      documentId,
                    })
                    setPhase("certified")
                  }}
                  onDocumentReady={() => {}}
                  onDocumentError={(err) =>
                    console.error("Signing error:", err)
                  }
                  className="h-[720px] w-full bg-background"
                />
              </section>
            ) : null}

            {isComplete ? (
              <section className="panel p-6 sm:p-8">
                <div className="space-y-3">
                  <p className="section-label">Record</p>
                  <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
                    Certification complete
                  </h2>
                  <p className="max-w-[56ch] text-sm text-muted-foreground">
                    This module is complete and the signed record is on file.
                  </p>
                </div>

                <dl className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm text-muted-foreground">Certified</dt>
                    <dd className="mt-1 text-base font-medium text-foreground tabular-nums">
                      {certDate || "Recorded"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Expires</dt>
                    <dd className="mt-1 text-base font-medium text-foreground tabular-nums">
                      {expDate || "On file"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Document</dt>
                    <dd className="mt-1 text-base font-medium text-foreground tabular-nums">
                      {documentId ? `#${documentId}` : "Saved"}
                    </dd>
                  </div>
                </dl>

                <Link
                  href="/"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  Return to dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            {phase === "training" ? (
              <section className="panel p-6">
                <p className="section-label">Progress</p>
                <h3 className="mt-2 max-w-[18ch] text-2xl font-semibold tracking-tight text-balance text-foreground">
                  Acknowledge each point to continue.
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {confirmedCount} of {resolvedModule.keyPoints.length} points
                  confirmed.
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-sm bg-muted">
                  <div
                    className="h-full w-(--progress) rounded-sm bg-foreground transition-[width]"
                    style={progressStyle}
                  />
                </div>

                <Button
                  onClick={handleMarkComplete}
                  disabled={!allChecked}
                  className="mt-6 w-full"
                >
                  Continue to signer details
                </Button>
              </section>
            ) : null}

            {phase === "signing-form" ? (
              <section className="panel p-6">
                <p className="section-label">Signer details</p>
                <h3 className="mt-2 max-w-[18ch] text-2xl font-semibold tracking-tight text-balance text-foreground">
                  Prepare the certificate.
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  These details prefill the final training record.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">
                      Full name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white text-sm"
                    />
                  </div>

                  {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : null}

                  <Button
                    onClick={handleGenerateDocument}
                    disabled={!name.trim() || !email.trim() || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Generate signing document
                  </Button>
                </div>
              </section>
            ) : null}

            {phase === "signing" ? (
              <section className="panel p-6">
                <p className="section-label">Signature in progress</p>
                <h3 className="mt-2 max-w-[18ch] text-2xl font-semibold tracking-tight text-balance text-foreground">
                  Your document is ready.
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Review the certificate and complete the signature.
                </p>

                <div className="mt-5 rounded-lg border border-border bg-muted p-4">
                  <p className="text-sm font-medium text-foreground">
                    Record details
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p>{name || "Signer name pending"}</p>
                    <p>{email || "Signer email pending"}</p>
                    {documentId ? <p>Document #{documentId}</p> : null}
                  </div>
                </div>
              </section>
            ) : null}

            {isComplete ? null : null}
          </aside>
        </section>
      </main>
    </div>
  )
}
