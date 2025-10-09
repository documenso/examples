import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const jobs = await prisma.job.findMany({
      where: status ? { status } : undefined,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedJobs = jobs.map((job) => ({
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
    }))

    return NextResponse.json(transformedJobs)
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, budgetMin, budgetMax, budgetType, duration, skills, postedById } = body

    if (!title || !description || !budgetMin || !budgetMax || !budgetType || !duration || !skills || !postedById) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        budgetType,
        duration,
        skills: JSON.stringify(skills),
        postedById,
        status: "open",
        applicants: 0,
      },
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

    return NextResponse.json(transformedJob, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
