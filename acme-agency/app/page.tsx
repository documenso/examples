import Link from "next/link"
import { Paintbrush } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { projects, formatCurrency } from "@/lib/mock-data"

const statusVariant: Record<string, "default" | "secondary"> = {
  Pending: "secondary",
  Active: "default",
  Completed: "default",
}

const sowVariant: Record<string, "default" | "secondary" | "outline"> = {
  Draft: "outline",
  Sent: "secondary",
  Signed: "default",
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Paintbrush className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Acme Agency</h1>
          <p className="text-muted-foreground text-sm">Client Portal</p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Projects</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="hover:border-primary/40 h-full transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base leading-snug">
                  {project.name}
                </CardTitle>
                <CardDescription>{project.client}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(project.budget)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={sowVariant[project.sowStatus]}>
                    SOW: {project.sowStatus}
                  </Badge>
                  <Badge variant={statusVariant[project.status]}>
                    {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
