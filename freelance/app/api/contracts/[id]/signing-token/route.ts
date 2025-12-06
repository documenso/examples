import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { documenso } from "@/lib/documenso";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const { userId } = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 },
			);
		}

		const contract = await prisma.contract.findUnique({
			where: { id },
			include: {
				client: true,
				freelancer: true,
			},
		});

		if (!contract) {
			return NextResponse.json(
				{ error: "Contract not found" },
				{ status: 404 },
			);
		}

		const isClient = userId === contract.clientId;
		const isFreelancer = userId === contract.freelancerId;

		if (!isClient && !isFreelancer) {
			return NextResponse.json(
				{ error: "User is not part of this contract" },
				{ status: 403 },
			);
		}

		const templateId = process.env.DOCUMENSO_TEMPLATE_ID;

		if (!templateId) {
			return NextResponse.json(
				{ error: "Documenso template ID not configured" },
				{ status: 500 },
			);
		}

		const templateIdNumber = Number(templateId);

		let documentId = contract.documensoDocumentId;
		let responseRecipients: Array<{ email: string; token: string }>;

		if (documentId) {
			const document = await documenso.documents.get({
				documentId: Number(documentId),
			});
			responseRecipients = document.recipients.map((r) => ({
				email: r.email,
				token: r.token,
			}));
		} else {
			const template = await documenso.templates.get({
				templateId: templateIdNumber,
			});
			const templateRecipients = template.recipients || [];

			if (templateRecipients.length === 0) {
				return NextResponse.json(
					{ error: "Template has no recipients configured" },
					{ status: 400 },
				);
			}

			if (templateRecipients.length < 2) {
				return NextResponse.json(
					{
						error: `Template must have 2 recipients (client + freelancer), but has ${templateRecipients.length}`,
					},
					{ status: 400 },
				);
			}

			const recipients = templateRecipients.map((recipient, index) => ({
				id: recipient.id,
				name: index === 0 ? contract.client.name : contract.freelancer.name,
				email: index === 0 ? contract.client.email : contract.freelancer.email,
				signingOrder: recipient.signingOrder,
				role: recipient.role,
			}));

			const document = await documenso.templates.use({
				templateId: templateIdNumber,
				recipients,
				distributeDocument: true,
			});

			documentId = String(document.id);
			responseRecipients = document.recipients.map((r) => ({
				email: r.email,
				token: r.token,
			}));

			await prisma.contract.update({
				where: { id },
				data: { documensoDocumentId: documentId },
			});
		}

		const currentUserEmail = isClient
			? contract.client.email
			: contract.freelancer.email;

		const userRecipient = responseRecipients.find(
			(r) => r.email === currentUserEmail,
		);

		if (!userRecipient?.token) {
			return NextResponse.json(
				{
					error: "No signing token received from Documenso",
					details: `No token found for email: ${currentUserEmail}`,
				},
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			signingToken: userRecipient.token,
			documentId: documentId,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return NextResponse.json(
			{ error: "Internal server error", details: errorMessage },
			{ status: 500 },
		);
	}
}
