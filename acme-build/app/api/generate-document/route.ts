import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

type GenerateWaiverRequest = {
  claimantName: string
  email: string
  projectName: string
  payPeriodLabel: string
  payPeriodStart: string
  payPeriodEnd: string
  paymentAmount: number
}

type TemplateField = Awaited<
  ReturnType<typeof documenso.templates.get>
>["fields"][number]
type TemplateRecipient = Awaited<
  ReturnType<typeof documenso.templates.get>
>["recipients"][number]
type GeneratedDocument = Awaited<ReturnType<typeof documenso.templates.use>>
type GeneratedField = GeneratedDocument["fields"][number]
type TemplateUseRequest = Parameters<(typeof documenso.templates)["use"]>[0]
type SupportedPrefillField = NonNullable<
  TemplateUseRequest["prefillFields"]
>[number]
type DocumentFieldUpdateRequest = Parameters<
  (typeof documenso.documents.fields)["updateMany"]
>[0]
type SupportedDocumentFieldUpdate = DocumentFieldUpdateRequest["fields"][number]

class TemplateFieldMismatchError extends Error {}

const FIELD_ALIASES = {
  claimantName: ["claimantname", "claimant", "subcontractorname", "vendorname"],
  projectName: ["projectname", "project"],
  payPeriod: ["payperiod", "payperioddates", "payperiodrange"],
  throughDate: ["throughdate", "periodending", "payperiodenddate"],
  paymentAmount: [
    "paymentamount",
    "amountofprogresspayment",
    "progresspaymentamount",
    "amount",
  ],
} as const

type FieldAlias = keyof typeof FIELD_ALIASES
const REQUIRED_VISIBLE_ALIASES = [
  "projectName",
  "payPeriod",
  "paymentAmount",
] as const
type RequiredVisibleAlias = (typeof REQUIRED_VISIBLE_ALIASES)[number]

