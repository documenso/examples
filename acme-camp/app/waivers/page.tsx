"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { EmbedSignDocument } from "@documenso/embed-react"
import { FileCheck, Loader2, Shield } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { useCampRegistration, type CampRegistration } from "@/hooks/use-camp-registration"

type WaiverStep = "loading" | "liability" | "photo" | "done"
type WaiverType = "liability" | "photo"

export default function WaiversPage() {
  const router = useRouter()
  const [step, setStep] = useState<WaiverStep>("loading")
  const [activeWaiver, setActiveWaiver] = useState<WaiverType>("liability")
  const [liabilityToken, setLiabilityToken] = useState<string | null>(null)
  const [photoToken, setPhotoToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { registration, isReady } = useCampRegistration()

  const generateWaiver = useCallback(async (data: CampRegistration, type: WaiverType) => {
    try {
      setActiveWaiver(type)
      const res = await fetch("/api/generate-waiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: data.parentName,
          childName: data.childName,
          childAge: data.childAge,
          email: data.email,
          phone: data.phone,
          sessionDates: data.sessionDates,
          emergencyName: data.emergencyName,
          emergencyPhone: data.emergencyPhone,
          medical: data.medical,
          waiverType: type,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to generate waiver")

      if (type === "liability") {
        setLiabilityToken(json.token)
        setStep("liability")
      } else {
        setPhotoToken(json.token)
        setStep("photo")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate waiver")
    }
  }, [])

  useEffect(() => {
    if (!isReady) return

    if (!registration) {
      router.replace("/register")
      return
    }

    generateWaiver(registration, "liability")
  }, [generateWaiver, isReady, registration, router])

  const handleLiabilityComplete = useCallback(() => {
    if (!registration) return
    setStep("loading")
    generateWaiver(registration, "photo")
  }, [generateWaiver, registration])

  const handlePhotoComplete = useCallback(() => {
    router.push("/confirmation")
  }, [router])

  const currentStep = activeWaiver === "photo" ? 2 : 1
  const waiverLabels = ["Liability waiver", "Photo release"]
  const waiverDescriptions = [
    "Review camp participation terms and medical authorization.",
    "Approve photo and video usage during camp activities.",
  ]

  if (error) {
    return (
      <section className="py-16">
        <PageContainer>
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
            <p className="text-3xl font-semibold tracking-tight text-balance">
              We couldn&apos;t load the waivers.
            </p>
            <p className="text-base text-destructive">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/register")}
            >
              Back to registration
            </Button>
          </div>
        </PageContainer>
      </section>
    )
  }

  return (
    <section className="py-10 sm:py-14">
      <PageContainer>
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Required signatures</p>
          <h1 className="mt-3 max-w-[16ch] text-4xl font-semibold tracking-tight text-balance">
            Finish the last two documents.
          </h1>
          <p className="mt-4 max-w-[48ch] text-base text-muted-foreground text-pretty">
            Sign the liability waiver and photo release to complete registration.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-6 lg:border-r lg:border-border/60 lg:pr-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">Step {currentStep} of 2</p>
              </div>

              <div className="flex gap-2">
                {waiverLabels.map((label, index) => (
                  <div
                    key={label}
                    className={
                      index < currentStep
                        ? "h-1.5 flex-1 rounded-sm bg-primary"
                        : "h-1.5 flex-1 rounded-sm bg-muted"
                    }
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {waiverLabels.map((label, index) => {
                const stepNumber = index + 1
                const isComplete = stepNumber < currentStep
                const isActive = stepNumber === currentStep
                const Icon = stepNumber === 1 ? Shield : FileCheck

                return (
                  <div
                    key={label}
                    className={
                      isActive ? "border-l-2 border-primary pl-4" : "border-l-2 border-border/70 pl-4"
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={
                          isActive || isComplete
                            ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                            : "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                        }
                      >
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-medium">{label}</p>
                          {isComplete && (
                            <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
                              Done
                            </p>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground text-pretty">
                          {waiverDescriptions[index]}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {registration && (
              <div className="border-t border-border/60 pt-6">
                <p className="text-sm font-medium text-foreground">Registration</p>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Camper</p>
                    <p className="mt-1 font-medium text-foreground">{registration.childName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parent or guardian</p>
                    <p className="mt-1 font-medium text-foreground">{registration.parentName}</p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          <div className="space-y-4 lg:pl-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Now signing</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-balance">
                  {waiverLabels[currentStep - 1]}
                </p>
              </div>
              <p className="hidden max-w-sm text-sm text-muted-foreground text-pretty sm:block">
                {waiverDescriptions[currentStep - 1]}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
              {step === "loading" && (
                <div className="flex h-[min(70vh,44rem)] items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              )}

              {step === "liability" && liabilityToken && (
                <EmbedSignDocument
                  token={liabilityToken}
                  host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"}
                  onDocumentCompleted={handleLiabilityComplete}
                  onDocumentReady={() => {}}
                  onDocumentError={(err) => console.error("Liability waiver error:", err)}
                  className="h-[min(70vh,44rem)] w-full"
                />
              )}

              {step === "photo" && photoToken && (
                <EmbedSignDocument
                  token={photoToken}
                  host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST || "https://app.documenso.com"}
                  onDocumentCompleted={handlePhotoComplete}
                  onDocumentReady={() => {}}
                  onDocumentError={(err) => console.error("Photo release error:", err)}
                  className="h-[min(70vh,44rem)] w-full"
                />
              )}
            </div>

            <p className="text-sm text-muted-foreground text-pretty sm:hidden">
              {waiverDescriptions[currentStep - 1]}
            </p>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
