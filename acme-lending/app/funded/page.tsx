"use client"

import Link from "next/link"
import { CheckCircle2, Clock3, Mail } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function FundedPage() {
  return (
    <div className="bg-background">
      <main className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="max-w-[48rem] space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Acme Lending
            </p>
            <CheckCircle2 className="size-5 stroke-primary" />
            <div className="space-y-3">
              <h1 className="max-w-[24ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Your funds are on the way.
              </h1>
              <p className="max-w-[48ch] text-base text-muted-foreground text-pretty">
                We&apos;ve received your signed agreement and your transfer is
                scheduled for the next business day.
              </p>
            </div>
          </div>

          <div className="grid gap-6 py-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Clock3 className="size-4 shrink-0 stroke-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">First payment due in 30 days</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  We&apos;ll send a reminder before your first payment is due.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="size-4 shrink-0 stroke-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Signed copy emailed</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  A copy of the completed agreement has been sent to your inbox.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className={buttonVariants({
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
