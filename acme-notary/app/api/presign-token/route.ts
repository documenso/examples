import { NextResponse } from "next/server"
import { documenso } from "@/lib/documenso"

export async function POST() {
  try {
    const response =
      await documenso.embedding.embeddingPresignCreateEmbeddingPresignToken({})
    return NextResponse.json({ presignToken: response.token })
  } catch (error) {
    console.error("Presign token error:", error)
    return NextResponse.json(
      { error: "Failed to generate presign token" },
      { status: 500 }
    )
  }
}
