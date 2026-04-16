"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AddendumStatus } from "@prisma/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { EmbedCreateEnvelopeV2, EmbedSignDocument } from "@documenso/embed-react"
import { CircleAlert, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddendumFlowProps {
  transaction: {
    id: string
    property: string
    price: string
    buyerName: string
    buyerEmail: string | null
    sellerName: string
    sellerEmail: string | null
  }
  initialAddendum: {
    id: string
    title: string
    buyerToken: string | null
    sellerToken: string | null
    buyerSigned: boolean
    sellerSigned: boolean
    status: AddendumStatus
  } | null
  host: string
}

interface RecipientValidation {
  expected: {
    buyer: {
      name: string
      email: string | null
    }
    seller: {
      name: string
      email: string | null
    }
  }
  actualSigners: Array<{
    name: string
    email: string
    sendStatus?: "NOT_SENT" | "SENT"
    signingOrder: number | null
  }>
}

interface AddendumMutationResponse {
  error?: string
  addendum?: AddendumFlowProps["initialAddendum"]
  recipientValidation?: RecipientValidation
}

function getRecipientMatchLabel(name: string, email: string | null) {
  return email ?? name
}

export function AddendumFlow({
  transaction,
  initialAddendum,
  host,
}: AddendumFlowProps) {
  const router = useRouter()
  const [presignToken, setPresignToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(!initialAddendum)
  const [currentAddendum, setCurrentAddendum] = useState(initialAddendum)
  const [authoringKey, setAuthoringKey] = useState(0)
  const [activeParty, setActiveParty] = useState<"buyer" | "seller" | null>(
    null,
  )
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipientValidation, setRecipientValidation] =
    useState<RecipientValidation | null>(null)

  const initializeAuthoringSession = useCallback(
    async ({
      preserveError = false,
      preserveValidation = false,
    }: {
      preserveError?: boolean
      preserveValidation?: boolean
    } = {}) => {
      setLoading(true)
      setPresignToken(null)

      if (!preserveError) {
        setError(null)
      }

      if (!preserveValidation) {
        setRecipientValidation(null)
      }

      try {
        const response = await fetch("/api/presign-token", { method: "POST" })
        const data = (await response.json()) as {
          error?: string
          presignToken?: string
        }

        if (!response.ok || !data.presignToken) {
          setError(data.error ?? "Failed to initialize addendum authoring.")
          return
        }

        setPresignToken(data.presignToken)
        setAuthoringKey((currentKey) => currentKey + 1)
      } catch (caughtError) {
        console.error("Failed to create addendum presign token:", caughtError)
        setError("Failed to initialize addendum authoring.")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (currentAddendum) {
      setLoading(false)
      return
    }

    void initializeAuthoringSession()
  }, [currentAddendum, initializeAuthoringSession])

  const allSigned = useMemo(
    () =>
      Boolean(
        currentAddendum?.buyerSigned &&
          currentAddendum?.sellerSigned &&
          currentAddendum.status === AddendumStatus.COMPLETED,
      ),
    [currentAddendum],
  )
  const expectedRecipients = [
    {
      key: "buyer",
      label: "Buyer",
      name: transaction.buyerName,
      email: transaction.buyerEmail,
    },
    {
      key: "seller",
      label: "Seller",
      name: transaction.sellerName,
      email: transaction.sellerEmail,
    },
  ] as const

  async function persistAddendum(envelopeId: string) {
    setProcessing(true)
    setError(null)
    setRecipientValidation(null)

    try {
      const response = await fetch(`/api/transactions/${transaction.id}/addendums`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envelopeId }),
      })

      const payload = (await response.json()) as AddendumMutationResponse

      if (!response.ok || !payload.addendum) {
        setRecipientValidation(payload.recipientValidation ?? null)
        setError(payload.error ?? "Failed to save the addendum.")
        return
      }

      setCurrentAddendum(payload.addendum)
      router.replace(
        `/transactions/${transaction.id}/addendum?addendumId=${payload.addendum.id}`,
      )
      router.refresh()
    } catch (caughtError) {
      console.error("Failed to save addendum:", caughtError)
      setError("Failed to save the addendum.")
    } finally {
      setProcessing(false)
    }
  }

  function handleEnvelopeCreated(data: { envelopeId: string | number }) {
    void persistAddendum(String(data.envelopeId))
  }

  async function handleSigningComplete(party: "buyer" | "seller") {
    if (!currentAddendum) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/transactions/${transaction.id}/addendums/${currentAddendum.id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ party }),
        },
      )

      const payload = (await response.json()) as AddendumMutationResponse

      if (!response.ok || !payload.addendum) {
        setError(payload.error ?? "Failed to record the addendum signature.")
        return
      }

      setCurrentAddendum(payload.addendum)
      setActiveParty(null)
      router.refresh()
    } catch (caughtError) {
      console.error("Failed to record addendum signing:", caughtError)
      setError("Failed to record the addendum signature.")
    } finally {
      setProcessing(false)
    }
  }

  if (allSigned && currentAddendum) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href={`/transactions/${transaction.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ChevronLeft className="size-4 shrink-0" />
          Back to transaction
        </Link>

        <div className="mx-auto flex max-w-xl flex-col gap-6 py-20 text-center">
          <div className="inline-flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="size-4 shrink-0" />
            Complete
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Addendum complete.
            </h1>
            <p className="text-base text-pretty text-muted-foreground">
              {currentAddendum.title} has been signed by both parties and added
              to the transaction record.
            </p>
          </div>
          <Link
            href={`/transactions/${transaction.id}`}
            className={buttonVariants()}
          >
            Return to transaction
          </Link>
        </div>
      </div>
    )
  }

  const parties = currentAddendum
    ? [
        {
          key: "buyer" as const,
          label: "Buyer",
          name: transaction.buyerName,
          token: currentAddendum.buyerToken,
          signed: currentAddendum.buyerSigned,
        },
        {
          key: "seller" as const,
          label: "Seller",
          name: transaction.sellerName,
          token: currentAddendum.sellerToken,
          signed: currentAddendum.sellerSigned,
        },
      ]
    : []
  const activeSigner = parties.find((party) => party.key === activeParty) ?? null

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/transactions/${transaction.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ChevronLeft className="size-4 shrink-0" />
        Back to transaction
      </Link>

      <section className="flex flex-col gap-3 border-b border-border/80 py-8">
        <p className="text-sm font-medium text-muted-foreground">
          Custom addendum
        </p>
        <h1 className="max-w-[18ch] text-4xl font-semibold tracking-tight text-balance">
          {currentAddendum ? currentAddendum.title : "Prepare a new addendum."}
        </h1>
        <p className="text-base text-pretty text-muted-foreground">
          {transaction.property} · {transaction.price}
        </p>
      </section>

      {!currentAddendum ? (
        loading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin shrink-0" />
            Preparing addendum workspace
          </div>
        ) : presignToken ? (
          <section className="grid gap-8 py-8 lg:grid-cols-[11fr_25fr]">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Authoring
                </h2>
                <p className="text-sm text-pretty text-muted-foreground">
                  Draft the addendum, add buyer and seller as signers, then
                  click Create document. The app will send it for signature
                  immediately after creation.
                </p>
              </div>
              <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    Expected recipients
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Only buyer and seller should be{" "}
                    <span className="font-medium text-foreground">SIGNER</span>{" "}
                    recipients. Only the signer emails below are validated when
                    present. Use non-signer roles for everyone else.
                  </p>
                </div>
                <div className="space-y-3">
                  {expectedRecipients.map((party) => (
                    <div key={party.key} className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {party.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getRecipientMatchLabel(party.name, party.email)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <ol className="space-y-3 text-sm text-muted-foreground" role="list">
                <li>1. Create the addendum draft.</li>
                <li>2. Add exactly two signer recipients using the emails above.</li>
                <li>3. Put any non-signers in CC or viewer roles.</li>
                <li>4. Click Create document to send it and move into signing.</li>
              </ol>
              {processing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  Sending the addendum and preparing signer steps
                </div>
              ) : null}
              {error ? (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertTitle>{error}</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-3">
                      {recipientValidation ? (
                        <>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              Expected signer recipients
                            </p>
                            <ul className="space-y-1">
                              <li>
                                Buyer:{" "}
                                {getRecipientMatchLabel(
                                  recipientValidation.expected.buyer.name,
                                  recipientValidation.expected.buyer.email,
                                )}
                              </li>
                              <li>
                                Seller:{" "}
                                {getRecipientMatchLabel(
                                  recipientValidation.expected.seller.name,
                                  recipientValidation.expected.seller.email,
                                )}
                              </li>
                            </ul>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              Last attempted signer recipients
                            </p>
                            {recipientValidation.actualSigners.length ? (
                              <ul className="space-y-1">
                                {recipientValidation.actualSigners.map(
                                  (recipient, index) => (
                                    <li key={`${recipient.email}-${index}`}>
                                      {recipient.signingOrder
                                        ? `Order ${recipient.signingOrder}: `
                                        : ""}
                                      {recipient.email}
                                      {recipient.sendStatus
                                        ? ` · ${recipient.sendStatus === "SENT" ? "sent" : "not sent"}`
                                        : ""}
                                    </li>
                                  ),
                                )}
                              </ul>
                            ) : (
                              <p>No signer recipients were found on the last attempt.</p>
                            )}
                          </div>
                        </>
                      ) : null}
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            void initializeAuthoringSession({
                              preserveError: true,
                              preserveValidation: true,
                            })
                          }
                          disabled={loading || processing}
                        >
                          Start a new addendum draft
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-xl border border-border/80 bg-background">
              <EmbedCreateEnvelopeV2
                key={authoringKey}
                className="h-[80dvh] w-full"
                host={host}
                presignToken={presignToken}
                type="DOCUMENT"
                externalId={`acme-realty-addendum-${transaction.id}`}
                onEnvelopeCreated={handleEnvelopeCreated}
              />
            </div>
          </section>
        ) : (
          <div className="border-y border-border/80 py-8">
            <p className="text-sm text-muted-foreground">
              Failed to initialize document authoring. Check your Documenso API
              configuration.
            </p>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          </div>
        )
      ) : (
        <section className="grid gap-10 py-8 lg:grid-cols-[15fr_21fr]">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Signature routing
              </h2>
              <p className="text-sm text-pretty text-muted-foreground">
                Keep the file moving in sequence until both parties complete the
                addendum.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  currentAddendum.status === AddendumStatus.COMPLETED
                    ? "bg-emerald-500"
                    : "bg-amber-500",
                )}
              />
              {currentAddendum.status === AddendumStatus.COMPLETED
                ? "Completed"
                : "Awaiting signatures"}
            </div>

            <div className="divide-y divide-border/80 border-y border-border/80">
              {parties.map((party) => {
                const active = activeParty === party.key
                const canSign = !party.signed && party.token
                const locked =
                  party.key === "seller" &&
                  !currentAddendum.buyerSigned &&
                  !currentAddendum.sellerSigned

                return (
                  <div
                    key={party.key}
                    className={cn(
                      "space-y-4 py-4",
                      active && "bg-muted/20",
                      locked && "opacity-60",
                    )}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              party.signed
                                ? "bg-emerald-500"
                                : active
                                  ? "bg-primary"
                                  : "bg-zinc-400 dark:bg-zinc-500",
                            )}
                          />
                          {party.label}
                        </div>
                        <p className="text-sm text-foreground">{party.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {party.signed
                            ? "Signed"
                            : locked
                              ? "Waiting for buyer signature"
                              : "Ready to review and sign"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {active && processing ? (
                          <Loader2 className="size-4 animate-spin shrink-0 text-muted-foreground" />
                        ) : null}

                        {canSign && !locked && !active ? (
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              !currentAddendum.buyerSigned && party.key === "buyer"
                                ? "default"
                                : currentAddendum.buyerSigned &&
                                    !currentAddendum.sellerSigned &&
                                    party.key === "seller"
                                  ? "default"
                                  : "outline"
                            }
                            onClick={() => setActiveParty(party.key)}
                            disabled={processing}
                          >
                            Sign now
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-4 border-t border-border/80 pt-8 lg:border-t-0 lg:border-l lg:border-border/80 lg:pl-10 lg:pt-0">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Current document
              </h2>
              <p className="text-sm text-pretty text-muted-foreground">
                Open a signer step to load the embedded Documenso workflow.
              </p>
            </div>

            {activeSigner ? (
              <p className="text-sm text-muted-foreground">
                The {activeSigner.key} signer is ready. Complete the embedded
                document to update the addendum state.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No signer is currently active. Start with the next available
                party.
              </p>
            )}

            {activeSigner?.token ? (
              <div className="overflow-hidden rounded-xl border border-border/80 bg-background">
                <EmbedSignDocument
                  token={activeSigner.token}
                  host={host}
                  onDocumentCompleted={() => handleSigningComplete(activeSigner.key)}
                  onDocumentError={(documentError) => {
                    console.error("Addendum signing error:", documentError)
                    setError("The addendum signing flow failed to load.")
                  }}
                  className="h-[720px] w-full"
                />
              </div>
            ) : null}

            <Link
              href={`/transactions/${transaction.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Return to file
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
