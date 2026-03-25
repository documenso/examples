import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            jobsPosted: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      budget: {
        min: job.budgetMin,
        max: job.budgetMax,
        type: job.budgetType as "fixed" | "hourly",
      },
      duration: job.duration,
      skills: JSON.parse(job.skills),
      postedBy: {
        name: job.postedBy.name,
        avatar: job.postedBy.avatar || "",
        rating: job.postedBy.rating || 0,
        jobsPosted: job.postedBy.jobsPosted,
      },
      postedAt: job.createdAt.toISOString().split("T")[0],
      applicants: job._count.applications,
      status: job.status as "open" | "in-progress" | "completed",
    }

    return NextResponse.json(transformedJob)
  } catch {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Prisma.JobUpdateInput = {}

    if (body.title) updateData.title = body.title
    if (body.description) updateData.description = body.description
    if (body.budgetMin !== undefined) updateData.budgetMin = parseFloat(body.budgetMin)
    if (body.budgetMax !== undefined) updateData.budgetMax = parseFloat(body.budgetMax)
    if (body.budgetType) updateData.budgetType = body.budgetType
    if (body.duration) updateData.duration = body.duration
    if (body.skills) updateData.skills = JSON.stringify(body.skills)
    if (body.status) updateData.status = body.status
    if (body.applicants !== undefined) updateData.applicants = body.applicants

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            jobsPosted: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    const transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      budget: {
        min: job.budgetMin,
        max: job.budgetMax,
        type: job.budgetType as "fixed" | "hourly",
      },
      duration: job.duration,
      skills: JSON.parse(job.skills),
      postedBy: {
        name: job.postedBy.name,
        avatar: job.postedBy.avatar || "",
        rating: job.postedBy.rating || 0,
        jobsPosted: job.postedBy.jobsPosted,
      },
      postedAt: job.createdAt.toISOString().split("T")[0],
      applicants: job._count.applications,
      status: job.status as "open" | "in-progress" | "completed",
    }

    return NextResponse.json(transformedJob)
  } catch {
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.job.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Job deleted successfully" })
  } catch {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
