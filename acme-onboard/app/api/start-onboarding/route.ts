import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { documenso } from "@/lib/documenso"

interface StartOnboardingBody {
  employeeName: string
  email: string
  role: string
  startDate: string
  salary: string
}

// Placeholder email used in all templates for the new-hire signer
const HIRE_PLACEHOLDER_EMAIL = "hire@acme.com"

async function createDocFromTemplate(
  templateId: number,
  email: string,
  name: string,
  textValues?: string[],
) {
  const template = await documenso.templates.get({ templateId })

  // Find the new-hire recipient by placeholder email
  const hireRecipient = template.recipients.find(
    (r) => r.email === HIRE_PLACEHOLDER_EMAIL,
  )
  if (!hireRecipient) {
    throw new Error(
      `No recipient with email ${HIRE_PLACEHOLDER_EMAIL} in template ${templateId}`,
    )
  }

  // Build prefill from the template's actual TEXT field IDs
  let prefillFields: Array<{ type: "text"; id: number; value: string }> | undefined
  if (textValues?.length) {
    const textFields = template.fields
      .filter((f) => f.type === "TEXT" && f.recipientId === hireRecipient.id)
      .sort((a, b) => {
        if (a.page !== b.page) return a.page - b.page
        // Treat fields within 2% Y as the same row, then sort left-to-right
        const rowA = Math.round(Number(a.positionY) / 2)
        const rowB = Math.round(Number(b.positionY) / 2)
        if (rowA !== rowB) return rowA - rowB
        return Number(a.positionX) - Number(b.positionX)
      })
    prefillFields = textFields.slice(0, textValues.length).map((field, i) => ({
      type: "text" as const,
      id: field.id,
      value: textValues[i],
    }))
    if (!prefillFields.length) prefillFields = undefined
  }

  const result = await documenso.templates.use({
    templateId,
    recipients: [{ id: hireRecipient.id, email, name }],
    prefillFields,
    distributeDocument: true,
  })

  const recipient = result.recipients?.find((r) => r.email === email)
  if (!recipient?.token) {
    throw new Error(
      `No signing token returned for template ${templateId}`,
    )
  }

  return recipient.token
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartOnboardingBody

    if (!body.employeeName || !body.email) {
      return NextResponse.json(
        { error: "employeeName and email are required" },
        { status: 400 },
      )
    }

    const offerTemplateId = Number(
      process.env.DOCUMENSO_TEMPLATE_OFFER_LETTER,
    )
    const ndaTemplateId = Number(process.env.DOCUMENSO_TEMPLATE_NDA)
    const handbookTemplateId = Number(
      process.env.DOCUMENSO_TEMPLATE_HANDBOOK,
    )

    if (!offerTemplateId || !ndaTemplateId || !handbookTemplateId) {
      return NextResponse.json(
        { error: "Template environment variables not configured" },
        { status: 500 },
      )
    }

    // Pre-fill values mapped to TEXT fields in visual order (top-to-bottom, left-to-right):
    //   Offer Letter: no TEXT fields on this template
    //   NDA: Position, Department, Company
    //   Handbook: Employee Name
    const [offerToken, ndaToken, handbookToken] = await Promise.all([
      createDocFromTemplate(offerTemplateId, body.email, body.employeeName),
      createDocFromTemplate(ndaTemplateId, body.email, body.employeeName, [
        body.role, body.role, "Acme Corp",
      ]),
      createDocFromTemplate(handbookTemplateId, body.email, body.employeeName, [
        body.employeeName,
      ]),
    ])

    const session = await db.onboardingSession.create({
      data: {
        employeeName: body.employeeName,
        email: body.email,
        role: body.role,
        startDate: body.startDate,
        salary: body.salary,
        offerToken,
        ndaToken,
        handbookToken,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Failed to start onboarding:", error)
    const message =
      error instanceof Error ? error.message : "Failed to create onboarding session"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}