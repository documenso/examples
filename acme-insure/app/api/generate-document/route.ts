import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

type GenerateDocumentRequest = {
  applicantName: string
  email: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  vehicleInfo: string
  coverageType: string
  premium: number
}

type TemplateField = Awaited<ReturnType<typeof documenso.templates.get>>["fields"][number]
type SupportedPrefillField = {
  id: number
  type: "text" | "number" | "date"
  label?: string
  placeholder?: string
  value?: string
}

const FIELD_ALIASES = {
  applicantName: ["applicantname", "fulllegalname", "insuredname"],
  emailAddress: ["emailaddress", "applicantemail", "email"],
  vehicleInfo: ["vehicleinfo", "vehicleinformation"],
  vehicleYear: ["vehicleyear"],
  vehicleMake: ["vehiclemake"],
  vehicleModel: ["vehiclemodel"],
  coverageType: ["coveragetype", "selectedcoverage", "coverageselection", "coverage"],
  monthlyPremium: [
    "monthlypremium",
    "estimated6monthpremium",
    "estimatedpremium",
    "premiumsummary",
    "premium",
  ],
  effectiveDate: ["effectivedate", "requestedeffectivedate", "coveragestartdate"],
} as const

type FieldAlias = keyof typeof FIELD_ALIASES

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function formatEffectiveDate() {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function generatePolicyNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let value = ""

  for (let i = 0; i < 8; i++) {
    value += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return `POL-${value}`
}

function resolveFieldAlias(field: TemplateField): FieldAlias | null {
  const lookup = normalize(
    [field.customText, field.fieldMeta?.label, field.fieldMeta?.placeholder].filter(Boolean).join(" "),
  )

  if (!lookup) {
    return null
  }

  for (const key of Object.keys(FIELD_ALIASES) as FieldAlias[]) {
    const aliases = FIELD_ALIASES[key]

    if (aliases.some((alias) => lookup.includes(alias))) {
      return key
    }
  }

  return null
}

function getPrefillValue(
  alias: FieldAlias,
  field: TemplateField,
  body: GenerateDocumentRequest,
  effectiveDate: string,
) {
  switch (alias) {
    case "applicantName":
      return body.applicantName
    case "emailAddress":
      return body.email
    case "vehicleInfo":
      return body.vehicleInfo
    case "vehicleYear":
      return body.vehicleYear
    case "vehicleMake":
      return body.vehicleMake
    case "vehicleModel":
      return body.vehicleModel
    case "coverageType":
      return body.coverageType
    case "monthlyPremium":
      return field.fieldMeta?.type === "number" ? String(body.premium) : `$${body.premium}/mo`
    case "effectiveDate":
      return effectiveDate
    default:
      return ""
  }
}

function toPrefillField(
  field: TemplateField,
  body: GenerateDocumentRequest,
  effectiveDate: string,
): SupportedPrefillField | null {
  const fieldMeta = field.fieldMeta
  const fieldType = fieldMeta?.type

  if (!fieldMeta || (fieldType !== "text" && fieldType !== "number" && fieldType !== "date")) {
    return null
  }

  const alias = resolveFieldAlias(field)

  if (!alias) {
    return null
  }

  const value = getPrefillValue(alias, field, body, effectiveDate)

  return {
    id: field.id,
    type: fieldType,
    label: fieldMeta.label,
    placeholder: fieldMeta.placeholder,
    value,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateDocumentRequest
    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ID)

    if (!Number.isFinite(templateId)) {
      return NextResponse.json(
        { error: "DOCUMENSO_TEMPLATE_ID is not configured" },
        { status: 500 },
      )
    }

    if (
      !body.applicantName?.trim() ||
      !body.email?.trim() ||
      !body.vehicleYear?.trim() ||
      !body.vehicleMake?.trim() ||
      !body.vehicleModel?.trim() ||
      !body.vehicleInfo?.trim() ||
      !body.coverageType?.trim() ||
      typeof body.premium !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required application data" },
        { status: 400 },
      )
    }

    const template = await documenso.templates.get({ templateId })
    const effectiveDate = formatEffectiveDate()
    const policyNumber = generatePolicyNumber()

    const recipients = template.recipients.map((r) => ({
      id: r.id,
      name: body.applicantName.trim(),
      email: body.email.trim(),
      signingOrder: r.signingOrder,
      role: r.role,
    }))

    const prefillFields = template.fields
      .map((field) => toPrefillField(field, body, effectiveDate))
      .filter((field): field is SupportedPrefillField => field !== null)

    const document = await documenso.templates.use({
      templateId,
      recipients,
      prefillFields,
      distributeDocument: true,
      override: {
        title: `Auto Insurance Application - ${body.applicantName.trim()}`,
      },
    })

    const signingToken =
      document.recipients.find(
        (recipient) =>
          recipient.role === "SIGNER" && recipient.email === body.email.trim(),
      )?.token ?? document.recipients.find((recipient) => recipient.role === "SIGNER")?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "No signing recipient token was returned from Documenso" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      signingToken,
      documentId: document.id,
      policyNumber,
      effectiveDate,
    })
  } catch (error) {
    console.error("Error generating document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
