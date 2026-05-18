"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const years = Array.from({ length: 7 }, (_, i) => String(2020 + i))
const makes = ["Toyota", "Honda", "Ford", "BMW", "Tesla"]

export default function QuoteFormPage() {
  const router = useRouter()
  const [year, setYear] = useState("")
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [zip, setZip] = useState("")

  const canSubmit = Boolean(year && make && model.trim() && zip.trim())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const params = new URLSearchParams({ year, make, model: model.trim(), zip: zip.trim() })
    router.push(`/quotes?${params.toString()}`)
  }

  return (
    <>
      <AppHeader />

      <main className="mx-auto flex min-h-[calc(100svh-4.8125rem)] w-full max-w-5xl flex-col justify-center gap-12 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:gap-24 lg:py-20">
        <div className="flex max-w-[40rem] flex-col gap-4 pt-2">
          <p className="text-sm font-medium text-primary">Auto insurance</p>
          <h1 className="max-w-[15ch] text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Start a quote without getting slowed down.
          </h1>
          <p className="max-w-[54ch] text-base text-muted-foreground text-pretty sm:text-lg">
            Enter the basics, review live pricing, and continue straight into
            the application when you are ready.
          </p>
        </div>

        <section className="w-full max-w-xl rounded-3xl border border-border/60 bg-background p-6 sm:p-7">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-primary">Start a quote</p>
            <h2 className="text-xl font-medium tracking-tight text-balance">
              Vehicle details
            </h2>
            <p className="text-sm text-muted-foreground text-pretty">
              This is enough to generate your first set of options.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="year">Vehicle year</Label>
                <Select name="year" value={year} onValueChange={(v) => setYear(v ?? "")}>
                  <SelectTrigger id="year" className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="make">Make</Label>
                <Select name="make" value={make} onValueChange={(v) => setMake(v ?? "")}>
                  <SelectTrigger id="make" className="w-full">
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
              <div className="flex flex-col gap-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="zip">ZIP code</Label>
                <Input
                  id="zip"
                  name="zip"
                  inputMode="numeric"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  placeholder="90210"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="mt-2 w-full sm:w-auto sm:self-start" disabled={!canSubmit}>
              Compare quotes
            </Button>
          </form>
        </section>
      </main>
    </>
  )
}
