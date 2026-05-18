import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { documenso } from "@/lib/documenso"
import {
  buildGigSessionSyncData,
  GIG_CREATOR_EMAIL,
} from "@/lib/gig-session"

type TemplateField = Awaited<ReturnType<typeof documenso.templates.get>>["fields"][number]
type TemplateRecipient = Awaited<
  ReturnType<typeof documenso.templates.get>
>["recipients"][number]
type DocumentRecipient = NonNullable<
  Awaited<ReturnType<typeof documenso.templates.use>>["recipients"]
>[number]

type FieldFallbackMatch = {
  type?: readonly string[]
  page?: number
  occurrence?: number
}

type RequiredTemplateFieldConfig = {
  label: string
  aliases?: readonly string[]
  secondaryIds?: readonly string[]
  recipient: "client" | "creator"
  fallback?: FieldFallbackMatch
}

const REQUIRED_TEMPLATE_FIELDS: Record<
  "clientName" | "creatorName" | "deliverables" | "deadline" | "budget" | "usageRights",
  RequiredTemplateFieldConfig
> = {
  clientName: {
    label: "Client Name",
    aliases: ["Client"],
    secondaryIds: ["client-name"],
    recipient: "client",
    fallback: { type: ["name"], page: 1, occurrence: 0 },
  },
  creatorName: {
    label: "Creator Name",
    aliases: ["Creator"],
    secondaryIds: ["creator-name"],
    recipient: "creator",
    fallback: { type: ["name"], page: 1, occurrence: 0 },
  },
  deliverables: {
    label: "Deliverables",
    secondaryIds: ["deliverables"],
    recipient: "client",
    fallback: { type: ["text"], page: 1, occurrence: 0 },
  },
  deadline: {
    label: "Deadline",
    secondaryIds: ["deadline"],
    recipient: "client",
    fallback: { type: ["date"], page: 1, occurrence: 0 },
  },
  budget: {
    label: "Budget",
    aliases: ["Total Budget"],
    secondaryIds: ["budget"],
    recipient: "client",
    fallback: { type: ["number"], page: 1, occurrence: 0 },
  },
  usageRights: {
    label: "Usage Rights",
    secondaryIds: ["usage-rights"],
    recipient: "client",
    fallback: {
      type: ["text", "dropdown", "radio", "checkbox"],
      page: 1,
      occurrence: 1,
    },
  },
} as const

class RouteError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const clientName = readRequiredString(body.clientName, "clientName")
    const clientEmail = readRequiredString(body.clientEmail, "clientEmail").toLowerCase()
    const creatorName = readRequiredString(body.creatorName, "creatorName")
    const deliverables = readRequiredString(body.deliverables, "deliverables")
    const deadline = readRequiredString(body.deadline, "deadline")
    const budget = readRequiredString(body.budget, "budget")
    const usageRights = readRequiredString(body.usageRights, "usageRights")

    ensureRequiredEnv("DOCUMENSO_API_KEY")
    ensureRequiredEnv("DOCUMENSO_HOST")
    const templateId = Number(ensureRequiredEnv("DOCUMENSO_TEMPLATE_ID"))

    if (Number.isNaN(templateId)) {
      throw new RouteError("DOCUMENSO_TEMPLATE_ID must be a valid number.", 500)
    }

    const template = await documenso.templates.get({ templateId })
    const sortedRecipients = validateTemplateRecipients(template.recipients)
    const recipients = sortedRecipients.map((recipient, index) => ({
      id: recipient.id,
      name: index === 0 ? clientName : creatorName,
      email: index === 0 ? clientEmail : GIG_CREATOR_EMAIL,
    }))
    const prefillFields = buildPrefillFields(
      template.fields,
      {
        clientName,
        creatorName,
        deliverables,
        deadline,
        budget,
        usageRights,
      },
      {
        client: sortedRecipients[0].id,
        creator: sortedRecipients[1].id,
      }
    )

    const document = await documenso.templates.use({
      templateId,
      recipients,
      prefillFields,
      distributeDocument: true,
    })

    if (!document.recipients || document.recipients.length !== 2) {
      throw new RouteError(
        "Documenso did not return the expected two document recipients.",
        502
      )
    }

    const clientRecipient = findDocumentRecipient(document.recipients, clientEmail)
    const creatorRecipient = findDocumentRecipient(
      document.recipients,
      GIG_CREATOR_EMAIL
    )

    if (!clientRecipient || !creatorRecipient) {
      throw new RouteError(
        "Documenso returned document recipients that do not match the AcmeGig parties.",
        502
      )
    }

    const syncData = buildGigSessionSyncData(
      {
        clientEmail,
        creatorEmail: GIG_CREATOR_EMAIL,
        clientRecipientId: clientRecipient.id,
        creatorRecipientId: creatorRecipient.id,
      },
      document
    )

    const session = await db.gigSession.create({
      data: {
        clientEmail,
        clientName,
        creatorEmail: GIG_CREATOR_EMAIL,
        creatorName,
        deliverables,
        deadline,
        budget,
        usageRights,
        clientRecipientId: clientRecipient.id,
        creatorRecipientId: creatorRecipient.id,
        clientToken: clientRecipient.token,
        creatorToken: creatorRecipient.token,
        documentId: String(document.id),
        ...syncData,
      },
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error("Error creating contract:", error)

    if (error instanceof RouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    )
  }
}

function ensureRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new RouteError(`${name} is not configured.`, 500)
  }

  return value
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RouteError(`Missing required field: ${field}.`, 400)
  }

  return value.trim()
}

function validateTemplateRecipients(recipients: TemplateRecipient[]) {
  if (recipients.length !== 2) {
    throw new RouteError(
      "The AcmeGig Documenso template must have exactly two recipients.",
      400
    )
  }

  const sortedRecipients = [...recipients].sort(
    (left, right) => (left.signingOrder ?? 0) - (right.signingOrder ?? 0)
  )

  if (
    sortedRecipients[0]?.signingOrder === null ||
    sortedRecipients[1]?.signingOrder === null ||
    sortedRecipients[0]?.signingOrder === undefined ||
    sortedRecipients[1]?.signingOrder === undefined ||
    sortedRecipients[0].signingOrder >= sortedRecipients[1].signingOrder
  ) {
    throw new RouteError(
      "The AcmeGig Documenso template must use sequential signing order with the client first and creator second.",
      400
    )
  }

  return sortedRecipients
}

function normalizeLabel(value: string | undefined) {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() ?? ""
}

function matchesAlias(value: string | undefined, aliases: string[]) {
  const normalizedValue = normalizeLabel(value)

  if (!normalizedValue) {
    return false
  }

  return aliases.some((alias) => {
    const normalizedAlias = normalizeLabel(alias)

    return (
      normalizedValue === normalizedAlias ||
      normalizedValue.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedValue)
    )
  })
}

