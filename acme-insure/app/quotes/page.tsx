"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { Check } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { quotes } from "@/lib/quotes"

function QuotesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const year = searchParams.get("year")
  const make = searchParams.get("make")
  const model = searchParams.get("model")
  const zip = searchParams.get("zip")
  const missingVehicleData = !year || !make || !model || !zip

  useEffect(() => {
    if (missingVehicleData) {
      router.replace("/")
    }
  }, [missingVehicleData, router])

  if (missingVehicleData) return null

  const vehicleLabel = `${year} ${make} ${model}`
  const sortedQuotes = [...quotes].sort((a, b) => a.premium - b.premium)
  const featuredQuoteId = sortedQuotes[0]?.id

  function handleSelect(quoteId: string) {
    const params = new URLSearchParams({
      quoteId,
      year: year!,
      make: make!,
      model: model!,
      zip: zip!,
    })
    router.push(`/bind?${params.toString()}`)
  }

  return (
    <>
      <AppHeader backHref="/" backLabel="Vehicle details" />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex max-w-[48rem] flex-col gap-3">
          <p className="text-sm font-medium text-primary">Quotes</p>
          <h1 className="max-w-[32ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Compare options for your {vehicleLabel}.
          </h1>
          <p className="max-w-[52ch] text-base text-muted-foreground text-pretty sm:text-lg">
            These offers are based on ZIP code {zip} and are sorted from the
            lowest monthly premium to the highest.
          </p>
        </div>

        <div className="border-t border-border/60">
          {sortedQuotes.map((quote) => {
            const isFeatured = quote.id === featuredQuoteId

            return (
              <article
                key={quote.id}
                className="grid gap-6 border-b border-border/60 py-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_10rem]"
              >
                <div className="flex flex-col gap-2">
                  {isFeatured ? (
                    <p className="text-sm font-medium text-primary">
                      Lowest monthly premium
                    </p>
                  ) : null}
                  <h2 className="text-lg font-semibold tracking-tight text-balance">
                    {quote.carrier}
                  </h2>
                  <p className="text-base text-muted-foreground">
                    {quote.coverageType}
                  </p>
                </div>

                <ul
                  role="list"
                  className="flex flex-col gap-2 text-base text-muted-foreground"
                >
                  {quote.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-1 size-4 shrink-0 stroke-muted-foreground" />
                      <span className="text-pretty">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-4 lg:items-end">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground lg:text-right">
                      Monthly premium
                    </p>
                    <div className="flex items-end gap-1 lg:justify-end">
                      <p className="text-4xl font-semibold tracking-tight tabular-nums text-primary">
                        ${quote.premium}
                      </p>
                      <p className="pb-1 text-sm text-muted-foreground">/mo</p>
                    </div>
                  </div>

                  <Button
                    className="w-full lg:w-auto"
                    variant={isFeatured ? "default" : "outline"}
                    onClick={() => handleSelect(quote.id)}
                  >
                    Continue
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </>
  )
}

export default function QuotesPage() {
  return (
    <Suspense>
      <div className="min-h-svh">
        <QuotesContent />
      </div>
    </Suspense>
  )
}
