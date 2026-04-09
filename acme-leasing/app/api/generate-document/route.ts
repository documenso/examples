import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import { formatCurrency, formatLeaseDate } from "@/lib/mock-data"

const templateConfigs = {
  DOCUMENSO_TEMPLATE_LEASE: {
    title: (unitNumber: string) => `Lease Agreement — Unit ${unitNumber}`,
  },
  DOCUMENSO_TEMPLATE_PET_ADDENDUM: {
    title: (unitNumber: string) => `Pet Addendum — Unit ${unitNumber}`,
  },
} as const

type TemplateEnvVar = keyof typeof templateConfigs

type GenerateDocumentRequest = {
  templateEnvVar: TemplateEnvVar
  tenantName: string
  tenantEmail: string
  unitNumber: string
  monthlyRent: number
  securityDeposit: number
  petDeposit?: number
  leaseStartDate?: string
  leaseEndDate?: string
}

function isTemplateEnvVar(value: unknown): value is TemplateEnvVar {
  return typeof value === "string" && value in templateConfigs
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidLeaseDate(value: string) {
  return !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
}

function parseTemplateId(value: string | undefined) {
  if (!value) {
    return null
  }

  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function buildFormValues(
  body: GenerateDocumentRequest,
): Record<string, string | number | boolean> {
  if (body.templateEnvVar === "DOCUMENSO_TEMPLATE_LEASE") {
    return {
      "Tenant Name": body.tenantName,
      "Unit Number": body.unitNumber,
      "Monthly Rent": formatCurrency(body.monthlyRent),
      "Start Date": formatLeaseDate(body.leaseStartDate ?? ""),
      "End Date": formatLeaseDate(body.leaseEndDate ?? ""),
      "Security Deposit": formatCurrency(body.securityDeposit),
    }
  }

  return {
    "Tenant Name": body.tenantName,
    "Unit Number": body.unitNumber,
    "Pet Deposit": formatCurrency(body.petDeposit ?? 0),
  }
}

function validateBody(body: unknown): body is GenerateDocumentRequest {
  if (!body || typeof body !== "object") {
    return false
  }

  const candidate = body as Partial<GenerateDocumentRequest>

  if (
    !isTemplateEnvVar(candidate.templateEnvVar) ||
    typeof candidate.tenantName !== "string" ||
    typeof candidate.tenantEmail !== "string" ||
    typeof candidate.unitNumber !== "string" ||
    typeof candidate.monthlyRent !== "number" ||
    typeof candidate.securityDeposit !== "number"
  ) {
    return false
  }

  if (candidate.templateEnvVar === "DOCUMENSO_TEMPLATE_LEASE") {
    return (
      typeof candidate.leaseStartDate === "string" &&
      typeof candidate.leaseEndDate === "string"
    )
  }

  return candidate.petDeposit === undefined || typeof candidate.petDeposit === "number"
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    if (!validateBody(payload)) {
      return NextResponse.json(
        { error: "Invalid document generation payload." },
        { status: 400 },
      )
    }

    const normalizedTenantName = payload.tenantName.trim()
    const normalizedTenantEmail = payload.tenantEmail.trim().toLowerCase()
    const normalizedUnitNumber = payload.unitNumber.trim()

    if (!normalizedTenantName || !normalizedUnitNumber || !isValidEmail(normalizedTenantEmail)) {
      return NextResponse.json(
        { error: "A tenant name, unit number, and valid tenant email are required." },
        { status: 400 },
      )
    }

    if (
      payload.templateEnvVar === "DOCUMENSO_TEMPLATE_PET_ADDENDUM" &&
      typeof payload.petDeposit !== "number"
    ) {
      return NextResponse.json(
        { error: "Pet deposit is required for the pet addendum template." },
        { status: 400 },
      )
    }

    if (
      payload.templateEnvVar === "DOCUMENSO_TEMPLATE_LEASE" &&
      (() => {
        const { leaseStartDate, leaseEndDate } = payload

        return (
          !leaseStartDate ||
          !leaseEndDate ||
          !isValidLeaseDate(leaseStartDate) ||
          !isValidLeaseDate(leaseEndDate) ||
          new Date(`${leaseEndDate}T12:00:00Z`) < new Date(`${leaseStartDate}T12:00:00Z`)
        )
      })()
    ) {
      return NextResponse.json(
        { error: "Lease start and end dates must be valid and in chronological order." },
        { status: 400 },
      )
    }

    if (!process.env.DOCUMENSO_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "Missing DOCUMENSO_API_KEY. Add it before generating documents." },
        { status: 500 },
      )
    }

    if (!process.env.DOCUMENSO_HOST?.trim()) {
      return NextResponse.json(
        { error: "Missing DOCUMENSO_HOST. Add it before generating documents." },
        { status: 500 },
      )
    }

    const templateId = parseTemplateId(process.env[payload.templateEnvVar])

    if (!templateId) {
      return NextResponse.json(
        { error: `Template not configured: ${payload.templateEnvVar}` },
        { status: 400 },
      )
    }

    const template = await documenso.templates.get({ templateId })
    const templateRecipient = template.recipients?.[0]

    if (!templateRecipient) {
      return NextResponse.json(
        { error: "Template has no recipients configured." },
        { status: 400 },
      )
    }

    const document = await documenso.templates.use({
      templateId,
      recipients: [
        {
          id: templateRecipient.id,
          email: normalizedTenantEmail,
          name: normalizedTenantName,
        },
      ],
      formValues: buildFormValues({
        ...payload,
        tenantName: normalizedTenantName,
        tenantEmail: normalizedTenantEmail,
        unitNumber: normalizedUnitNumber,
      }),
      override: {
        title: templateConfigs[payload.templateEnvVar].title(normalizedUnitNumber),
      },
      distributeDocument: true,
    })

    const signer =
      document.recipients?.find(
        (recipient) => recipient.email.toLowerCase() === normalizedTenantEmail,
      ) ??
      document.recipients?.[0]

    if (!signer?.token) {
      return NextResponse.json(
        { error: "Documenso did not return a recipient signing token." },
        { status: 502 },
      )
    }

    return NextResponse.json({
      documentId: document.id,
      signingToken: signer.token,
    })
  } catch (error) {
    console.error("Failed to generate document:", error)

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to generate document."

    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
