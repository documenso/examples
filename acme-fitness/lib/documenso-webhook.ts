import crypto from "node:crypto"

type DocumensoRecipient = {
  name?: string | null
  email?: string | null
  role?: string | null
  signingStatus?: string | null
}

type DocumensoFormValues = Record<string, unknown> | null | undefined

export type DocumensoWebhook = {
  event: string
  payload: {
    id: number | string
    title: string
    source: string
    completedAt: string | null
    formValues?: DocumensoFormValues
    Recipient?: DocumensoRecipient[]
  }
}

function normalizeFieldName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function getStringValue(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || null
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (value && typeof value === "object") {
    if (
      "value" in value &&
      typeof value.value === "string" &&
      value.value.trim()
    ) {
      return value.value.trim()
    }

    if ("text" in value && typeof value.text === "string" && value.text.trim()) {
      return value.text.trim()
    }
  }

  return null
}

function getFormValue(formValues: DocumensoFormValues, candidates: string[]) {
  if (!formValues) {
    return null
  }

  const normalizedCandidates = new Set(
    candidates.map((candidate) => normalizeFieldName(candidate)),
  )

  for (const [key, value] of Object.entries(formValues)) {
    if (!normalizedCandidates.has(normalizeFieldName(key))) {
      continue
    }

    const stringValue = getStringValue(value)

    if (stringValue) {
      return stringValue
    }
  }

  return null
}

export function verifyDocumensoSecret(secretHeader: string | null) {
  const secret = process.env.DOCUMENSO_WEBHOOK_SECRET

  if (!secret) {
    throw new Error("DOCUMENSO_WEBHOOK_SECRET is not configured")
  }

  if (!secretHeader) {
    return false
  }

  const expected = secret.trim()
  const received = secretHeader.trim()

  if (received.length !== expected.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
}

export function parseWebhook(rawBody: string) {
  return JSON.parse(rawBody) as DocumensoWebhook
}

export function normalizeCompletedWaiver(body: DocumensoWebhook) {
  const signer =
    body.payload.Recipient?.find((recipient) => recipient.role === "SIGNER") ??
    body.payload.Recipient?.[0]

  const memberName =
    getFormValue(body.payload.formValues, [
      "Member Name",
      "Name",
      "Member",
    ]) ??
    signer?.name?.trim() ??
    "Unknown Member"

  const memberEmail =
    getFormValue(body.payload.formValues, ["Email", "Member Email"]) ??
    signer?.email?.trim() ??
    "unknown@example.com"

  if (!body.payload.completedAt) {
    throw new Error("Completed document is missing completedAt")
  }

  return {
    documentId: String(body.payload.id),
    memberName,
    memberEmail,
    documentTitle: body.payload.title,
    completedAt: body.payload.completedAt,
    source: body.payload.source,
    payload: body,
  }
}
