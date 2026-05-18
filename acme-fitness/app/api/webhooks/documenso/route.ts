import { NextResponse } from "next/server"
import {
  normalizeCompletedWaiver,
  parseWebhook,
  verifyDocumensoSecret,
} from "@/lib/documenso-webhook"
import { insertWaiverEvent } from "@/lib/waivers"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const rawBody = await request.text()
  const secretHeader = request.headers.get("x-documenso-secret")

  if (!verifyDocumensoSecret(secretHeader)) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 })
  }

  let body

  try {
    body = parseWebhook(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  if (body.event !== "DOCUMENT_COMPLETED") {
    return NextResponse.json({ ok: true })
  }

  try {
    const waiver = normalizeCompletedWaiver(body)
    await insertWaiverEvent(waiver)
  } catch (error) {
    console.error("Failed to process Documenso webhook", error)

    return NextResponse.json(
      { error: "Failed to process webhook payload" },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true })
}
