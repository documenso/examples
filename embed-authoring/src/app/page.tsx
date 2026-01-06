import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createPresignToken } from "@/lib/create-presign-token";
import { type DocumentsResponse, findDocuments } from "@/lib/find-documents";
import { getDocument } from "@/lib/get-document";
import { sendDocument } from "@/lib/send-document";
import { Inbox } from "lucide-react";
import { match } from "ts-pattern";
import { CreateDocument } from "./create-document";
import { SendDocument } from "./send-document";
import { UpdateDocument } from "./update-document";
import { ViewDocument } from "./view-document";

async function getDocumentUrlAction(documentId: number): Promise<string> {
	"use server";

	return await getDocument(documentId);
}

async function sendDocumentAction(documentId: number): Promise<void> {
	"use server";

	return await sendDocument(documentId);
}

export default async function Dashboard() {
	const host = process.env.DOCUMENSO_HOST || "https://app.documenso.com";
	const presignToken = await createPresignToken();

	const { data: documents } = await findDocuments();

	const getStatusVariant = (
		status: DocumentsResponse["data"][number]["status"],
	) => {
		return match(status)
			.with("COMPLETED", () => "default" as const)
			.with("PENDING", () => "secondary" as const)
			.with("REJECTED", () => "destructive" as const)
			.otherwise(() => "outline" as const);
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="bg-card border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex justify-between items-center">
						<h1 className="text-2xl font-semibold">Documents</h1>

						<CreateDocument host={host} presignToken={presignToken} />
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{documents.length > 0 ? (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									<TableHead className="first:pl-4 last:pr-4 w-[300px] font-medium">
										Name
									</TableHead>
									<TableHead className="first:pl-4 last:pr-4 font-medium">
										Date
									</TableHead>
									<TableHead className="first:pl-4 last:pr-4 font-medium">
										Status
									</TableHead>
									<TableHead className="first:pl-4 last:pr-4 text-right font-medium">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{documents.map((document) => (
									<TableRow key={document.id}>
										<TableCell className="py-4 font-medium first:pl-4 last:pr-4">
											{document.title}
										</TableCell>
										<TableCell className="py-4 first:pl-4 last:pr-4">
											{new Date(document.createdAt).toUTCString()}
										</TableCell>
										<TableCell className="py-4 first:pl-4 last:pr-4">
											<Badge variant={getStatusVariant(document.status)}>
												{document.status}
											</Badge>
										</TableCell>
										<TableCell className="py-4 text-right first:pl-4 last:pr-4">
											{match(document.status)
												.with("DRAFT", () => (
													<div className="inline-flex items-center gap-2">
														<SendDocument
															documentId={document.id}
															sendDocument={sendDocumentAction}
														/>

														<UpdateDocument
															host={host}
															documentId={document.id}
															presignToken={presignToken}
														/>
													</div>
												))
												.otherwise(() => (
													<div className="inline-flex items-center gap-2">
														<ViewDocument
															documentId={document.id}
															documentTitle={document.title}
															fetchDocumentUrl={getDocumentUrlAction}
															disabled={
																document.status === "PENDING" ||
																document.status === "REJECTED"
															}
														/>

														{document.status !== "COMPLETED" && (
															<UpdateDocument
																host={host}
																documentId={document.id}
																presignToken={presignToken}
															/>
														)}
													</div>
												))}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<Card className="text-center p-10">
						<CardContent className="pt-10 pb-10 flex flex-col items-center">
							<Inbox className="h-12 w-12 text-muted-foreground" />
							<CardTitle className="mt-4">No documents</CardTitle>
							<CardDescription className="mt-2">
								Get started by uploading your first document.
							</CardDescription>
							<div className="mt-6">
								<CreateDocument host={host} presignToken={presignToken} />
							</div>
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
