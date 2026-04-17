import { createHmac, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { buildGigSessionSyncData } from "@/lib/gig-session"

type DocumensoWebhookEvent = {
  event?: string
  payload?: {
    id?: number | string
    status?: string | null
    completedAt?: string | null
    recipients?: Array<{
      id: number
      email: string
      signingStatus: string
      signedAt: string | null
    }> | null
    Recipient?: Array<{
      id: number
      email: string
      signingStatus: string
      signedAt: string | null
    }> | null
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.DOCUMENSO_WEBHOOK_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: "DOCUMENSO_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    )
  }

  const rawBody = await request.text()
  const signature = request.headers.get("x-documenso-signature")

  if (!signature || !isValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 })
  }

  let body: DocumensoWebhookEvent

  try {
    body = JSON.parse(rawBody) as DocumensoWebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 })
  }

  if (
    body.event !== "DOCUMENT_SIGNED" &&
    body.event !== "DOCUMENT_COMPLETED"
  ) {
    return NextResponse.json({ ok: true })
  }

  const documentId = body.payload?.id

  if (documentId === undefined || documentId === null) {
    return NextResponse.json({ error: "Webhook payload is missing a document id." }, { status: 400 })
  }

  const session = await db.gigSession.findUnique({
    where: { documentId: String(documentId) },
  })

  if (!session || !body.payload) {
    return NextResponse.json({ ok: true })
  }

  const data = buildGigSessionSyncData(session, body.payload)

  await db.gigSession.update({
    where: { id: session.id },
    data,
  })

  return NextResponse.json({ ok: true })
}

function isValidSignature(rawBody: string, signature: string, secret: string) {
  const providedSignature = signature.replace(/^sha256=/, "")
  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")

  if (providedSignature.length !== expectedSignature.length) {
    return false
  }

  return timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  )
}
