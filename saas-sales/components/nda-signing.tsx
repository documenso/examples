"use client";

import { EmbedDirectTemplate } from "@documenso/embed-react";
import { CheckCircle2, FileText, Shield } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { DemoData } from "./demo-scheduler";

type NdaSigningProps = {
	demoData: DemoData;
	onSigned: (documentId: string) => void;
};

export function NdaSigning({ demoData, onSigned }: NdaSigningProps) {
	const [isSigned, setIsSigned] = useState(false);

	const handleDocumentReady = () => {
		console.log("[v0] Documenso document is ready");
	};

	const handleDocumentCompleted = (data: {
		token: string;
		documentId: number;
		recipientId: number;
	}) => {
		console.log("[v0] Document completed:", data);
		setIsSigned(true);

		setTimeout(() => {
			onSigned(data.documentId.toString());
		}, 1500);
	};

	const handleDocumentError = (error: string) => {
		console.error("[v0] Document signing error:", error);
	};

	const handleFieldSigned = () => {
		console.log("[v0] Field signed");
	};

	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b border-border">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FileText className="h-6 w-6 text-accent" />
						<span className="text-xl font-semibold">Documenso Pro</span>
					</div>
					<div className="flex items-center gap-3 text-sm">
						<Shield className="h-4 w-4 text-accent" />
						<span className="text-muted-foreground">
							Secure Document Signing
						</span>
					</div>
				</div>
			</header>

			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-4xl">
					<div className="mb-8 flex items-center justify-center gap-2">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
								<CheckCircle2 className="h-5 w-5 text-accent" />
							</div>
							<span className="text-sm text-muted-foreground">Details</span>
						</div>
						<div className="w-16 h-px bg-border" />
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
								<span className="text-sm font-semibold text-accent-foreground">
									2
								</span>
							</div>
							<span className="text-sm font-semibold">NDA Signing</span>
						</div>
						<div className="w-16 h-px bg-border" />
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
								<span className="text-sm text-muted-foreground">3</span>
							</div>
							<span className="text-sm text-muted-foreground">
								Confirmation
							</span>
						</div>
					</div>

					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold mb-4">
							Sign the NDA to continue
						</h1>
						<p className="text-lg text-muted-foreground">
							To access sensitive product features and pricing, we require a
							signed NDA
						</p>
					</div>

					<Card className="p-8 bg-card border-border mb-6">
						<div className="mb-6 flex items-center justify-between pb-4 border-b border-border">
							<div>
								<h3 className="text-lg font-semibold mb-1">
									Non-Disclosure Agreement
								</h3>
								<p className="text-sm text-muted-foreground">
									Enterprise Demo Access
								</p>
							</div>
							<div className="text-right">
								<p className="text-sm text-muted-foreground">Recipient</p>
								<p className="font-medium">{demoData.name}</p>
								<p className="text-sm text-muted-foreground">
									{demoData.email}
								</p>
							</div>
						</div>

						<div className="bg-background rounded-lg border border-border overflow-hidden mb-6 h-[calc(100vh-500px)] min-h-[600px]">
							<EmbedDirectTemplate
								token={process.env.NEXT_PUBLIC_DOCUMENSO_TEMPLATE_TOKEN || ""}
								className="h-full w-full"
								host="https://stg-app.documenso.com"
								name={demoData.name}
								email={demoData.email}
								lockEmail={true}
								externalId={`${demoData.company}-demo-${Date.now()}`}
								onDocumentReady={handleDocumentReady}
								onDocumentCompleted={handleDocumentCompleted}
								onDocumentError={handleDocumentError}
								onFieldSigned={handleFieldSigned}
							/>
						</div>

						{isSigned && (
							<div className="p-6 bg-accent/10 border border-accent rounded-lg flex items-center gap-3">
								<CheckCircle2 className="h-6 w-6 text-accent" />
								<div>
									<p className="font-semibold text-accent">
										Document Signed Successfully
									</p>
									<p className="text-sm text-muted-foreground">
										Redirecting to calendar confirmation...
									</p>
								</div>
							</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}
