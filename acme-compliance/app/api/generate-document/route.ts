import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import type { TemplateCreateDocumentFromTemplateRequest } from "@documenso/sdk-typescript/models/operations"

type TemplateResponse = Awaited<ReturnType<typeof documenso.templates.get>>
type TemplateField = TemplateResponse["fields"][number]
type FieldAlias =
  | "workerName"
  | "trainingModule"
  | "completionDate"
  | "expiryDate"

const FIELD_ALIASES: Record<FieldAlias, string[]> = {
  workerName: ["worker name", "employee name", "worker full name"],
  trainingModule: ["training module", "training program", "module name"],
  completionDate: ["completion date", "completed on"],
  expiryDate: [
    "expiry date",
    "expiration date",
    "certification expiration",
    "certification expiry",
  ],
}

const REQUIRED_ALIASES: FieldAlias[] = [
  "workerName",
  "trainingModule",
  "completionDate",
  "expiryDate",
]

const ALIAS_LABELS: Record<FieldAlias, string> = {
  workerName: "Worker Name",
  trainingModule: "Training Module",
  completionDate: "Completion Date",
  expiryDate: "Expiry Date",
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function toNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function resolveFieldAlias(field: TemplateField): FieldAlias | null {
  const lookup = normalize(
    [
      field.secondaryId,
      field.customText,
      field.fieldMeta?.label,
      field.fieldMeta?.placeholder,
    ]
      .filter(Boolean)
      .join(" "),
  )

  if (lookup) {
    for (const key of Object.keys(FIELD_ALIASES) as FieldAlias[]) {
      if (FIELD_ALIASES[key].some((alias) => lookup.includes(alias))) {
        return key
      }
    }
  }

  const x = toNumber(field.positionX)
  const y = toNumber(field.positionY)
  const fieldType = field.fieldMeta?.type

  if (field.page !== 1 || x === null || y === null) {
    return null
  }

  if (fieldType === "name" && y >= 34 && y <= 41) {
    return "workerName"
  }

  if (fieldType === "text" && y >= 40 && y <= 47) {
    return "trainingModule"
  }

  if ((fieldType === "date" || fieldType === "text") && y >= 47 && y <= 55) {
    return x < 50 ? "completionDate" : "expiryDate"
  }

  return null
}

function getFieldValue(
  alias: FieldAlias,
  values: Record<FieldAlias, string>,
) {
  return values[alias]
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, moduleName } = await request.json()

    if (!name || !email || !moduleName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ID)

    if (!Number.isFinite(templateId) || templateId <= 0) {
      return NextResponse.json(
        { error: "DOCUMENSO_TEMPLATE_ID is missing or invalid" },
        { status: 500 },
      )
    }

    const template = await documenso.templates.get({ templateId })

    const recipients = template.recipients.map((r) => ({
      id: r.id,
      name,
      email,
      signingOrder: r.signingOrder,
      role: r.role,
    }))

    const completionDate = new Date().toISOString().split("T")[0]
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)
    const expiryDate = expiry.toISOString().split("T")[0]

    const valuesByAlias: Record<FieldAlias, string> = {
      workerName: name.trim(),
      trainingModule: moduleName.trim(),
      completionDate,
      expiryDate,
    }

    const matchedAliases = new Set(
      template.fields
        .map((field) => resolveFieldAlias(field))
        .filter((alias): alias is FieldAlias => alias !== null),
    )

    const missingFields = REQUIRED_ALIASES.filter((alias) => !matchedAliases.has(alias))

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Template is missing required prefill fields: ${missingFields
            .map((field) => ALIAS_LABELS[field])
            .join(", ")}`,
        },
        { status: 400 },
      )
    }

    const prefillFields = template.fields.reduce<
      NonNullable<TemplateCreateDocumentFromTemplateRequest["prefillFields"]>
    >((fields, field) => {
      const alias = resolveFieldAlias(field)
      const fieldType = field.fieldMeta?.type

      if (
        !alias ||
        !fieldType ||
        (fieldType !== "text" && fieldType !== "date")
      ) {
        return fields
      }

      if (fieldType === "date") {
        fields.push({
          id: field.id,
          type: "date",
          value: getFieldValue(alias, valuesByAlias),
        })
      } else {
        fields.push({
          id: field.id,
          type: "text",
          value: getFieldValue(alias, valuesByAlias),
        })
      }

      return fields
    }, [])

    const formValues = template.fields.reduce<
      NonNullable<TemplateCreateDocumentFromTemplateRequest["formValues"]>
    >((values, field) => {
      const alias = resolveFieldAlias(field)

      if (!alias || !field.secondaryId) {
        return values
      }

      values[field.secondaryId] = getFieldValue(alias, valuesByAlias)
      return values
    }, {})

    const document = await documenso.templates.use({
      templateId,
      recipients,
      distributeDocument: true,
      prefillFields: prefillFields.length > 0 ? prefillFields : undefined,
      formValues: Object.keys(formValues).length > 0 ? formValues : undefined,
    })

    const signingToken = document.recipients?.[0]?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "Failed to generate a signing token for the document" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      signingToken,
      documentId: document.id,
      completionDate,
      expiryDate,
    })
  } catch (error) {
    console.error("Error generating document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
