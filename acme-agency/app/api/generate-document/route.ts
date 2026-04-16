import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import { formatCurrency, getProject, getScopeChange } from "@/lib/mock-data"

function normalizeLabel(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? ""
}

function matchesLabel(value: string | undefined, aliases: string[]) {
  const label = normalizeLabel(value)

  return aliases.some((alias) => label === normalizeLabel(alias))
}

function getFieldLabel(field: Awaited<ReturnType<typeof documenso.templates.get>>["fields"][number]) {
  return field.fieldMeta?.label || field.customText
}

function createPrefillField(
  field: Awaited<ReturnType<typeof documenso.templates.get>>["fields"][number],
  value: string
) {
  const type = field.fieldMeta?.type

  if (type === "number") {
    return {
      type: "number" as const,
      id: field.id,
      value: value.replace(/[^\d.-]/g, ""),
      label: getFieldLabel(field),
    }
  }

  if (type === "text" || type === "email" || type === "name") {
    return {
      type: "text" as const,
      id: field.id,
      value,
      label: getFieldLabel(field),
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const projectId = String(body.projectId ?? "")
    const scopeChangeId = String(body.scopeChangeId ?? "")
    const currentBudget = Number(body.currentBudget)

    const project = getProject(projectId)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const scopeChange = getScopeChange(project, scopeChangeId)

    if (!scopeChange) {
      return NextResponse.json(
        { error: "Scope change not found" },
        { status: 404 }
      )
    }

    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_CHANGE_ORDER)
    if (!templateId) {
      return NextResponse.json(
        { error: "Template not configured" },
        { status: 500 }
      )
    }

    const template = await documenso.templates.get({ templateId })

    const recipients = template.recipients.map((r) => ({
      id: r.id,
      name: project.client,
      email: project.clientEmail,
      signingOrder: r.signingOrder,
      role: r.role,
    }))

    const budgetBeforeChange = Number.isFinite(currentBudget)
      ? currentBudget
      : project.budget
    const newTotal = budgetBeforeChange + scopeChange.amount
    const fieldValues = {
      clientName: project.client,
      projectName: project.name,
      changeDescription: scopeChange.description,
      budgetImpact: formatCurrency(scopeChange.amount),
      newTotal: formatCurrency(newTotal),
    }

    const prefillFields = template.fields
      .map((field) => {
        const label = getFieldLabel(field)

        if (
          matchesLabel(label, ["Client Name", "Client"]) ||
          matchesLabel(field.secondaryId, ["client-name"])
        ) {
          return createPrefillField(field, fieldValues.clientName)
        }

        if (
          matchesLabel(label, ["Project Name", "Project"]) ||
          matchesLabel(field.secondaryId, ["project-name"])
        ) {
          return createPrefillField(field, fieldValues.projectName)
        }

        if (
          matchesLabel(label, ["Change Description", "Change", "Scope Change"]) ||
          matchesLabel(field.secondaryId, ["change-description"])
        ) {
          return createPrefillField(field, fieldValues.changeDescription)
        }

        if (
          matchesLabel(label, ["Budget Impact", "Budget Impact ($)", "Amount"]) ||
          matchesLabel(field.secondaryId, ["budget-impact"])
        ) {
          return createPrefillField(field, fieldValues.budgetImpact)
        }

        if (
          matchesLabel(label, ["New Total", "New Total Budget", "Total"]) ||
          matchesLabel(field.secondaryId, ["new-total"])
        ) {
          return createPrefillField(field, fieldValues.newTotal)
        }

        return null
      })
      .filter((field) => field !== null)

    const document = await documenso.templates.use({
      templateId,
      recipients,
      distributeDocument: true,
      prefillFields,
      override: {
        title: `${project.name} — Change Order`,
      },
    })

    const signingToken =
      document.recipients?.find((recipient) => recipient.token)?.token ??
      (
        await documenso.documents.get({
          documentId: document.id,
        })
      ).recipients.find((recipient) => recipient.token)?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "No signing token found for change order recipient" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signingToken,
      documentId: document.id,
      budgetImpact: scopeChange.amount,
      changeDescription: scopeChange.description,
      newTotal,
    })
  } catch (error) {
    console.error("Error creating change order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
