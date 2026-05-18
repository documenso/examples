import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { StartOnboardingDialog } from "@/components/start-onboarding-dialog"
import { Button } from "@/components/ui/button"
import { formatAnnualFee } from "@/lib/mock-clients"
import { getProspectDetailData } from "@/lib/pipeline-data"

export const dynamic = "force-dynamic"

type DocumentRow = {
  label: string
  state: "ready" | "next" | "locked" | "signed"
}

function getDocumentRows(
  session: {
    imaSigned: boolean
    feeSigned: boolean
    advSigned: boolean
  } | null
): DocumentRow[] {
  if (!session) {
    return [
      { label: "Investment Management Agreement (IMA)", state: "ready" },
      { label: "Fee Acknowledgment", state: "ready" },
      { label: "ADV Part 2 Disclosure", state: "ready" },
    ]
  }

  return [
    {
      label: "Investment Management Agreement (IMA)",
      state: session.imaSigned ? "signed" : "next",
    },
    {
      label: "Fee Acknowledgment",
      state: session.feeSigned
        ? "signed"
        : session.imaSigned
          ? "next"
          : "locked",
    },
    {
      label: "ADV Part 2 Disclosure",
      state: session.advSigned
        ? "signed"
        : session.imaSigned && session.feeSigned
          ? "next"
          : "locked",
    },
  ]
}

function getDocumentStateMeta(state: DocumentRow["state"]) {
  if (state === "signed") {
    return {
      label: "Signed",
      detail: "Completed and stored in the packet",
    }
  }

  if (state === "next") {
    return {
      label: "Next",
      detail: "Ready for the signer right now",
    }
  }

  if (state === "locked") {
    return {
      label: "Locked",
      detail: "Unlocks after the prior document is complete",
    }
  }

  return {
    label: "Ready",
    detail: "Can be launched when the packet starts",
  }
}

