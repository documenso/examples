import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface TemplateRecipient {
	id: number;
	signingOrder: number;
	role: string;
}

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

		const apiKey = process.env.DOCUMENSO_API_KEY;
		const templateId = process.env.DOCUMENSO_TEMPLATE_ID;
		const documensoHost =
			process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
			"https://stg-app.documenso.com";

		if (!apiKey || !templateId) {
			return NextResponse.json(
				{ error: "Documenso API key or template ID not configured" },
				{ status: 500 },
			);
		}

		let documentId = contract.documensoDocumentId;
		let responseRecipients;

		if (documentId) {
			const documentResponse = await fetch(
				`${documensoHost}/api/v2-beta/documents/${documentId}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				},
			);

			if (!documentResponse.ok) {
				const errorText = await documentResponse.text();
				return NextResponse.json(
					{ error: "Failed to fetch existing document", details: errorText },
					{ status: documentResponse.status },
				);
			}

			const documentData = await documentResponse.json();
			responseRecipients = documentData.recipients || [];
		} else {
			const templateResponse = await fetch(
				`${documensoHost}/api/v2-beta/template/${templateId}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				},
			);

			if (!templateResponse.ok) {
				const errorText = await templateResponse.text();
				return NextResponse.json(
					{ error: "Failed to fetch template details", details: errorText },
					{ status: templateResponse.status },
				);
			}

			const templateData = await templateResponse.json();
			const templateRecipients = templateData.recipients || [];

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

			const recipients = templateRecipients.map((recipient: TemplateRecipient, index: number) => ({
				id: recipient.id,
				name: index === 0 ? contract.client.name : contract.freelancer.name,
				email: index === 0 ? contract.client.email : contract.freelancer.email,
				signingOrder: recipient.signingOrder,
				role: recipient.role,
			}));

			const response = await fetch(`${documensoHost}/api/v2-beta/template/use`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					templateId: parseInt(templateId),
					recipients,
					distributeDocument: true,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				return NextResponse.json(
					{ error: "Failed to generate document", details: errorText },
					{ status: response.status },
				);
			}

			const data = await response.json();
			documentId = data.documentId;
			responseRecipients = data.recipients || [];

			await prisma.contract.update({
				where: { id },
				data: { documensoDocumentId: documentId },
			});
		}

		const currentUserEmail = isClient
			? contract.client.email
			: contract.freelancer.email;

		const userRecipient = responseRecipients.find(
			(r: { email: string }) => r.email === currentUserEmail,
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
