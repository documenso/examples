import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

type TemplateResponse = Awaited<ReturnType<(typeof documenso.templates)["get"]>>
type TemplateField = TemplateResponse["fields"][number]
type TemplateRecipient = TemplateResponse["recipients"][number]
type TemplateUseRequest = Parameters<(typeof documenso.templates)["use"]>[0]

type PrefillKey =
  | "participantName"
  | "studyId"
  | "protocolVersion"
  | "siteName"
  | "studyTitle"
  | "protocolNumber"
  | "sponsor"

const FIELD_ALIASES: Record<PrefillKey, readonly string[]> = {
  participantName: [
    "participantname",
    "participant_name",
    "signername",
    "subjectname",
    "patientname",
    "researchsubjectname",
  ],
  studyId: [
    "studyid",
    "study_id",
    "trialid",
    "trial_id",
    "studyidentifier",
    "studyidentificationnumber",
  ],
  protocolVersion: [
    "protocolversion",
    "protocol_version",
    "currentprotocolversion",
    "protocolrevision",
    "version",
  ],
  siteName: ["sitename", "site_name", "site"],
  studyTitle: ["studytitle", "study_title", "trialtitle"],
  protocolNumber: [
    "protocolnumber",
    "protocol_number",
    "protocolid",
    "protocol",
  ],
  sponsor: ["sponsor", "studysponsor"],
}

const PARTICIPANT_RECIPIENT_ALIASES = [
  "participant",
  "subject",
  "patient",
  "researchsubject",
] as const

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function toNumber(value: string | number | null | undefined) {
  return typeof value === "number" ? value : Number(value ?? 0)
}

function scoreRecipient(recipient: TemplateRecipient, fields: TemplateField[]) {
  return fields
    .filter((field) => field.recipientId === recipient.id)
    .reduce((score, field) => {
      switch (field.type) {
        case "NAME":
          return score + 10
        case "TEXT":
          return score + 6
        case "NUMBER":
          return score + 4
        case "CHECKBOX":
          return score + 3
        case "INITIALS":
          return score + 2
        case "DATE":
        case "SIGNATURE":
          return score + 1
        default:
          return score
      }
    }, 0)
}

function getParticipantRecipient(
  recipients: TemplateRecipient[],
  fields: TemplateField[],
) {
  const signerRecipients = recipients.filter((recipient) => recipient.role === "SIGNER")

  const namedRecipient = signerRecipients.find((recipient) => {
    const recipientText = normalizeKey(`${recipient.name}${recipient.email ?? ""}`)

    return PARTICIPANT_RECIPIENT_ALIASES.some((alias) =>
      recipientText.includes(normalizeKey(alias)),
    )
  })

  if (namedRecipient) {
    return namedRecipient
  }

  return [...signerRecipients].sort(
    (left, right) => scoreRecipient(right, fields) - scoreRecipient(left, fields),
  )[0]
}

function pushPrefillField(
  field: TemplateField,
  value: string,
  prefillFields: NonNullable<TemplateUseRequest["prefillFields"]>,
) {
  const fieldMeta = field.fieldMeta

  switch (fieldMeta?.type) {
    case "text":
      prefillFields.push({
        id: field.id,
        type: "text",
        label: fieldMeta.label ?? "",
        placeholder: fieldMeta.placeholder ?? "",
        value,
      })
      return true

    case "number":
      if (!/^\d+(?:\.\d+)?$/.test(value)) {
        return false
      }

      prefillFields.push({
        id: field.id,
        type: "number",
        label: fieldMeta.label ?? "",
        placeholder: fieldMeta.placeholder ?? "",
        value,
      })
      return true

    case "date":
      prefillFields.push({
        id: field.id,
        type: "date",
        value,
      })
      return true

    default:
      return false
  }
}

function sortFieldsByGeometry(fields: TemplateField[]) {
  return [...fields].sort(
    (left, right) =>
      toNumber(left.positionY) - toNumber(right.positionY) ||
      toNumber(left.positionX) - toNumber(right.positionX),
  )
}

function tryApplyPrefill(
  field: TemplateField,
  fieldKey: PrefillKey,
  fieldValues: Partial<Record<PrefillKey, string>>,
  prefillFields: NonNullable<TemplateUseRequest["prefillFields"]>,
  matchedKeys: Set<PrefillKey>,
  usedFieldIds: Set<number>,
) {
  if (matchedKeys.has(fieldKey) || usedFieldIds.has(field.id)) {
    return
  }

  const value = fieldValues[fieldKey]

  if (!value) {
    return
  }

  if (pushPrefillField(field, value, prefillFields)) {
    matchedKeys.add(fieldKey)
    usedFieldIds.add(field.id)
  }
}

