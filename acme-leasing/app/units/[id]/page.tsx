import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { UnitDetail } from "@/components/unit-detail"
import { getUnit } from "@/lib/mock-data"

export default async function UnitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const unit = getUnit(id)

  if (!unit) {
    notFound()
  }

  return (
    <div className="min-h-svh bg-background">
      <AppHeader context={`Unit ${unit.unit}`} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0 stroke-muted-foreground" />
          Back to units
        </Link>

        <UnitDetail unitId={unit.id} />
      </main>
    </div>
  )
}
