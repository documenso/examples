import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import { getClient } from "@/lib/mock-data"

type TemplateField = Awaited<ReturnType<(typeof documenso.templates)["get"]>>["fields"][number]
type TemplateRecipient =
  Awaited<ReturnType<(typeof documenso.templates)["get"]>>["recipients"][number]
type TemplateUseRequest = Parameters<(typeof documenso.templates)["use"]>[0]

function getSignerRecipient(recipients: TemplateRecipient[]) {
  return recipients.find((recipient) => recipient.role === "SIGNER") ?? recipients[0]
}

function getSortablePosition(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0)
}

function matchesRegion(
  field: TemplateField,
  {
    page,
    type,
    minX,
    maxX,
    minY,
    maxY,
  }: {
    page: number
    type: TemplateField["type"]
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
  },
) {
  const x = getSortablePosition(field.positionX)
  const y = getSortablePosition(field.positionY)

  return (
    field.page === page &&
    field.type === type &&
    (minX === undefined || x >= minX) &&
    (maxX === undefined || x <= maxX) &&
    (minY === undefined || y >= minY) &&
    (maxY === undefined || y <= maxY)
  )
}

function createTextPrefillField(
  field: TemplateField,
  value: string,
): NonNullable<TemplateUseRequest["prefillFields"]>[number] {
  if (!field.fieldMeta || field.fieldMeta.type !== "text") {
    throw new Error(`Field ${field.id} is not a text field`)
  }

  return {
    id: field.id,
    type: "text",
    label: field.fieldMeta.label,
    placeholder: field.fieldMeta.placeholder,
    value,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, email } = body

    if (!clientId || !email) {
      return NextResponse.json(
        { error: "Client and email are required" },
        { status: 400 },
      )
    }

    const client = getClient(String(clientId))

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ID)

    if (!Number.isFinite(templateId) || templateId <= 0) {
      return NextResponse.json(
        { error: "DOCUMENSO_TEMPLATE_ID is not configured" },
        { status: 500 },
      )
    }

    const template = await documenso.templates.get({ templateId })
    const signerRecipient = getSignerRecipient(template.recipients)

    if (!signerRecipient) {
      return NextResponse.json(
        { error: "Template does not have a signer recipient" },
        { status: 422 },
      )
    }

    const taxpayerNameField = template.fields.find((field) =>
      matchesRegion(field, { page: 1, type: "NAME", maxX: 45, minY: 26, maxY: 30 }),
    )
    const filingStatusField = template.fields.find((field) =>
      matchesRegion(field, { page: 1, type: "TEXT", minX: 60, minY: 30, maxY: 33 }),
    )
    const preparerNameField = template.fields.find((field) =>
      matchesRegion(field, { page: 1, type: "NAME", maxX: 35, minY: 67, maxY: 70 }),
    )

    if (!taxpayerNameField || !filingStatusField || !preparerNameField) {
      return NextResponse.json(
        {
          error:
            "Template is missing one or more expected 8879 fields for taxpayer name, filing status, or preparer name.",
        },
        { status: 422 },
      )
    }

    const prefillFields = [
      createTextPrefillField(filingStatusField, client.filingStatus),
    ]
    const formValues: NonNullable<TemplateUseRequest["formValues"]> = {
      [taxpayerNameField.secondaryId]: client.name,
      [preparerNameField.secondaryId]: client.preparerName,
    }

    const document = await documenso.templates.use({
      templateId,
      recipients: [
        {
          id: signerRecipient.id,
          name: client.name,
          email,
        },
      ],
      distributeDocument: true,
      prefillFields,
      formValues,
    })

    const signingToken = document.recipients?.[0]?.token

    if (!signingToken) {
      return NextResponse.json(
        { error: "Failed to get signing token for generated document" },
        { status: 500 },
      )
    }

    return NextResponse.json({ signingToken, documentId: document.id })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 },
    )
  }
}
