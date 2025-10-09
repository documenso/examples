import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Prisma.ApplicationUpdateInput = {}

    if (body.status !== undefined) {
      if (!["pending", "accepted", "rejected"].includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.status = body.status
    }

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            title: true,
            rating: true,
            completedJobs: true,
            hourlyRate: true,
          },
        },
      },
    })

    const transformedApplication = {
      id: application.id,
      jobId: application.jobId,
      freelancer: {
        id: application.freelancer.id,
        name: application.freelancer.name,
        avatar: application.freelancer.avatar || "",
        title: application.freelancer.title || "",
        rating: application.freelancer.rating || 0,
        completedJobs: application.freelancer.completedJobs,
        hourlyRate: application.freelancer.hourlyRate || 0,
      },
      coverLetter: application.coverLetter,
      proposedBudget: application.proposedBudget,
      proposedDuration: application.proposedDuration,
      status: application.status as "pending" | "accepted" | "rejected",
      appliedAt: application.createdAt.toISOString().split("T")[0],
    }

    return NextResponse.json(transformedApplication)
  } catch {
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}
