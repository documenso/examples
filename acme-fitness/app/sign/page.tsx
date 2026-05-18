"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Dumbbell } from "lucide-react"
import Link from "next/link"
import { DocumensoDirectTemplate } from "@/components/documenso-direct-template"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  extractDocumensoTemplateToken,
  getConfiguredDocumensoHost,
  getConfiguredTemplateValue,
  resolveDocumensoHost,
} from "@/lib/documenso-signing"

export default function SignPage() {
  const [completed, setCompleted] = useState(false)
  const [embedStatus, setEmbedStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  )
  const configuredTemplateValue = getConfiguredTemplateValue()
  const configuredHost = getConfiguredDocumensoHost()
  const token = extractDocumensoTemplateToken(configuredTemplateValue)
  const host = resolveDocumensoHost(configuredHost, configuredTemplateValue)

  useEffect(() => {
    if (!token || completed) {
      return
    }

    const timeout = window.setTimeout(() => {
      setEmbedStatus((currentStatus) =>
        currentStatus === "loading" ? "error" : currentStatus,
      )
    }, 4000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [completed, token, host])

  if (!token) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center text-white">
        <Dumbbell className="size-12 shrink-0 stroke-amber-400" />
        <h1 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance">
          Template token required
        </h1>
        <p className="max-w-[48ch] text-base text-pretty text-neutral-400 sm:text-sm">
          Set{" "}
          <code className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-neutral-200">
            NEXT_PUBLIC_TEMPLATE_TOKEN
          </code>{" "}
          to a Documenso direct-link token or full direct-link URL to enable the
          AcmeFitness liability waiver flow.
        </p>
      </main>
    )
  }

  if (completed) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-center text-white">
        <CheckCircle2
          className="size-16 shrink-0 stroke-lime-400"
          strokeWidth={1.5}
        />
        <div className="flex flex-col gap-2">
          <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance">
            Waiver signed
          </h1>
          <p className="max-w-[40ch] text-base text-pretty text-neutral-400 sm:text-sm">
            You&apos;re ready to train at AcmeFitness.
          </p>
        </div>
        <Link
          href="/"
          className={buttonVariants({
            variant: "outline",
            className:
              "rounded-full border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10",
          })}
        >
          Back to kiosk
        </Link>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col bg-neutral-950 text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <Link
          href="/"
          aria-label="Homepage"
          className="flex w-fit items-center gap-3"
        >
          <Dumbbell className="size-6 shrink-0 stroke-lime-400" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold tracking-tight">AcmeFitness</span>
            <div className="text-base text-neutral-400 sm:text-sm">
              Liability waiver
            </div>
          </div>
        </Link>
      </header>

      {embedStatus === "error" ? (
        <div className="border-b border-amber-400/20 bg-amber-950/10 px-6 py-3 text-base text-amber-100 sm:text-sm">
          Embedded signing did not load. Check that{" "}
          <code className="rounded-md bg-amber-100/10 px-1 py-0.5 font-mono">
            NEXT_PUBLIC_TEMPLATE_TOKEN
          </code>{" "}
          is a valid Documenso direct-link token.
        </div>
      ) : null}

      <DocumensoDirectTemplate
        token={token}
        host={host}
        className="h-[calc(100dvh-73px)] w-full bg-white"
        onDocumentReady={() => {
          setEmbedStatus("ready")
        }}
        onDocumentCompleted={() => setCompleted(true)}
        onDocumentError={(error) => {
          setEmbedStatus("error")
          console.error("Documenso embed error", error)
        }}
      />
    </main>
  )
}
