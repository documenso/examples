import { NextRequest, NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"
import { getParticipant } from "@/lib/mock-data"

type AuditEntry = Awaited<
  ReturnType<(typeof documenso.envelope)["envelopeAuditLogFind"]>
>["data"][number]

function describeAuditEntry(entry: AuditEntry) {
  switch (entry.type) {
    case "DOCUMENT_CREATED":
      return "Document generated from the informed consent template"
    case "DOCUMENT_FIELD_PREFILLED":
      return "Participant and study metadata pre-filled on the document"
    case "DOCUMENT_SENT":
      return "Signing request distributed to the participant"
    case "DOCUMENT_OPENED":
      return "Participant opened the informed consent form"
    case "DOCUMENT_RECIPIENT_COMPLETED":
      return "Participant finished their required signing actions"
    case "DOCUMENT_COMPLETED":
      return "Envelope marked complete by Documenso"
    default:
      return entry.type.replaceAll("_", " ").toLowerCase()
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const participant = getParticipant(id)

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }

    const envelopeId = request.nextUrl.searchParams.get("envelopeId")

    if (!envelopeId) {
      return NextResponse.json(
        { error: "envelopeId is required" },
        { status: 400 },
      )
    }

    const [envelope, auditLog] = await Promise.all([
      documenso.envelopes.get({ envelopeId }),
      documenso.envelope.envelopeAuditLogFind({
        envelopeId,
        page: 1,
        perPage: 100,
        orderByColumn: "createdAt",
        orderByDirection: "asc",
      }),
    ])

    return NextResponse.json({
      envelope: {
        id: envelope.id,
        title: envelope.title,
        status: envelope.status,
        createdAt: envelope.createdAt,
        updatedAt: envelope.updatedAt,
        completedAt: envelope.completedAt,
        recipients: envelope.recipients.map((recipient) => ({
          id: recipient.id,
          name: recipient.name,
          email: recipient.email,
          role: recipient.role,
          signingStatus: recipient.signingStatus,
          signedAt: recipient.signedAt,
        })),
      },
      audit: {
        count: auditLog.count,
        entries: auditLog.data.map((entry) => ({
          id: entry.id,
          type: entry.type,
          createdAt: entry.createdAt,
          summary: describeAuditEntry(entry),
          actorName: entry.name ?? null,
          actorEmail: entry.email ?? null,
          ipAddress: entry.ipAddress ?? null,
        })),
      },
    })
  } catch (error) {
    console.error("Failed to load audit trail:", error)
    return NextResponse.json(
      { error: "Failed to load audit trail from Documenso" },
      { status: 500 },
    )
  }
}
