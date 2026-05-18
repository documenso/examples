import { NextResponse } from "next/server"
import { documenso, getDocumensoConfigurationError } from "@/lib/documenso"

type PrefillField =
  | { id: number; type: "text"; value: string }
  | { id: number; type: "number"; value: string }
  | { id: number; type: "date"; value: string }

const PREFILL_ALIASES = {
  contractorName: ["contractor name", "candidate name"],
  clientCompany: ["client company"],
  role: ["role", "role position", "position"],
  startDate: ["start date"],
  hourlyRate: ["hourly rate", "rate"],
} as const

const PREFILL_ALIAS_ENTRIES = Object.entries(PREFILL_ALIASES) as Array<
  [keyof typeof PREFILL_ALIASES, readonly string[]]
>

function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function getPrefillKey(labelCandidates: string[]) {
  for (const label of labelCandidates) {
    const normalizedLabel = normalizeLabel(label)

    for (const [key, aliases] of PREFILL_ALIAS_ENTRIES) {
      if (aliases.some((alias) => alias === normalizedLabel)) {
        return key as keyof typeof PREFILL_ALIASES
      }
    }
  }

  return null
}

function buildPrefillFields(
  template: Awaited<ReturnType<typeof documenso.templates.get>>,
  recipientId: number,
  values: {
    contractorName: string
    clientCompany: string
    role: string
    startDate: string
    hourlyRate: string
  },
) {
  const prefillFields: PrefillField[] = []

  for (const field of template.fields ?? []) {
    if (field.recipientId !== recipientId || !field.fieldMeta) {
      continue
    }

    const matchedValueKey = getPrefillKey(
      [field.fieldMeta.label, field.fieldMeta.placeholder, field.customText]
        .filter(Boolean)
        .map(String),
    )

    if (!matchedValueKey) {
      continue
    }

    const value = values[matchedValueKey]

    if (!value) {
      continue
    }

    switch (field.fieldMeta.type) {
      case "text":
        prefillFields.push({ id: field.id, type: "text", value })
        break
      case "number":
        prefillFields.push({ id: field.id, type: "number", value })
        break
      case "date":
        prefillFields.push({ id: field.id, type: "date", value })
        break
      default:
        break
    }
  }

  return prefillFields
}

export async function POST(request: Request) {
  try {
    const configurationError = getDocumensoConfigurationError()

    if (configurationError) {
      return NextResponse.json({ error: configurationError }, { status: 500 })
    }

    const body = await request.json()
    const {
      name,
      email,
      clientCompany,
      role,
      startDate,
      hourlyRate,
      documentType,
    } = body

    if (!name || !email || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, documentType" },
        { status: 400 },
      )
    }

    if (documentType !== "contractor" && documentType !== "background") {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 },
      )
    }

    const templateEnvVar =
      documentType === "contractor"
        ? "DOCUMENSO_TEMPLATE_CONTRACTOR_AGREEMENT"
        : "DOCUMENSO_TEMPLATE_BG_CHECK"

    const templateId = Number(process.env[templateEnvVar])

    if (!templateId) {
      return NextResponse.json(
        { error: `Template not configured: ${templateEnvVar}` },
        { status: 500 },
      )
    }

    const template = await documenso.templates.get({ templateId })
    const templateRecipient = template.recipients?.[0]

    if (!templateRecipient) {
      return NextResponse.json(
        { error: "Template has no recipients configured" },
        { status: 500 },
      )
    }

    const prefillValues = {
      contractorName: name,
      clientCompany,
      role,
      startDate,
      hourlyRate: String(hourlyRate ?? ""),
    }

    const prefillFields = buildPrefillFields(
      template,
      templateRecipient.id,
      prefillValues,
    )

    const document = await documenso.templates.use({
      templateId,
      recipients: [
        {
          id: templateRecipient.id,
          name,
          email,
        },
      ],
      distributeDocument: true,
      prefillFields: prefillFields.length > 0 ? prefillFields : undefined,
      formValues: {
        contractorName: name,
        candidateName: name,
        clientCompany,
        role,
        startDate,
        hourlyRate,
      },
    })

    const recipient = document.recipients?.find(
      (r: { email: string }) => r.email.toLowerCase() === email.toLowerCase(),
    )

    if (!recipient?.token) {
      return NextResponse.json(
        { error: "Could not retrieve signing token" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      signingToken: recipient.token,
      documentId: document.id,
    })
  } catch (error) {
    console.error("Error generating document:", error)

    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500

    if (statusCode === 401) {
      return NextResponse.json(
        {
          error:
            "Documenso rejected the configured API key. Update DOCUMENSO_API_KEY in your local .env file with a valid token.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 },
    )
  }
}
