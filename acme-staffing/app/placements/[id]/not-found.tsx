import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button-variants"

export default function PlacementNotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center px-6">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">Placement not found</h1>
        <p className="mb-6 text-muted-foreground">
          The placement you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "gap-2" })}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
