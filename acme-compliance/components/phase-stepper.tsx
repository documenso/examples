import { CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export type PhaseStep = {
  label: string
  detail: string
  state: "complete" | "active" | "pending"
}

export function PhaseStepper({ steps }: { steps: PhaseStep[] }) {
  return (
    <ol
      role="list"
      className="grid border-y border-border lg:grid-cols-5 [&>li+li]:border-t [&>li+li]:border-border lg:[&>li+li]:border-t-0 lg:[&>li+li]:border-l"
    >
      {steps.map((step, index) => {
        const isComplete = step.state === "complete"
        const isActive = step.state === "active"

        return (
          <li
            key={step.label}
            className={cn(
              "flex items-start gap-3 py-3 lg:px-4",
              isComplete && "text-foreground",
              isActive && "text-foreground",
              step.state === "pending" && "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex w-5 shrink-0 items-center justify-center pt-0.5 text-sm font-medium",
                isComplete && "text-foreground",
                isActive && "text-foreground",
                step.state === "pending" && "text-muted-foreground"
              )}
            >
              {isComplete ? (
                <CheckCheck className="size-3.5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <p
                className={cn(
                  "truncate text-sm font-medium text-foreground",
                  step.state === "pending" && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {step.detail}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
