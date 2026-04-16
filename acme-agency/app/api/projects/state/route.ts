import { NextRequest, NextResponse } from "next/server"
import { saveProjectsState, getProjectsState } from "@/lib/project-state"
import { type Project } from "@/lib/mock-data"

export async function GET() {
  try {
    const projects = await getProjectsState()

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error loading project state:", error)

    return NextResponse.json(
      { error: "Failed to load project state" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const projects = body.projects as Project[] | undefined

    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { error: "Projects payload is required" },
        { status: 400 }
      )
    }

    await saveProjectsState(projects)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error saving project state:", error)

    return NextResponse.json(
      { error: "Failed to save project state" },
      { status: 500 }
    )
  }
}
