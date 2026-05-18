"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { FIRM_NAME, INTAKE_STORAGE_KEY, type IntakePayload } from "@/lib/acme-legal"
import { MATTER_TYPES } from "@/lib/mock-data"

export default function IntakePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [matterType, setMatterType] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const payload: IntakePayload = {
      name,
      email,
      matterType: matterType as IntakePayload["matterType"],
      description,
    }

    sessionStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(payload))
    router.push("/sign")
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-12 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/"
          aria-label="Homepage"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          {FIRM_NAME}
        </Link>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="w-full max-w-sm">
            <div className="space-y-3">
              <h1 className="max-w-[24ch] text-2xl font-semibold tracking-tight text-balance text-foreground">
                Client intake
              </h1>
              <p className="max-w-[48ch] text-base text-pretty text-muted-foreground">
                Share the basics of your matter and we&apos;ll prepare the engagement letter for review.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 rounded-3xl bg-background shadow-xs ring-1 ring-zinc-950/10 dark:ring-zinc-50/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 rounded-3xl bg-background shadow-xs ring-1 ring-zinc-950/10 dark:ring-zinc-50/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matterType">Matter type</Label>
                <NativeSelect
                  id="matterType"
                  name="matterType"
                  value={matterType}
                  onChange={(e) => setMatterType(e.target.value)}
                  required
                  className="w-full [&_select]:h-10 [&_select]:rounded-3xl [&_select]:bg-background [&_select]:shadow-xs [&_select]:ring-1 [&_select]:ring-zinc-950/10 dark:[&_select]:ring-zinc-50/10"
                >
                  <NativeSelectOption value="">Select a matter type</NativeSelectOption>
                  {MATTER_TYPES.map((type) => (
                    <NativeSelectOption key={type} value={type}>
                      {type}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Matter description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                  className="rounded-[1.25rem] bg-background shadow-xs ring-1 ring-zinc-950/10 dark:ring-zinc-50/10"
                />
              </div>

              <Button
                type="submit"
                className="h-10 w-full rounded-3xl bg-primary text-sm font-medium text-primary-foreground shadow-xs ring-1 ring-primary hover:bg-primary/90"
                disabled={submitting || !matterType}
              >
                {submitting ? "Preparing your documents..." : "Continue to engagement letter"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
