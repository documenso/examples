import { Badge } from "@/components/ui/badge"
import type { ParticipantStatus } from "@/lib/mock-data"

const config: Record<
  ParticipantStatus,
  { label: string; className: string }
> = {
  consented: {
    label: "Consented",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  pending: {
    label: "Pending consent",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  },
  screening: {
    label: "Screening",
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300",
  },
}

export function StatusBadge({ status }: { status: ParticipantStatus }) {
  const { label, className } = config[status]
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
