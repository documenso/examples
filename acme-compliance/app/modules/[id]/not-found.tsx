import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ModuleNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <ShieldCheck className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Module not found</h1>
      <p className="text-muted-foreground">
        The training module you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