function toNumber(value: unknown) {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function matchesFallback(
  field: TemplateField,
  fallback: FieldFallbackMatch | undefined
) {
  if (!fallback) {
    return false
  }

  if (fallback.type && !fallback.type.includes(field.fieldMeta?.type ?? "")) {
    return false
  }

  if (fallback.page !== undefined && field.page !== fallback.page) {
    return false
  }

  return true
}

function sortFieldsByPagePosition(fields: TemplateField[]) {
  return [...fields].sort((left, right) => {
    const leftY = toNumber(left.positionY) ?? 0
    const rightY = toNumber(right.positionY) ?? 0
    const leftX = toNumber(left.positionX) ?? 0
    const rightX = toNumber(right.positionX) ?? 0

    return left.page - right.page || leftY - rightY || leftX - rightX
  })
}

function matchesExplicitTemplateField(
  field: TemplateField,
  config: RequiredTemplateFieldConfig,
  recipientIds: { client: number; creator: number }
) {
  const aliases = [config.label, ...(config.aliases ?? [])]
  const recipientId = recipientIds[config.recipient]

  if (field.recipientId !== recipientId) {
    return false
  }

  return (
    [field.fieldMeta?.label, field.fieldMeta?.placeholder, field.customText].some((value) =>
      matchesAlias(value, aliases)
    ) ||
    config.secondaryIds?.some((secondaryId) =>
      matchesAlias(field.secondaryId, [secondaryId])
    ) ||
    false
  )
}

function buildPrefillFields(
  fields: TemplateField[],
  values: Record<keyof typeof REQUIRED_TEMPLATE_FIELDS, string>,
  recipientIds: { client: number; creator: number }
) {
  const usedFieldIds = new Set<number>()

  return (Object.entries(REQUIRED_TEMPLATE_FIELDS) as Array<
    [keyof typeof REQUIRED_TEMPLATE_FIELDS, RequiredTemplateFieldConfig]
  >).map(([key, config]) => {
    const field = findTemplateField(fields, config, recipientIds, usedFieldIds)
    const fieldMeta = field.fieldMeta

    if (!fieldMeta) {
      throw new RouteError(
        `Template field "${config.label}" is missing metadata.`,
        400
      )
    }

    const value = values[key]

    switch (fieldMeta.type) {
      case "text":
      case "name":
      case "email":
        return {
          id: field.id,
          type: "text" as const,
          label: fieldMeta.label,
          placeholder: fieldMeta.placeholder,
          value,
        }
      case "number":
        return {
          id: field.id,
          type: "number" as const,
          label: fieldMeta.label,
          placeholder: fieldMeta.placeholder,
          value,
        }
      case "date":
        return {
          id: field.id,
          type: "date" as const,
          value,
        }
      case "dropdown":
        return {
          id: field.id,
          type: "dropdown" as const,
          label: fieldMeta.label,
          value,
        }
      case "radio":
        return {
          id: field.id,
          type: "radio" as const,
          label: fieldMeta.label,
          value,
        }
      case "checkbox":
        return {
          id: field.id,
          type: "checkbox" as const,
          label: fieldMeta.label,
          value: [value],
        }
      default:
        throw new RouteError(
          `Template field "${config.label}" must be a text, number, date, dropdown, radio, or checkbox field.`,
          400
        )
    }
  })
}

function findTemplateField(
  fields: TemplateField[],
  config: RequiredTemplateFieldConfig,
  recipientIds: { client: number; creator: number },
  usedFieldIds: Set<number>
) {
  const explicitMatches = fields.filter(
    (field) =>
      !usedFieldIds.has(field.id) &&
      matchesExplicitTemplateField(field, config, recipientIds)
  )

  if (explicitMatches.length === 1) {
    usedFieldIds.add(explicitMatches[0].id)

    return explicitMatches[0]
  }

  if (explicitMatches.length > 1) {
    throw new RouteError(
      `The AcmeGig Documenso template has multiple possible matches for "${config.label}". Label that field explicitly to disambiguate it.`,
      400
    )
  }

  const fallbackMatches = fields.filter(
    (field) =>
      !usedFieldIds.has(field.id) &&
      field.recipientId === recipientIds[config.recipient] &&
      matchesFallback(field, config.fallback)
  )

  const sortedFallbackMatches = sortFieldsByPagePosition(fallbackMatches)
  const fallbackMatch =
    sortedFallbackMatches[config.fallback?.occurrence ?? 0] ?? null

  if (!fallbackMatch) {
    throw new RouteError(
      `The AcmeGig Documenso template is missing a field for "${config.label}". Add one matching field in Documenso or label the existing field accordingly.`,
      400
    )
  }

  usedFieldIds.add(fallbackMatch.id)

  return fallbackMatch
}

function findDocumentRecipient(
  recipients: DocumentRecipient[],
  email: string
) {
  const normalizedEmail = email.trim().toLowerCase()

  return (
    recipients.find(
      (recipient) => recipient.email.trim().toLowerCase() === normalizedEmail
    ) ?? null
  )
}
