import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
          },
        },
        milestones: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
    })

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    const transformedContract = {
      id: contract.id,
      jobId: contract.jobId,
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
      status: contract.status as "pending-signatures" | "active" | "completed",
      clientSigned: contract.clientSigned,
      freelancerSigned: contract.freelancerSigned,
      milestones: contract.milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        amount: milestone.amount,
        dueDate: milestone.dueDate.toISOString().split("T")[0],
        status: milestone.status as "pending" | "in-progress" | "completed" | "paid",
      })),
      createdAt: contract.createdAt.toISOString().split("T")[0],
    }

    return NextResponse.json(transformedContract)
  } catch {
    return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 })
  }
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Prisma.ContractUpdateInput = {}

    if (body.status !== undefined) updateData.status = body.status
    if (body.clientSigned !== undefined) updateData.clientSigned = body.clientSigned
    if (body.freelancerSigned !== undefined) updateData.freelancerSigned = body.freelancerSigned

    const contract = await prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        milestones: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
    })

    const transformedContract = {
      id: contract.id,
      jobId: contract.jobId,
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
      status: contract.status as "pending-signatures" | "active" | "completed",
      clientSigned: contract.clientSigned,
      freelancerSigned: contract.freelancerSigned,
      milestones: contract.milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        amount: milestone.amount,
        dueDate: milestone.dueDate.toISOString().split("T")[0],
        status: milestone.status as "pending" | "in-progress" | "completed" | "paid",
      })),
      createdAt: contract.createdAt.toISOString().split("T")[0],
    }

    return NextResponse.json(transformedContract)
  } catch {
    return NextResponse.json({ error: "Failed to update contract" }, { status: 500 })
  }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await prisma.contract.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Contract deleted successfully" })
  } catch {
    return NextResponse.json({ error: "Failed to delete contract" }, { status: 500 })
  }
}
