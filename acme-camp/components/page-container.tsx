import { cn } from "@/lib/utils"

export function PageContainer({
  className,
  children,
}: Readonly<{
  className?: string
  children: React.ReactNode
}>) {
  return <div className={cn("mx-auto max-w-5xl px-6", className)}>{children}</div>
}
