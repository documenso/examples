import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const jobId = searchParams.get("jobId");
		const freelancerId = searchParams.get("freelancerId");
		const status = searchParams.get("status");

		const where: Prisma.ApplicationWhereInput = {};
		if (jobId) where.jobId = jobId;
		if (freelancerId) where.freelancerId = freelancerId;
		if (status) where.status = status;

		const applications = await prisma.application.findMany({
			where,
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
			orderBy: {
				createdAt: "desc",
			},
		});

		const transformedApplications = applications.map((app) => ({
			id: app.id,
			jobId: app.jobId,
			freelancer: {
				id: app.freelancer.id,
				name: app.freelancer.name,
				avatar: app.freelancer.avatar || "",
				title: app.freelancer.title || "",
				rating: app.freelancer.rating || 0,
				completedJobs: app.freelancer.completedJobs,
				hourlyRate: app.freelancer.hourlyRate || 0,
			},
			coverLetter: app.coverLetter,
			proposedBudget: app.proposedBudget,
			proposedDuration: app.proposedDuration,
			status: app.status as "pending" | "accepted" | "rejected",
			appliedAt: app.createdAt.toISOString().split("T")[0],
		}));

		return NextResponse.json(transformedApplications);
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch applications" },
			{ status: 500 },
		);
	}
}
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			jobId,
			freelancerId,
			coverLetter,
			proposedBudget,
			proposedDuration,
		} = body;

		if (
			!jobId ||
			!freelancerId ||
			!coverLetter ||
			!proposedBudget ||
			!proposedDuration
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const job = await prisma.job.findUnique({ where: { id: jobId } });
		if (!job) {
			return NextResponse.json({ error: "Job not found" }, { status: 404 });
		}

		const existingApplication = await prisma.application.findFirst({
			where: {
				jobId,
				freelancerId,
			},
		});


		if (existingApplication) {
			return NextResponse.json(
				{ error: "You have already applied to this job" },
				{ status: 400 },
			);
		}

		const application = await prisma.application.create({
			data: {
				jobId,
				freelancerId,
				coverLetter,
				proposedBudget: parseFloat(proposedBudget),
				proposedDuration,
				status: "pending",
			},
			include: {
				freelancer: {
					select: {
						id: true,
						name: true,
						avatar: true,
						title: true,
						rating: true,
						completedJobs: true,
						hourlyRate: true,
		});
		await prisma.job.update({
			where: { id: jobId },
			data: {
				applicants: {
					increment: 1,
				},
		});

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
		};

		return NextResponse.json(transformedApplication, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Failed to create application" },
			{ status: 500 },
		);
	}
}
