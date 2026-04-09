import { NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

type Template = Awaited<ReturnType<(typeof documenso.templates)["get"]>>
type TemplateField = NonNullable<Template["fields"]>[number]
type TemplateRecipient = NonNullable<Template["recipients"]>[number]
type GeneratedDocument = Awaited<ReturnType<(typeof documenso.templates)["use"]>>
type GeneratedField = NonNullable<GeneratedDocument["fields"]>[number]
type TemplateUseRequest = Parameters<(typeof documenso.templates)["use"]>[0]
type PrefillField = NonNullable<TemplateUseRequest["prefillFields"]>[number]
type FormValues = NonNullable<TemplateUseRequest["formValues"]>
type DocumentFieldUpdateRequest = Parameters<
  (typeof documenso.documents.fields)["updateMany"]
>[0]
type DocumentFieldUpdate = DocumentFieldUpdateRequest["fields"][number]
type WaiverType = "liability" | "photo"
type StringPrefillFieldType = "text" | "number" | "date" | "radio" | "dropdown"
type DocumensoFieldType = TemplateField["type"]
type FieldAlias =
  | "childName"
  | "childAge"
  | "parentName"
  | "parentEmail"
  | "parentPhone"
  | "medical"
  | "sessionDates"
  | "sessionYear"
  | "emergencyName"
  | "emergencyPhone"
  | "emergencyContact"
  | "waiverDate"

type GenerateWaiverRequest = {
  parentName: string
  childName: string
  childAge?: string
  email: string
  phone?: string
  medical?: string
  sessionDates: string
  emergencyName?: string
  emergencyPhone?: string
  waiverType: WaiverType
}

type WaiverPrefillContext = GenerateWaiverRequest & {
  waiverDate: string
}

type AliasedField = {
  id: number
  recipientId: number
  type: string
  page?: number
  secondaryId?: string
  customText?: string | null
  fieldMeta?: {
    type?: string
    label?: string
    placeholder?: string
  } | null
}

type ResolvedTemplateField = {
  field: TemplateField
  alias: FieldAlias
}

const PREFILL_ALIASES = {
  parentName: [
    "parent guardian full name",
    "parent guardian name",
    "parent legal guardian",
    "parent legal guardian name",
    "parent guardian",
    "parent name",
    "guardian name",
  ],
  parentEmail: ["email address", "parent email", "guardian email"],
  parentPhone: ["phone number", "parent phone", "guardian phone"],
  childName: [
    "child s full name",
    "child s name",
    "child name",
    "camper name",
    "participant information child s full name",
  ],
  childAge: ["age at time of camp", "child age", "camper age"],
  medical: [
    "medical notes",
    "health disclosure",
    "allergies medications medical conditions",
    "conditions allergies or medications",
  ],
  sessionDates: ["session dates", "camp session", "session enrolled", "session"],
  sessionYear: ["camp year", "session year", "year"],
  emergencyContact: [
    "emergency contact",
    "contact name phone relationship to child",
    "emergency contact details",
    "emergency contact info",
  ],
  emergencyName: ["contact name", "emergency contact name", "contact"],
  emergencyPhone: ["contact phone", "emergency contact phone", "phone relationship to child"],
  waiverDate: ["waiver date", "signature date", "signed date", "date signed", "date"],
} as const

type PrefillKey = keyof typeof PREFILL_ALIASES

const SUPPORTED_ALIAS_FIELD_TYPES: Record<FieldAlias, readonly DocumensoFieldType[]> = {
  childName: ["TEXT"],
  childAge: ["TEXT", "NUMBER"],
  parentName: ["TEXT"],
  parentEmail: ["TEXT"],
  parentPhone: ["TEXT", "NUMBER"],
  medical: ["TEXT"],
  sessionDates: ["TEXT"],
  sessionYear: ["TEXT", "NUMBER"],
  emergencyName: ["TEXT"],
  emergencyPhone: ["TEXT", "NUMBER"],
  emergencyContact: ["TEXT"],
  waiverDate: ["DATE", "TEXT"],
}

const REQUIRED_ALIASES: Record<WaiverType, readonly FieldAlias[]> = {
  liability: ["childName", "parentName", "parentEmail", "sessionDates", "waiverDate"],
  photo: ["childName", "parentName", "waiverDate"],
}

function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function normalizeLookup(value: string | null | undefined) {
  return normalizeLabel(value ?? "")
}

function getLookup(field: AliasedField) {
  return normalizeLookup(
    [
      field.secondaryId,
      field.customText,
      field.fieldMeta?.label,
      field.fieldMeta?.placeholder,
    ]
      .filter(Boolean)
      .join(" "),
  )
}

function getPrefillKey(field: AliasedField): PrefillKey | null {
  const lookup = getLookup(field)

  if (!lookup) {
    return null
  }

  for (const [key, aliases] of Object.entries(PREFILL_ALIASES) as Array<
    [PrefillKey, readonly string[]]
  >) {
    if (aliases.some((alias) => lookup.includes(alias))) {
      return key
    }
  }

  return null
}

function getFieldAlias(field: AliasedField) {
  return getPrefillKey(field)
}

function getFieldPosition(value: string | number | null | undefined) {
  const position = Number(value)

  return Number.isFinite(position) ? position : null
}

function relabelPhotoChildNameField(
  fields: TemplateField[],
  resolvedFields: ResolvedTemplateField[],
): ResolvedTemplateField[] {
  const currentChildNameField = resolvedFields.find(({ alias }) => alias === "childName")
  const parentNameField = resolvedFields.find(({ alias }) => alias === "parentName")

  if (!currentChildNameField || !parentNameField) {
    return resolvedFields
  }

  const currentChildY = getFieldPosition(currentChildNameField.field.positionY)
  const parentY = getFieldPosition(parentNameField.field.positionY)

  if (currentChildY === null || parentY === null || currentChildY >= parentY) {
    return resolvedFields
  }

  const replacementField = fields.find((field) => {
    if (field.type !== "TEXT" || getFieldAlias(field) || field.page !== currentChildNameField.field.page) {
      return false
    }

    const fieldY = getFieldPosition(field.positionY)

    return fieldY !== null && fieldY > currentChildY && fieldY < parentY
  })

  if (!replacementField) {
    return resolvedFields
  }

  return [
    ...resolvedFields.filter(
      ({ field, alias }) => !(alias === "childName" && field.id === currentChildNameField.field.id),
    ),
    { field: replacementField, alias: "childName" as const },
  ]
}

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getFieldPrefillType(field: TemplateField): StringPrefillFieldType | null {
  const metaType = field.fieldMeta?.type

  if (
    metaType === "text" ||
    metaType === "number" ||
    metaType === "date" ||
    metaType === "radio" ||
    metaType === "dropdown"
  ) {
    return metaType
  }

  switch (field.type) {
    case "TEXT":
      return "text"
    case "NUMBER":
      return "number"
    case "DATE":
      return "date"
    case "RADIO":
      return "radio"
    case "DROPDOWN":
      return "dropdown"
    default:
      return null
  }
}

function isFieldSupportedForAlias(field: TemplateField, alias: FieldAlias) {
  return SUPPORTED_ALIAS_FIELD_TYPES[alias].includes(field.type)
}

function formatAliasLabel(alias: FieldAlias) {
  switch (alias) {
    case "childName":
      return "child name"
    case "childAge":
      return "child age"
    case "parentName":
      return "parent name"
    case "parentEmail":
      return "parent email"
    case "parentPhone":
      return "parent phone"
    case "medical":
      return "medical notes"
    case "sessionDates":
      return "session dates"
    case "sessionYear":
      return "session year"
    case "emergencyName":
      return "emergency contact name"
    case "emergencyPhone":
      return "emergency contact phone"
    case "emergencyContact":
      return "emergency contact"
    case "waiverDate":
      return "waiver date"
    default:
      return alias
  }
}

function getRawFieldValue(alias: FieldAlias, body: WaiverPrefillContext) {
  switch (alias) {
    case "childName":
      return body.childName.trim()
    case "childAge":
      return body.childAge?.trim() ?? ""
    case "parentName":
      return body.parentName.trim()
    case "parentEmail":
      return body.email.trim()
    case "parentPhone":
      return body.phone?.trim() ?? ""
    case "medical":
      return body.medical?.trim() ?? ""
    case "sessionDates":
      return body.sessionDates.trim()
    case "sessionYear":
      return body.sessionDates.match(/\b(20\d{2})\b/)?.[1] ?? ""
    case "emergencyName":
      return body.emergencyName?.trim() ?? ""
    case "emergencyPhone":
      return body.emergencyPhone?.trim() ?? ""
    case "emergencyContact":
      return [body.emergencyName?.trim(), body.emergencyPhone?.trim()]
        .filter(Boolean)
        .join(" — ")
    case "waiverDate":
      return body.waiverDate
    default:
      return ""
  }
}

function getFieldValue(
  field: Pick<AliasedField, "type" | "fieldMeta">,
  alias: FieldAlias,
  body: WaiverPrefillContext,
) {
  const value = getRawFieldValue(alias, body)

  if (!value) {
    return ""
  }

  const isNumericField = field.fieldMeta?.type === "number" || field.type === "NUMBER"

  return isNumericField ? value.replace(/\D/g, "") : value
}

function getSignerRecipient(recipients: TemplateRecipient[]) {
  return recipients.find((recipient) => recipient.role === "SIGNER") ?? recipients[0]
}

function getResolvedTemplateFields(
  fields: TemplateField[],
  waiverType: WaiverType,
): ResolvedTemplateField[] {
  const resolvedFields = fields.reduce<ResolvedTemplateField[]>((resolvedFields, field) => {
    const alias = getFieldAlias(field)

    if (alias) {
      resolvedFields.push({ field, alias })
    }

    return resolvedFields
  }, [])

  if (waiverType === "photo") {
    return relabelPhotoChildNameField(fields, resolvedFields)
  }

  return resolvedFields
}

function buildPrefillFields(fields: ResolvedTemplateField[], body: WaiverPrefillContext) {
  const prefillFields: PrefillField[] = []

  for (const { field, alias } of fields) {
    const type = getFieldPrefillType(field)
    const value = getFieldValue(field, alias, body)

    if (!type || !value) {
      continue
    }

    prefillFields.push({ id: field.id, type, value } as PrefillField)
  }

  return prefillFields
}

function buildFormValues(fields: ResolvedTemplateField[], body: WaiverPrefillContext) {
  return fields.reduce<FormValues>((formValues, { field, alias }) => {
    if (!field.secondaryId) {
      return formValues
    }

    const value = getFieldValue(field, alias, body)

    if (!value) {
      return formValues
    }

    formValues[field.secondaryId] = value
    return formValues
  }, {})
}

function getTemplateAliasMap(fields: ResolvedTemplateField[]) {
  return fields.reduce<Map<string, FieldAlias>>((map, { field, alias }) => {
    if (field.secondaryId) {
      map.set(field.secondaryId, alias)
    }

    return map
  }, new Map())
}

function getUnsupportedFieldMatches(fields: ResolvedTemplateField[]) {
  return fields
    .filter(({ field, alias }) => !isFieldSupportedForAlias(field, alias))
    .map(({ field, alias }) => ({
      alias: formatAliasLabel(alias),
      fieldId: field.id,
      fieldType: field.type,
      page: field.page,
      supportedTypes: SUPPORTED_ALIAS_FIELD_TYPES[alias],
      lookup:
        field.fieldMeta?.label ||
        field.fieldMeta?.placeholder ||
        field.secondaryId ||
        field.customText ||
        "",
    }))
}

function getMissingRequiredAliases(fields: ResolvedTemplateField[], waiverType: WaiverType) {
  const aliases = new Set(fields.map(({ alias }) => alias))
  const missingAliases = REQUIRED_ALIASES[waiverType].filter((alias) => !aliases.has(alias))

  if (
    waiverType === "liability" &&
    !aliases.has("emergencyContact") &&
    !(aliases.has("emergencyName") && aliases.has("emergencyPhone"))
  ) {
    missingAliases.push("emergencyContact")
  }

  return Array.from(new Set(missingAliases)).map((alias) => formatAliasLabel(alias))
}

function toLockedFieldUpdate(
  field: GeneratedField,
  body: WaiverPrefillContext,
  aliasMap: Map<string, FieldAlias>,
): DocumentFieldUpdate | null {
  const alias = field.secondaryId ? aliasMap.get(field.secondaryId) : null

  if (!alias || !field.fieldMeta) {
    return null
  }

  const value = getFieldValue(field, alias, body)

  if (!value) {
    return null
  }

  if (field.type === "TEXT" && field.fieldMeta.type === "text") {
    return {
      id: field.id,
      type: "TEXT",
      fieldMeta: {
        ...field.fieldMeta,
        type: "text",
        readOnly: true,
        text: value,
      },
    }
  }

  if (field.type === "NUMBER" && field.fieldMeta.type === "number") {
    return {
      id: field.id,
      type: "NUMBER",
      fieldMeta: {
        ...field.fieldMeta,
        type: "number",
        readOnly: true,
        value,
      },
    }
  }

  if (field.type === "DATE" && field.fieldMeta.type === "date") {
    return {
      id: field.id,
      type: "DATE",
      fieldMeta: {
        ...field.fieldMeta,
        type: "date",
        readOnly: true,
      },
    }
  }

  return null
}

async function patchGeneratedDocumentFields(
  document: GeneratedDocument,
  body: WaiverPrefillContext,
  aliasMap: Map<string, FieldAlias>,
) {
  const fieldUpdates = (document.fields ?? [])
    .map((field) => toLockedFieldUpdate(field, body, aliasMap))
    .filter((field): field is DocumentFieldUpdate => field !== null)

  if (!fieldUpdates.length) {
    return
  }

  await documenso.documents.fields.updateMany({
    documentId: document.id,
    fields: fieldUpdates,
  })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateWaiverRequest
    const {
      parentName,
      childName,
      childAge = "",
      email,
      phone = "",
      medical = "",
      sessionDates,
      emergencyName = "",
      emergencyPhone = "",
      waiverType,
    } = body

    if (
      !parentName?.trim() ||
      !childName?.trim() ||
      !email?.trim() ||
      !sessionDates?.trim() ||
      (waiverType !== "liability" && waiverType !== "photo")
    ) {
      return NextResponse.json(
        { error: "Missing required waiver details" },
        { status: 400 },
      )
    }

    if (waiverType === "liability" && (!emergencyName.trim() || !emergencyPhone.trim())) {
      return NextResponse.json(
        { error: "Emergency contact name and phone are required" },
        { status: 400 },
      )
    }

    const envKey =
      waiverType === "liability"
        ? "DOCUMENSO_TEMPLATE_LIABILITY_WAIVER"
        : "DOCUMENSO_TEMPLATE_PHOTO_RELEASE"

    const templateId = Number(process.env[envKey])

    if (!templateId) {
      return NextResponse.json({ error: `Missing ${envKey} env var` }, { status: 500 })
    }

    const template = await documenso.templates.get({ templateId })
    const signerRecipient = getSignerRecipient(template.recipients ?? [])

    if (!signerRecipient) {
      return NextResponse.json(
        { error: "Template has no signer recipient configured" },
        { status: 500 },
      )
    }

    const recipientFields = (template.fields ?? []).filter(
      (field) => field.recipientId === signerRecipient.id,
    )
    const normalizedBody: WaiverPrefillContext = {
      parentName,
      childName,
      childAge,
      email,
      phone,
      medical,
      sessionDates,
      emergencyName,
      emergencyPhone,
      waiverType,
      waiverDate: getTodayDate(),
    }
    const resolvedFields = getResolvedTemplateFields(recipientFields, waiverType)
    const unsupportedFieldMatches = getUnsupportedFieldMatches(resolvedFields)

    if (unsupportedFieldMatches.length > 0) {
      return NextResponse.json(
        {
          error:
            "The configured waiver template uses unsupported Documenso field types for prefill. Convert visible signer NAME/EMAIL fields to TEXT, and use DATE only for actual date values.",
          details: unsupportedFieldMatches,
        },
        { status: 422 },
      )
    }

    const missingRequiredAliases = getMissingRequiredAliases(resolvedFields, waiverType)

    if (missingRequiredAliases.length > 0) {
      return NextResponse.json(
        {
          error:
            "The configured waiver template is missing required labeled prefill fields.",
          details: missingRequiredAliases,
        },
        { status: 422 },
      )
    }

    const prefillFields = buildPrefillFields(resolvedFields, normalizedBody)
    const formValues = buildFormValues(resolvedFields, normalizedBody)
    const aliasMap = getTemplateAliasMap(resolvedFields)

    if (!prefillFields.length && Object.keys(formValues).length === 0) {
      return NextResponse.json(
        { error: "The configured waiver template does not expose recognizable prefill fields" },
        { status: 422 },
      )
    }

    const result = await documenso.templates.use({
      templateId,
      recipients: [
        {
          id: signerRecipient.id,
          email: email.trim(),
          name: parentName.trim(),
        },
      ],
      prefillFields: prefillFields.length > 0 ? prefillFields : undefined,
      formValues: Object.keys(formValues).length > 0 ? formValues : undefined,
    })

    await patchGeneratedDocumentFields(result, normalizedBody, aliasMap)
    await documenso.documents.distribute({
      documentId: result.id,
      meta: {
        distributionMethod: "NONE",
      },
    })

    const signer =
      result.recipients?.find((recipient) => recipient.id === signerRecipient.id) ??
      result.recipients?.find((recipient) => recipient.role === "SIGNER") ??
      result.recipients?.find(
        (recipient) => recipient.email.toLowerCase() === email.trim().toLowerCase(),
      )

    if (!signer?.token) {
      return NextResponse.json({ error: "No signing token returned" }, { status: 500 })
    }

    return NextResponse.json({ token: signer.token })
  } catch (error) {
    console.error("Failed to generate waiver:", error)
    return NextResponse.json({ error: "Failed to generate waiver" }, { status: 500 })
  }
}
