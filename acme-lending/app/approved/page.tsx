import { Suspense } from "react"
import { ApprovedPageClient } from "@/components/approved-page"

function ApprovedPageFallback() {
  return (
    <div className="bg-background">
      <div className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Acme Lending
        </p>
        <p className="text-base text-muted-foreground">Loading your offer…</p>
      </div>
    </div>
  )
}

export default function ApprovedPage() {
  return (
    <Suspense fallback={<ApprovedPageFallback />}>
      <ApprovedPageClient />
    </Suspense>
  )
}
