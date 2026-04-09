import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const DATA_ROOM_ACCESS_COOKIE_NAME = "acme_deals_access"
export const DATA_ROOM_ACCESS_MAX_AGE = 60 * 60 * 8

type DataRoomAccessPayload = {
  documentId: number
  recipientId: number
  token: string
  recipientName: string
  recipientEmail: string
  expiresAt: number
}

export type ValidatedDataRoomAccess = {
  documentId: number
  recipientId: number
  recipientName: string
  recipientEmail: string
}

function getCookieSecret() {
  const apiKey = process.env.DOCUMENSO_API_KEY

  if (!apiKey) {
    throw new Error("DOCUMENSO_API_KEY is required to sign data room access.")
  }

  return apiKey
}

function signValue(value: string) {
  return createHmac("sha256", getCookieSecret())
    .update(value)
    .digest("base64url")
}

function parsePayload(value: string): DataRoomAccessPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as Partial<DataRoomAccessPayload>

    if (
      typeof parsed.documentId !== "number" ||
      typeof parsed.recipientId !== "number" ||
      typeof parsed.token !== "string" ||
      typeof parsed.recipientName !== "string" ||
      typeof parsed.recipientEmail !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null
    }

    return parsed as DataRoomAccessPayload
  } catch {
    return null
  }
}

function verifySignedValue(value: string) {
  const [payload, signature] = value.split(".")

  if (!payload || !signature) {
    return null
  }

  const expectedSignature = signValue(payload)
  const expectedBuffer = Buffer.from(expectedSignature)
  const receivedBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== receivedBuffer.length) {
    return null
  }

  if (!timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return null
  }

  const parsedPayload = parsePayload(payload)

  if (!parsedPayload) {
    return null
  }

  if (parsedPayload.expiresAt <= Math.floor(Date.now() / 1000)) {
    return null
  }

  return parsedPayload
}

export function createSignedAccessValue(input: {
  documentId: number
  recipientId: number
  token: string
  recipientName: string
  recipientEmail: string
}) {
  const payload: DataRoomAccessPayload = {
    ...input,
    expiresAt: Math.floor(Date.now() / 1000) + DATA_ROOM_ACCESS_MAX_AGE,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  )

  return `${encodedPayload}.${signValue(encodedPayload)}`
}

function getValidatedDataRoomAccessFromPayload(payload: DataRoomAccessPayload) {
  return {
    documentId: payload.documentId,
    recipientId: payload.recipientId,
    recipientName: payload.recipientName,
    recipientEmail: payload.recipientEmail,
  } satisfies ValidatedDataRoomAccess
}

export async function getValidatedDataRoomAccess() {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(DATA_ROOM_ACCESS_COOKIE_NAME)?.value

  if (!cookieValue) {
    return null
  }

  const payload = verifySignedValue(cookieValue)

  if (!payload) {
    return null
  }

  return getValidatedDataRoomAccessFromPayload(payload)
}
