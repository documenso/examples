import { NextResponse } from "next/server"
import { getRecentWaivers } from "@/lib/waivers"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawLimit = Number(searchParams.get("limit") ?? "10")
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.floor(rawLimit), 1), 50)
    : 10
  const result = await getRecentWaivers(limit)

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
