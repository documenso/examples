import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { documenso } from "@/lib/documenso"
import {
  FIRM_NAME,
  TOTAL_ONBOARDING_DOCS,
  calculateFee,
  formatAumCurrency,
  getMockClient,
} from "@/lib/mock-clients"

type TemplateField = Awaited<
  ReturnType<typeof documenso.templates.get>
>["fields"][number]

type PrefillField =
  | { id: number; type: "text"; label?: string; placeholder?: string; value?: string }
  | { id: number; type: "number"; label?: string; placeholder?: string; value?: string }
  | { id: number; type: "date"; value?: string }
  | { id: number; type: "checkbox"; label?: string; value?: string[] }
  | { id: number; type: "radio"; label?: string; value?: string }
  | { id: number; type: "dropdown"; label?: string; value?: string }

type FormValue = string | number | boolean
type FieldFallbackMatch = {
  type?: string[]
  page?: number
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
}

type TemplateConfig = {
  templateId: number
  title: string
  fieldValues: Array<{
    key: string
    value: string | string[]
    dateValue?: string
    labels: string[]
    secondaryIds?: string[]
    fallback?: FieldFallbackMatch
  }>
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

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

function getFieldLabel(field: Pick<TemplateField, "fieldMeta" | "customText">) {
  return field.fieldMeta?.label || field.customText
}

function toNumber(value: unknown) {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function getFieldValue(
  field: Pick<TemplateField, "fieldMeta">,
  config: TemplateConfig["fieldValues"][number]
) {
  if (field.fieldMeta?.type === "date") {
    return config.dateValue ?? (Array.isArray(config.value) ? config.value[0] : config.value)
  }

  return config.value
}

function createPrefillField(
  field: TemplateField,
  config: TemplateConfig["fieldValues"][number]
): PrefillField | null {
  const type = field.fieldMeta?.type
  const label = getFieldLabel(field)
  const value = getFieldValue(field, config)

  if (type === "number") {
    return {
      type: "number",
      id: field.id,
      label,
      placeholder: field.fieldMeta?.placeholder,
      value: Array.isArray(value) ? value[0] : value.replace(/[^\d.-]/g, ""),
    }
  }

  if (type === "date") {
    return {
      type: "date",
      id: field.id,
      value: Array.isArray(value) ? value[0] : value,
    }
  }

  if (type === "checkbox") {
    return {
      type: "checkbox",
      id: field.id,
      label,
      value: Array.isArray(value) ? value : [value],
    }
  }

  if (type === "radio") {
    return {
      type: "radio",
      id: field.id,
      label,
      value: Array.isArray(value) ? value[0] : value,
    }
  }

  if (type === "dropdown") {
    return {
      type: "dropdown",
      id: field.id,
      label,
      value: Array.isArray(value) ? value[0] : value,
    }
  }

  if (type === "text") {
    return {
      type: "text",
      id: field.id,
      label,
      placeholder: field.fieldMeta?.placeholder,
      value: Array.isArray(value) ? value[0] : value,
    }
  }

  return null
}

function getSignerFieldIds(template: Awaited<ReturnType<typeof documenso.templates.get>>) {
  const signerRecipientIds = template.recipients
    .filter((recipient) => recipient.role === "SIGNER")
    .map((recipient) => recipient.id)

  const allowedRecipientIds =
    signerRecipientIds.length > 0
      ? signerRecipientIds
      : template.recipients.map((recipient) => recipient.id)

  return new Set(allowedRecipientIds)
}

function matchesFallback(
  field: TemplateField,
  fallback: FieldFallbackMatch | undefined
) {
  if (!fallback) {
    return false
  }

  const x = toNumber(field.positionX)
  const y = toNumber(field.positionY)

  if (fallback.type && !fallback.type.includes(field.fieldMeta?.type ?? "")) {
    return false
  }

  if (fallback.page !== undefined && field.page !== fallback.page) {
    return false
  }

  if (fallback.xMin !== undefined && (x === null || x < fallback.xMin)) {
    return false
  }

  if (fallback.xMax !== undefined && (x === null || x > fallback.xMax)) {
    return false
  }

  if (fallback.yMin !== undefined && (y === null || y < fallback.yMin)) {
    return false
  }

  if (fallback.yMax !== undefined && (y === null || y > fallback.yMax)) {
    return false
  }

  return true
}

function matchesField(
  field: TemplateField,
  config: TemplateConfig["fieldValues"][number]
) {
  return (
    [field.fieldMeta?.label, field.fieldMeta?.placeholder, field.customText].some((value) =>
      matchesAlias(value, config.labels)
    ) ||
    config.secondaryIds?.some((secondaryId) =>
      matchesAlias(field.secondaryId, [secondaryId])
    ) ||
    matchesFallback(field, config.fallback) ||
    false
  )
}

function getFormValue(
  field: TemplateField,
  config: TemplateConfig["fieldValues"][number]
): FormValue | null {
  const value = getFieldValue(field, config)

  if (Array.isArray(value)) {
    return null
  }

  return value
}

function createPrefillPayload(
  fields: TemplateField[],
  values: TemplateConfig["fieldValues"]
) {
  const matchedFieldIds = new Set<number>()
  const missingRequiredFields: string[] = []
  const prefillFields: PrefillField[] = []
  const formValues: Record<string, FormValue> = {}

  for (const valueConfig of values) {
    const field = fields.find(
      (templateField) =>
        !matchedFieldIds.has(templateField.id) &&
        matchesField(templateField, valueConfig)
    )

    if (!field) {
      missingRequiredFields.push(valueConfig.key)
      continue
    }

    matchedFieldIds.add(field.id)

    const prefillField = createPrefillField(field, valueConfig)

    if (prefillField) {
      prefillFields.push(prefillField)
    }

    if (field.secondaryId) {
      const formValue = getFormValue(field, valueConfig)

      if (formValue !== null) {
        formValues[field.secondaryId] = formValue
      }
    }
  }

  return {
    prefillFields,
    formValues,
    missingRequiredFields,
  }
}

async function findSigningToken(
  documentId: number,
  recipients:
    | Array<{
        token?: string | null
      }>
    | undefined
) {
  const inlineToken = recipients?.find((recipient) => recipient.token)?.token

  if (inlineToken) {
    return inlineToken
  }

  const document = await documenso.documents.get({ documentId })

  return document.recipients.find((recipient) => recipient.token)?.token ?? null
}

async function createDocumentFromTemplate(
  config: TemplateConfig,
  clientName: string,
  email: string
) {
  const template = await documenso.templates.get({ templateId: config.templateId })
  const signerFieldIds = getSignerFieldIds(template)
  const signerFields = template.fields.filter((field) =>
    signerFieldIds.has(field.recipientId)
  )

  if (template.recipients.length === 0) {
    throw new Error(`Template ${config.templateId} has no recipients configured`)
  }

  const recipients = template.recipients.map((recipient) => ({
    id: recipient.id,
    name: clientName,
    email,
    signingOrder: recipient.signingOrder,
    role: recipient.role,
  }))

  const { prefillFields, formValues, missingRequiredFields } = createPrefillPayload(
    signerFields,
    config.fieldValues
  )

  if (missingRequiredFields.length > 0) {
    throw new Error(
      `Template ${config.templateId} is missing required prefill fields: ${missingRequiredFields.join(
        ", "
      )}`
    )
  }

  const document = await documenso.templates.use({
    templateId: config.templateId,
    recipients,
    distributeDocument: true,
    prefillFields: prefillFields.length > 0 ? prefillFields : undefined,
    formValues: Object.keys(formValues).length > 0 ? formValues : undefined,
    override: {
      title: config.title,
    },
  })

  const signingToken = await findSigningToken(document.id, document.recipients)

  if (!signingToken) {
    throw new Error(`No signing token returned for template ${config.templateId}`)
  }

  return signingToken
}

async function reserveSession(args: {
  prospectId: string
  clientName: string
  email: string
  aum: string
  fee: string
}) {
  try {
    return await db.clientSession.create({
      data: {
        prospectId: args.prospectId,
        clientName: args.clientName,
        email: args.email,
        aum: args.aum,
        fee: args.fee,
        pipelineStage: "onboarding",
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return db.clientSession.findUnique({
        where: { prospectId: args.prospectId },
      })
    }

    throw error
  }
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prospectId = String(body.prospectId ?? "")
    const email = String(body.email ?? "").trim()

    if (!prospectId || !email) {
      return NextResponse.json(
        { error: "prospectId and email are required" },
        { status: 400 }
      )
    }

    const prospect = getMockClient(prospectId)

    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
    }

    const imaTemplateId = Number(process.env.DOCUMENSO_TEMPLATE_IMA)
    const feeTemplateId = Number(process.env.DOCUMENSO_TEMPLATE_FEE_ACK)
    const advTemplateId = Number(process.env.DOCUMENSO_TEMPLATE_ADV_DISCLOSURE)

    if (!imaTemplateId || !feeTemplateId || !advTemplateId) {
      return NextResponse.json(
        { error: "All three Documenso template IDs must be configured" },
        { status: 500 }
      )
    }

    const clientName = prospect.name
    const aum = formatAumCurrency(prospect.aum)
    const fee = calculateFee(prospect.aum)
    const now = new Date()
    const effectiveDate = dateFormatter.format(now)
    const effectiveDateIso = formatIsoDate(now)

    const session = await reserveSession({
      prospectId,
      clientName,
      email,
      aum,
      fee,
    })

    if (!session) {
      return NextResponse.json(
        { error: "Failed to reserve an onboarding session" },
        { status: 500 }
      )
    }

    if (
      session.pipelineStage === "active" ||
      (session.imaToken && session.feeToken && session.advToken)
    ) {
      return NextResponse.json({
        sessionId: session.id,
        pipelineStage: session.pipelineStage,
      })
    }

    try {
      const imaToken = await createDocumentFromTemplate(
        {
          templateId: imaTemplateId,
          title: `${clientName} — Investment Management Agreement`,
          fieldValues: [
            {
              key: "Client Name",
              value: clientName,
              labels: ["Client Name", "Client"],
              secondaryIds: ["client-name"],
              fallback: {
                type: ["name"],
                page: 1,
                yMin: 26,
                yMax: 28,
              },
            },
            {
              key: "AUM",
              value: aum,
              labels: ["AUM", "Assets Under Management"],
              secondaryIds: ["aum"],
              fallback: {
                type: ["number"],
                page: 1,
                xMax: 48,
                yMin: 30,
                yMax: 31.5,
              },
            },
            {
              key: "Fee %",
              value: fee,
              labels: ["Fee Schedule", "Annual Fee %", "Fee %"],
              secondaryIds: ["fee-schedule", "annual-fee"],
              fallback: {
                type: ["number"],
                page: 1,
                xMin: 48,
                yMin: 30,
                yMax: 31.5,
              },
            },
            {
              key: "Effective Date",
              value: effectiveDate,
              dateValue: effectiveDateIso,
              labels: ["Effective Date"],
              secondaryIds: ["effective-date"],
              fallback: {
                type: ["date"],
                page: 1,
                yMin: 33,
                yMax: 35,
              },
            },
          ],
        },
        clientName,
        email
      )

      const feeToken = await createDocumentFromTemplate(
        {
          templateId: feeTemplateId,
          title: `${clientName} — Fee Acknowledgment`,
          fieldValues: [
            {
              key: "Client Name",
              value: clientName,
              labels: ["Client Name", "Client"],
              secondaryIds: ["client-name"],
              fallback: {
                type: ["name"],
                page: 1,
                yMin: 22,
                yMax: 24.5,
              },
            },
            {
              key: "Fee %",
              value: fee,
              labels: ["Annual Fee %", "Fee %", "Advisory Fee"],
              secondaryIds: ["annual-fee", "fee-percent"],
              fallback: {
                type: ["number"],
                page: 1,
                yMin: 26,
                yMax: 28.5,
              },
            },
            {
              key: "Effective Date",
              value: effectiveDate,
              dateValue: effectiveDateIso,
              labels: ["Effective Date"],
              secondaryIds: ["effective-date"],
              fallback: {
                type: ["date"],
                page: 1,
                xMin: 50,
                yMin: 26,
                yMax: 28.5,
              },
            },
          ],
        },
        clientName,
        email
      )

      const advToken = await createDocumentFromTemplate(
        {
          templateId: advTemplateId,
          title: `${clientName} — ADV Part 2 Disclosure`,
          fieldValues: [
            {
              key: "Client Name",
              value: clientName,
              labels: ["Client Name", "Client"],
              secondaryIds: ["client-name"],
              fallback: {
                type: ["name"],
                page: 1,
                yMin: 26,
                yMax: 28.5,
              },
            },
            {
              key: "Firm Name",
              value: FIRM_NAME,
              labels: ["Firm Name", "Adviser", "Advisory Firm"],
              secondaryIds: ["firm-name", "advisor-name"],
              fallback: {
                type: ["text"],
                page: 1,
                yMin: 23,
                yMax: 25.5,
              },
            },
            {
              key: "Effective Date",
              value: effectiveDate,
              dateValue: effectiveDateIso,
              labels: ["Effective Date"],
              secondaryIds: ["effective-date"],
              fallback: {
                type: ["date"],
                page: 1,
                yMin: 30,
                yMax: 32.5,
              },
            },
          ],
        },
        clientName,
        email
      )

      await db.clientSession.update({
        where: { id: session.id },
        data: {
          imaToken,
          feeToken,
          advToken,
        },
      })
    } catch (error) {
      await db.clientSession.delete({ where: { id: session.id } }).catch(() => undefined)
      throw error
    }

    return NextResponse.json({
      sessionId: session.id,
      totalDocuments: TOTAL_ONBOARDING_DOCS,
    })
  } catch (error) {
    console.error("Error starting onboarding:", error)
    return NextResponse.json(
      { error: "Failed to start onboarding" },
      { status: 500 }
    )
  }
}