function getStageLabel(stage: "prospect" | "onboarding" | "active") {
  if (stage === "active") {
    return "Active client"
  }

  if (stage === "onboarding") {
    return "In onboarding"
  }

  return "Prospect"
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await getProspectDetailData(id)

  if (!detail) {
    notFound()
  }

  const {
    annualFee,
    aumLabel,
    feeLabel,
    prospect,
    session,
    signedCount,
    stage,
    totalDocs,
  } = detail
  const documentRows = getDocumentRows(session)

  return (
    <div className="isolate min-h-dvh bg-background">
      <AppHeader
        subtitle="Household profile"
        meta="Three-document advisory packet"
        containerClassName="max-w-6xl"
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to advisory pipeline
        </Link>

        <section className="border-b border-border/70 pb-8">
          <div className="grid gap-8 lg:grid-cols-[11fr_5fr] lg:items-end">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                {getStageLabel(stage)}
              </p>
              <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance">
                {prospect.name}
              </h1>
              <p className="max-w-[58ch] text-base text-pretty text-muted-foreground">
                {prospect.investmentGoals}. Meridian will use the standard
                advisory packet to turn this household into an active client.
              </p>
            </div>

            <div className="border-t border-border/70 pt-4 lg:pt-0 lg:pl-8">
              <p className="text-sm text-muted-foreground">
                Estimated annual advisory fee
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
                {formatAnnualFee(annualFee)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                Effective rate {feeLabel} on {aumLabel} AUM
              </p>
            </div>
          </div>
        </section>

        <section className="grid border-b border-border/70 py-6 sm:grid-cols-3">
          {[
            {
              label: "Assets under management",
              value: aumLabel,
              detail: "Current household asset base",
            },
            {
              label: "Risk profile",
              value: prospect.riskProfile,
              detail: "Used to align the advisory mandate",
            },
            {
              label: "Packet progress",
              value:
                stage === "prospect"
                  ? "Not started"
                  : `${signedCount}/${totalDocs} signed`,
              detail:
                stage === "active"
                  ? "Packet complete and relationship active"
                  : "Three documents required before activation",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className={[
                "py-4",
                index > 0
                  ? "border-t border-border/70 sm:border-t-0 sm:border-l"
                  : "",
                index === 0 ? "sm:pr-6" : "",
                index === 1 ? "sm:px-6" : "",
                index === 2 ? "sm:pl-6" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <p className="truncate text-sm text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-10 py-8 lg:grid-cols-[8fr_7fr]">
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">
                Relationship overview
              </h2>
              <dl className="border-y border-border/70">
                <div className="flex items-start justify-between gap-4 py-4">
                  <dt className="text-sm text-muted-foreground">
                    Advisory relationship
                  </dt>
                  <dd className="max-w-[34ch] text-right text-sm font-medium text-foreground">
                    Discretionary investment management for long-term household
                    planning.
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-border/70 py-4">
                  <dt className="text-sm text-muted-foreground">
                    Investment goals
                  </dt>
                  <dd className="max-w-[34ch] text-right text-sm font-medium text-foreground">
                    {prospect.investmentGoals}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-border/70 py-4">
                  <dt className="text-sm text-muted-foreground">
                    Fee structure
                  </dt>
                  <dd className="max-w-[34ch] text-right text-sm font-medium text-foreground">
                    1.00% on the first $1M, then 0.75% above that threshold.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">
                Fee schedule
              </h2>
              <div className="border-y border-border/70">
                <div className="flex items-center justify-between gap-4 py-4">
                  <p className="text-base text-foreground sm:text-sm">
                    First $1,000,000
                  </p>
                  <p className="text-base font-medium text-foreground tabular-nums sm:text-sm">
                    1.00%
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border/70 py-4">
                  <p className="text-base text-foreground sm:text-sm">
                    Over $1,000,000
                  </p>
                  <p className="text-base font-medium text-foreground tabular-nums sm:text-sm">
                    0.75%
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border/70 py-4">
                  <p className="text-base text-foreground sm:text-sm">
                    Effective rate on {aumLabel}
                  </p>
                  <p className="text-base font-medium text-primary tabular-nums sm:text-sm">
                    {feeLabel}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">
                Onboarding packet
              </h2>
              <p className="max-w-[56ch] text-base text-pretty text-muted-foreground">
                The household becomes active only after the packet is sent and
                every document is signed in sequence.
              </p>
            </div>

            <ul role="list" className="border-y border-border/70">
              {documentRows.map((document, index) => {
                const stateMeta = getDocumentStateMeta(document.state)

                return (
                  <li
                    key={document.label}
                    className="flex items-start justify-between gap-4 border-t border-border/70 py-4 first:border-t-0"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">
                        Document {index + 1}
                      </p>
                      <p className="text-base font-medium text-foreground sm:text-sm">
                        {document.label}
                      </p>
                      <p className="text-base text-pretty text-muted-foreground sm:text-sm">
                        {stateMeta.detail}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {stateMeta.label}
                    </p>
                  </li>
                )
              })}
            </ul>

            {stage === "prospect" ? (
              <div className="flex flex-col gap-3 border-t border-border/70 pt-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    Packet not started
                  </p>
                  <p className="max-w-[50ch] text-base text-pretty text-muted-foreground">
                    Launch the packet when the household is ready. Meridian will
                    generate all three documents and hand the client into the
                    signing flow.
                  </p>
                </div>
                <StartOnboardingDialog
                  prospectId={prospect.id}
                  clientName={prospect.name}
                  aumLabel={aumLabel}
                  feeLabel={feeLabel}
                />
              </div>
            ) : stage === "onboarding" && session ? (
              <div className="flex flex-col gap-4 border-t border-border/70 pt-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    Live session
                  </p>
                  <p className="text-base text-pretty text-muted-foreground">
                    The current signer is {session.email}. Continue the packet
                    to keep documents moving in order.
                  </p>
                </div>
                <Link href={`/clients/${session.id}/onboarding`}>
                  <Button>Continue onboarding</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-t border-border/70 pt-6">
                <p className="text-sm font-medium text-foreground">
                  Packet complete
                </p>
                <p className="max-w-[50ch] text-base text-pretty text-muted-foreground">
                  All three documents are signed. This household is now active
                  and ready for ongoing advisory service.
                </p>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}
