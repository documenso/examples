import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    if (!role || (role !== "client" && role !== "freelancer")) {
      return NextResponse.json({ error: "Invalid role parameter. Must be 'client' or 'freelancer'" }, { status: 400 })
    }
    const user = await prisma.user.findFirst({
      where: { role },
    })

    if (!user) {
      return NextResponse.json(
        { error: `No ${role} user found. Please run 'bun db:seed' to create demo users.` },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