function inferBriefAlignedConsentFields(fields: TemplateField[]) {
  const firstPageFields = fields.filter((field) => toNumber(field.page) === 1)
  const firstPageTextFields = sortFieldsByGeometry(
    firstPageFields.filter((field) => {
      const fieldType = field.fieldMeta?.type
      return fieldType === "text" || fieldType === "number"
    }),
  )
  const firstPageNameFields = sortFieldsByGeometry(
    firstPageFields.filter((field) => field.fieldMeta?.type === "name"),
  )

  if (firstPageNameFields.length === 1 && firstPageTextFields.length === 3) {
    return {
      studyId: firstPageTextFields[0],
      protocolVersion: firstPageTextFields[1],
      siteName: firstPageTextFields[2],
    } satisfies Partial<Record<PrefillKey, TemplateField>>
  }

  if (firstPageTextFields.length === 4) {
    return {
      participantName: firstPageTextFields[0],
      studyId: firstPageTextFields[1],
      protocolVersion: firstPageTextFields[2],
      siteName: firstPageTextFields[3],
    } satisfies Partial<Record<PrefillKey, TemplateField>>
  }

  if (firstPageNameFields.length >= 1 && firstPageTextFields.length >= 6) {
    return {
      studyTitle: firstPageTextFields[0],
      protocolNumber: firstPageTextFields[1],
      siteName: firstPageTextFields[3],
      sponsor: firstPageTextFields[5],
    } satisfies Partial<Record<PrefillKey, TemplateField>>
  }

  return {}
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      participantName?: string
      email?: string
      studyId?: string
      protocolVersion?: string
      siteName?: string
      studyTitle?: string
      protocolNumber?: string
      sponsor?: string
    }

    const {
      participantName,
      email,
      studyId,
      protocolVersion,
      siteName,
      studyTitle,
      protocolNumber,
      sponsor,
    } = body

    if (!participantName || !email || !studyId || !protocolVersion || !siteName) {
      return NextResponse.json(
        {
          error:
            "participantName, email, studyId, protocolVersion, and siteName are required",
        },
        { status: 400 },
      )
    }

    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ID)

    if (!Number.isFinite(templateId) || templateId <= 0) {
      return NextResponse.json(
        { error: "DOCUMENSO_TEMPLATE_ID is not configured" },
        { status: 500 },
      )
    }

    const template = await documenso.templates.get({ templateId })
    const participantRecipient = getParticipantRecipient(template.recipients, template.fields)

    if (!participantRecipient) {
      return NextResponse.json(
        { error: "Template does not contain a signer recipient" },
        { status: 422 },
      )
    }

    const templateFields = template.fields.filter(
      (field) => field.recipientId === participantRecipient.id,
    )

    const fieldValues: Partial<Record<PrefillKey, string>> = {
      participantName,
      studyId,
      protocolVersion,
      siteName,
      studyTitle,
      protocolNumber,
      sponsor,
    }

    const prefillFields: NonNullable<TemplateUseRequest["prefillFields"]> = []
    const matchedKeys = new Set<PrefillKey>()
    const usedFieldIds = new Set<number>()

    for (const field of templateFields) {
      const fieldMeta = field.fieldMeta
      const candidates = [
        fieldMeta?.label ? normalizeKey(fieldMeta.label) : "",
        fieldMeta?.placeholder ? normalizeKey(fieldMeta.placeholder) : "",
        field.secondaryId ? normalizeKey(field.secondaryId) : "",
        field.customText ? normalizeKey(field.customText) : "",
      ]

      for (const [fieldKey, aliases] of Object.entries(FIELD_ALIASES) as Array<
        [PrefillKey, readonly string[]]
      >) {
        if (!aliases.some((alias) => candidates.includes(normalizeKey(alias)))) {
          continue
        }

        tryApplyPrefill(
          field,
          fieldKey,
          fieldValues,
          prefillFields,
          matchedKeys,
          usedFieldIds,
        )
        break
      }
    }

    const inferredFields = inferBriefAlignedConsentFields(templateFields)

    for (const [fieldKey, field] of Object.entries(inferredFields) as Array<
      [PrefillKey, TemplateField | undefined]
    >) {
      if (!field) {
        continue
      }

      tryApplyPrefill(
        field,
        fieldKey,
        fieldValues,
        prefillFields,
        matchedKeys,
        usedFieldIds,
      )
    }

    const hasAutoFilledNameField = templateFields.some(
      (field) => field.fieldMeta?.type === "name",
    )

    if (!prefillFields.length && !hasAutoFilledNameField) {
      return NextResponse.json(
        {
          error:
            "Template does not expose any pre-fillable participant or study fields for the participant recipient.",
        },
        { status: 422 },
      )
    }

    const document = await documenso.templates.use({
      templateId,
      recipients: [
        {
          id: participantRecipient.id,
          name: participantName,
          email,
        },
      ],
      distributeDocument: true,
      prefillFields: prefillFields.length ? prefillFields : undefined,
    })

    const signer =
      document.recipients?.find((recipient) => recipient.email === email) ??
      document.recipients?.[0]

    if (!signer?.token) {
      return NextResponse.json(
        { error: "Failed to generate a signing token" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      signingToken: signer.token,
      documentId: document.id,
      envelopeId: document.envelopeId,
    })
  } catch (error) {
    console.error("Error generating ICF document:", error)
    return NextResponse.json(
      { error: "Failed to generate informed consent document" },
      { status: 500 },
    )
  }
}
