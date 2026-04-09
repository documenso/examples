"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { useCampRegistration } from "@/hooks/use-camp-registration"

function generateConfirmationNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `CAMP-${code}`
}

const whatToBring = [
  "Sunscreen (SPF 30+)",
  "Refillable water bottle",
  "Closed-toe shoes",
  "Hat or visor",
  "Change of clothes",
  "Swim gear and towel",
  "Lunch and snacks (nut-free)",
  "Bug spray",
]

export default function ConfirmationPage() {
  const router = useRouter()
  const { registration, isReady } = useCampRegistration()

  const confirmationNumber = useMemo(() => generateConfirmationNumber(), [])

  useEffect(() => {
    if (isReady && !registration) {
      router.replace("/")
    }
  }, [isReady, registration, router])

  if (!isReady || !registration) return null

  return (
    <section className="py-16 sm:py-20">
      <PageContainer>
        <div>
          <div className="flex items-center gap-3 text-primary">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="size-5" />
            </div>
            <p className="text-sm font-medium">Registration complete</p>
          </div>
          <h1 className="mt-5 max-w-[14ch] text-4xl font-semibold tracking-tight text-balance">
            You&apos;re confirmed for camp.
          </h1>
          <p className="mt-4 max-w-[52ch] text-base text-muted-foreground text-pretty">
            {registration.childName} is booked for Adventure Camp. Save the
            confirmation number and review the checklist before the session starts.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
          <div className="space-y-12">
            <section>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Registration details</p>
                  <p className="mt-1 text-base text-muted-foreground text-pretty">
                    Keep this information for your records.
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    Confirmation number
                  </p>
                  <p className="mt-2 font-mono text-2xl font-semibold tracking-[0.18em] tabular-nums">
                    {confirmationNumber}
                  </p>
                </div>
              </div>

              <dl className="grid gap-x-8 gap-y-8 pt-8 text-base sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-foreground">Camper</dt>
                  <dd className="mt-1 text-base text-muted-foreground">
                    {registration.childName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-foreground">Parent or guardian</dt>
                  <dd className="mt-1 text-base text-muted-foreground">
                    {registration.parentName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-foreground">Session dates</dt>
                  <dd className="mt-1 text-base text-muted-foreground">
                    {registration.sessionDates}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-foreground">Amount paid</dt>
                  <dd className="mt-1 text-base text-muted-foreground tabular-nums">
                    ${registration.price}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <div>
                <p className="text-sm font-medium text-foreground">What to bring</p>
                <p className="mt-1 text-base text-muted-foreground text-pretty">
                  Pack these items on the first morning of camp.
                </p>
              </div>

              <ul role="list" className="grid gap-x-8 gap-y-4 pt-6 sm:grid-cols-2">
                {whatToBring.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm text-pretty">{item}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-8 border-t border-border/60 pt-8 lg:border-t-0 lg:border-l lg:border-border/60 lg:pt-0 lg:pl-8">
            <div>
              <p className="text-sm font-medium text-foreground">Next step</p>
              <p className="mt-2 text-base text-muted-foreground text-pretty">
                You can head back home now. Temporary registration data will be cleared
                from this device.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                Contact email
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                {registration.email}
              </p>
            </div>

            <div>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  sessionStorage.removeItem("camp-registration")
                  router.push("/")
                }}
              >
                Back to home
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </aside>
        </div>
      </PageContainer>
    </section>
  )
}