type AliasedField = {
  secondaryId?: string
  customText?: string | null
  type?: string
  page?: number
  positionX?: unknown
  positionY?: unknown
  fieldMeta?: {
    type?: string
    label?: string
    placeholder?: string
  } | null
}

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function toNumber(value: unknown) {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function getSignerRecipient(recipients: TemplateRecipient[]) {
  return (
    recipients.find((recipient) => recipient.role === "SIGNER") ??
    recipients[0] ??
    null
  )
}

function resolveFieldAlias(field: AliasedField): FieldAlias | null {
  const lookup = normalize(
    [
      field.secondaryId,
      field.customText,
      field.fieldMeta?.label,
      field.fieldMeta?.placeholder,
    ]
      .filter(Boolean)
      .join(" ")
  )

  if (!lookup) {
    return null
  }

  for (const key of Object.keys(FIELD_ALIASES) as FieldAlias[]) {
    if (FIELD_ALIASES[key].some((alias) => lookup.includes(alias))) {
      return key
    }
  }

  const x = toNumber(field.positionX)
  const y = toNumber(field.positionY)

  if (field.page !== 1 || x === null || y === null) {
    return null
  }

  if (y <= 27) {
    if (x < 50 && field.type === "TEXT") {
      return "projectName"
    }

    if (x >= 50 && (field.type === "NAME" || field.type === "TEXT")) {
      return "claimantName"
    }
  }

  if (y <= 35) {
    if (x < 50 && (field.type === "TEXT" || field.type === "DATE")) {
      return "payPeriod"
    }

    if (x >= 50 && (field.type === "NUMBER" || field.type === "TEXT")) {
      return "paymentAmount"
    }
  }

  return null
}

function getFieldValue(alias: FieldAlias, body: GenerateWaiverRequest) {
  switch (alias) {
    case "claimantName":
      return body.claimantName.trim()
    case "projectName":
      return body.projectName.trim()
    case "payPeriod":
      return `${body.payPeriodStart} - ${body.payPeriodEnd}`
    case "throughDate":
      return body.payPeriodEnd
    case "paymentAmount":
      return `$${body.paymentAmount.toLocaleString("en-US")}`
    default:
      return ""
  }
}

function isRequiredVisibleAlias(alias: FieldAlias): alias is RequiredVisibleAlias {
  return REQUIRED_VISIBLE_ALIASES.includes(alias as RequiredVisibleAlias)
}

function toPrefillField(
  field: TemplateField,
  body: GenerateWaiverRequest
): SupportedPrefillField | null {
  const alias = resolveFieldAlias(field)
  const fieldType = field.fieldMeta?.type

  if (
    !alias ||
    !fieldType ||
    (fieldType !== "text" && fieldType !== "number" && fieldType !== "date")
  ) {
    return null
  }

  return {
    id: field.id,
    type: fieldType,
    label: field.fieldMeta?.label,
    placeholder: field.fieldMeta?.placeholder,
    value:
      fieldType === "number" && alias === "paymentAmount"
        ? String(body.paymentAmount)
        : getFieldValue(alias, body),
  }
}

function getFormValues(
  fields: TemplateField[],
  body: GenerateWaiverRequest
): NonNullable<TemplateUseRequest["formValues"]> {
  return fields.reduce<NonNullable<TemplateUseRequest["formValues"]>>(
    (values, field) => {
      const alias = resolveFieldAlias(field)

      if (!alias || !field.secondaryId) {
        return values
      }

      values[field.secondaryId] =
        alias === "paymentAmount"
          ? String(body.paymentAmount)
          : getFieldValue(alias, body)

      return values
    },
    {}
  )
}

function getTemplateAliasMap(fields: TemplateField[]) {
  return fields.reduce<Map<string, FieldAlias>>((map, field) => {
    const alias = resolveFieldAlias(field)

    if (alias && field.secondaryId) {
      map.set(field.secondaryId, alias)
    }

    return map
  }, new Map())
}

function resolveGeneratedFieldAlias(
  field: GeneratedField,
  templateAliasMap: Map<string, FieldAlias>
) {
  if (field.secondaryId) {
    const templateAlias = templateAliasMap.get(field.secondaryId)

    if (templateAlias) {
      return templateAlias
    }
  }

  return resolveFieldAlias(field)
}

function toLockedFieldUpdate(
  field: GeneratedField,
  body: GenerateWaiverRequest,
  templateAliasMap: Map<string, FieldAlias>
): { alias: RequiredVisibleAlias; update: SupportedDocumentFieldUpdate } | null {
  const alias = resolveGeneratedFieldAlias(field, templateAliasMap)

  if (!alias || !isRequiredVisibleAlias(alias) || !field.fieldMeta) {
    return null
  }

  if (field.type === "TEXT" && field.fieldMeta.type === "text") {
    return {
      alias,
      update: {
        id: field.id,
        type: "TEXT",
        fieldMeta: {
          ...field.fieldMeta,
          type: "text",
          readOnly: true,
          text: getFieldValue(alias, body),
        },
      },
    }
  }

  if (
    field.type === "NUMBER" &&
    field.fieldMeta.type === "number" &&
    alias === "paymentAmount"
  ) {
    return {
      alias,
      update: {
        id: field.id,
        type: "NUMBER",
        fieldMeta: {
          ...field.fieldMeta,
          type: "number",
          readOnly: true,
          value: String(body.paymentAmount),
        },
      },
    }
  }

  return null
}

async function patchGeneratedDocumentFields(
  document: GeneratedDocument,
  body: GenerateWaiverRequest,
  templateAliasMap: Map<string, FieldAlias>
) {
  const fieldUpdates = document.fields
    .map((field) => toLockedFieldUpdate(field, body, templateAliasMap))
    .filter((field): field is NonNullable<typeof field> => field !== null)

  const matchedAliases = new Set(fieldUpdates.map((field) => field.alias))
  const missingAliases = REQUIRED_VISIBLE_ALIASES.filter(
    (alias) => !matchedAliases.has(alias)
  )

  if (missingAliases.length > 0) {
    throw new TemplateFieldMismatchError(
      `The lien waiver template is missing supported fields for: ${missingAliases.join(", ")}`
    )
  }

  await documenso.documents.fields.updateMany({
    documentId: document.id,
    fields: fieldUpdates.map((field) => field.update),
  })

  return fieldUpdates.length
}

function getSigningToken(
  document: Pick<GeneratedDocument, "recipients">,
  email: string
) {
  return (
    document.recipients.find(
      (recipient) =>
        recipient.role === "SIGNER" &&
        recipient.email.toLowerCase() === email.trim().toLowerCase()
    )?.token ??
    document.recipients.find((recipient) => recipient.role === "SIGNER")?.token ??
    null
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateWaiverRequest
    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ID)

    if (
      !body.claimantName?.trim() ||
      !body.email?.trim() ||
      !body.projectName?.trim() ||
      !body.payPeriodStart?.trim() ||
      !body.payPeriodEnd?.trim() ||
      typeof body.paymentAmount !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required waiver details" },
        { status: 400 }
      )
    }

    if (!Number.isFinite(templateId) || templateId <= 0) {
      return NextResponse.json(
        { error: "DOCUMENSO_TEMPLATE_ID is not configured" },
        { status: 500 }
      )
    }

    const template = await documenso.templates.get({ templateId })
    const signerRecipient = getSignerRecipient(template.recipients)

    if (!signerRecipient) {
      return NextResponse.json(
        { error: "Template does not have a signer recipient" },
        { status: 422 }
      )
    }

    const prefillFields = template.fields
      .map((field) => toPrefillField(field, body))
      .filter((field): field is SupportedPrefillField => field !== null)
    const formValues = getFormValues(template.fields, body)
    const templateAliasMap = getTemplateAliasMap(template.fields)

    const document = await documenso.templates.use({
      templateId,
      recipients: [
        {
          id: signerRecipient.id,
          name: body.claimantName.trim(),
          email: body.email.trim(),
        },
      ],
      prefillFields: prefillFields.length > 0 ? prefillFields : undefined,
      formValues: Object.keys(formValues).length > 0 ? formValues : undefined,
      override: {
        title: `Conditional Lien Waiver - ${body.claimantName.trim()}`,
      },
    })

    const patchedFieldCount = await patchGeneratedDocumentFields(
      document,
      body,
      templateAliasMap
    )

    await documenso.documents.distribute({
      documentId: document.id,
      meta: {
        distributionMethod: "NONE",
      },
    })

    const signingToken = getSigningToken(document, body.email)

    if (!signingToken) {
      return NextResponse.json(
        { error: "No signing token was returned for the generated waiver" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signingToken,
      documentId: document.id,
      prefilledFieldCount: prefillFields.length,
      patchedFieldCount,
    })
  } catch (error) {
    if (error instanceof TemplateFieldMismatchError) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }

    console.error("Error generating document:", error)
    return NextResponse.json(
      { error: "Failed to generate waiver from template" },
      { status: 500 }
    )
  }
}
