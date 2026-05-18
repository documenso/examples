import { NextRequest, NextResponse } from "next/server"
import {
  createSignedAccessValue,
  DATA_ROOM_ACCESS_COOKIE_NAME,
  DATA_ROOM_ACCESS_MAX_AGE,
} from "@/lib/data-room-access"

function getPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null
}

function getRequiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const documentId = getPositiveNumber(body.documentId)
    const recipientId = getPositiveNumber(body.recipientId)
    const token = getRequiredString(body.token)
    const recipientName = getRequiredString(body.recipientName)
    const recipientEmail = getRequiredString(body.recipientEmail)

    if (!documentId || !recipientId || !token || !recipientName || !recipientEmail) {
      return NextResponse.json(
        {
          error:
            "documentId, recipientId, token, recipientName, and recipientEmail are required.",
        },
        { status: 400 }
      )
    }

    const response = NextResponse.json({
      ok: true,
      documentId,
    })

    response.cookies.set({
      name: DATA_ROOM_ACCESS_COOKIE_NAME,
      value: createSignedAccessValue({
        documentId,
        recipientId,
        token,
        recipientName,
        recipientEmail,
      }),
      httpOnly: true,
      maxAge: DATA_ROOM_ACCESS_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error("Error finalizing data room access:", error)

    return NextResponse.json(
      { error: "Unable to finalize data room access." },
      { status: 500 }
    )
  }
}
