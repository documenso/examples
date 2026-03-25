import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface MilestoneInput {
	title: string;
	description: string;
	amount: string;
	dueDate: string;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const clientId = searchParams.get("clientId");
		const freelancerId = searchParams.get("freelancerId");
		const status = searchParams.get("status");

		const where: Prisma.ContractWhereInput = {};
		if (clientId) where.clientId = clientId;
		if (freelancerId) where.freelancerId = freelancerId;
		if (status) where.status = status;

		const contracts = await prisma.contract.findMany({
			where,
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
			orderBy: {
				createdAt: "desc",
			},
		});

		const transformedContracts = contracts.map((contract) => ({
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
				status: milestone.status as
					| "pending"
					| "in-progress"
					| "completed"
					| "paid",
			})),
			createdAt: contract.createdAt.toISOString().split("T")[0],
		}));

		return NextResponse.json(transformedContracts);
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch contracts" },
			{ status: 500 },
		);
	}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { jobId, clientId, freelancerId, milestones } = body;

		if (
			!jobId ||
			!clientId ||
			!freelancerId ||
			!milestones ||
			!Array.isArray(milestones)
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const contract = await prisma.contract.create({
			data: {
				jobId,
				clientId,
				freelancerId,
				status: "pending-signatures",
				clientSigned: false,
				freelancerSigned: false,
				milestones: {
					create: milestones.map((milestone: MilestoneInput) => ({
						title: milestone.title,
						description: milestone.description,
						amount: parseFloat(milestone.amount),
						dueDate: new Date(milestone.dueDate),
						status: "pending",
					})),
				},
			},
			include: {
				milestones: {
					orderBy: {
						dueDate: "asc",
					},
				},
			},

		});
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
				status: milestone.status as
					| "pending"
					| "in-progress"
					| "completed"
					| "paid",
			})),
			createdAt: contract.createdAt.toISOString().split("T")[0],
		};

		return NextResponse.json(transformedContract, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Failed to create contract" },
			{ status: 500 },
		);
	}
}
