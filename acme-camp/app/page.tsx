"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sessions } from "@/lib/camp-data"

const notes = [
  "Ages 6–16.",
  "One-week sessions.",
  "Digital waivers after payment.",
]

export default function HomePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selected),
    [selected],
  )

  return (
    <section>
      <PageContainer>
        <div className="grid min-h-[calc(100svh-3.75rem)] gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center">
          <div className="py-4">
            <p className="text-sm font-medium text-primary">Adventure Camp 2026</p>
            <h1 className="mt-4 max-w-[14ch] text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
              Choose your week and get registered.
            </h1>
            <p className="mt-5 max-w-[48ch] text-lg text-muted-foreground text-pretty">
              Registration is simple: pick a session, add camper details, pay, and finish
              the required waivers.
            </p>

            <ul role="list" className="mt-8 grid gap-3 text-base text-foreground">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-3">
                  <span className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-border/80 bg-card p-6">
            <h2 className="max-w-[16ch] text-3xl font-semibold tracking-tight text-balance">
              Available sessions
            </h2>
            <p className="mt-3 max-w-[34ch] text-base text-muted-foreground text-pretty">
              Select the week that works best for your family.
            </p>

            <div className="mt-6 space-y-2">
              {sessions.map((session) => {
                const isFull = session.spotsLeft === 0
                const isSelected = selected === session.id

                return (
                  <button
                    key={session.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelected(session.id)}
                    className={cn(
                      "w-full rounded-[1.25rem] border px-4 py-3 text-left transition",
                      isSelected
                        ? "border-primary bg-primary/8"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted",
                      isFull ? "cursor-not-allowed opacity-45" : "",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold">Week {session.week}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{session.dates}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold tracking-tight tabular-nums">
                          ${session.price}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {isFull ? "Full" : `${session.spotsLeft} spots left`}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              {selectedSession
                ? `Selected: Week ${selectedSession.week} · ${selectedSession.dates}.`
                : "Select a session to continue."}
            </p>

            <Button
              type="button"
              className="mt-6 w-full"
              size="lg"
              disabled={!selected}
              onClick={() => {
                if (selected) router.push(`/register?session=${selected}`)
              }}
            >
              Continue to registration
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
