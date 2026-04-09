import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  FileText,
  Paintbrush,
  Plus,
  Send,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getProject, formatCurrency } from "@/lib/mock-data"
import { ScopeChangeActions } from "@/components/scope-change-actions"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const project = getProject(id)
  if (!project) notFound()

  const isDraft = project.sowStatus === "Draft"
  const isActive = project.status === "Active"

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Projects
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {project.client}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {project.startDate} — {project.endDate}
            </span>
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">
          {formatCurrency(project.budget)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deliverables</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.deliverables.map((d, i) => (
                <li
                  key={i}
                  className="text-muted-foreground flex items-start gap-2 text-sm"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isDraft && (
              <Link
                href={`/projects/${project.id}/draft`}
                className={buttonVariants({ className: "w-full" })}
              >
                <Paintbrush className="mr-2 h-4 w-4" />
                Draft SOW
              </Link>
            )}

            <div className="text-muted-foreground text-center text-xs">
              {isDraft
                ? "Author a Statement of Work and send to the client for signing."
                : "SOW has been signed. Manage scope changes below."}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope Changes */}
      {isActive && project.scopeChanges.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Scope Changes</CardTitle>
            <CardDescription>
              Pending change orders for this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.scopeChanges.map((sc) => (
                <div
                  key={sc.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{sc.description}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatCurrency(sc.amount)} budget impact
                    </p>
                  </div>
                  <ScopeChangeActions
                    projectId={project.id}
                    projectName={project.name}
                    changeDescription={sc.description}
                    budgetImpact={sc.amount}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Document History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.documentHistory.map((doc, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      {doc.name}
                    </span>
                  </TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        doc.status === "Signed"
                          ? "default"
                          : doc.status === "Draft"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
