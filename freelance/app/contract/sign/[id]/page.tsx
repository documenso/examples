"use client";

import { EmbedSignDocument } from "@documenso/embed-react";
import { useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	FileText,
	PenTool,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { queryKeys, useApplications, useContract, useJob } from "@/lib/queries";
import { useUser } from "@/lib/user-context";

export default function SignContractPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const queryClient = useQueryClient();
	const { userId, isClient, isFreelancer } = useUser();

	const { data: contract, isLoading: contractLoading } = useContract(id);
	const { data: job, isLoading: jobLoading } = useJob(contract?.jobId || "");
	const { data: applications = [] } = useApplications(
		contract?.jobId ? { jobId: contract.jobId } : undefined,
	);
	const application = applications[0];
	const loading = contractLoading || jobLoading;

	const [signingToken, setSigningToken] = useState<string | null>(null);
	const [isLoadingToken, setIsLoadingToken] = useState(false);

	// Fetch signing token on-demand when component loads
	useEffect(() => {
		if (!contract || !userId || loading) return;

		const fetchSigningToken = async () => {
			setIsLoadingToken(true);
			try {
				const response = await fetch(`/api/contracts/${id}/signing-token`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userId }),
				});

				if (response.ok) {
					const data = await response.json();
					setSigningToken(data.signingToken);
				} else {
				}
			} catch {
			} finally {
				setIsLoadingToken(false);
			}
		};

		fetchSigningToken();
	}, [contract, userId, id, loading]);

	const hasUserSigned =
		(isClient && userId === contract?.clientId && contract.clientSigned) ||
		(isFreelancer &&
			userId === contract?.freelancerId &&
			contract.freelancerSigned);

	const handleDocumentCompleted = async () => {
		await queryClient.invalidateQueries({ queryKey: queryKeys.contracts() });
		await queryClient.invalidateQueries({ queryKey: queryKeys.contract(id) });

		alert("Contract signed successfully! 🎉");
		router.push(`/dashboard`);
	};

	const handleDocumentError = () => {
		alert("Failed to sign document. Please try again.");
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
					<p className="text-muted-foreground">Loading contract...</p>
				</div>
			</div>
		);
	}

	if (!contract || !job || !application) {
		return (
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
					<h1 className="text-2xl font-bold">Contract not found</h1>
					<Button asChild className="mt-4">
						<a href="/dashboard">Back to Dashboard</a>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Navigation />

			<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">				<div className="mb-8">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
							<FileText className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h1 className="text-2xl font-bold">Contract Signing</h1>
							<p className="text-sm text-muted-foreground">
								Review and sign the contract to begin work
							</p>
						</div>
					</div>
				</div>				<Card className="mb-6 border-primary/20 bg-primary/5">
					<CardContent className="flex items-center gap-4 py-4">
						<AlertCircle className="h-5 w-5 text-primary" />
						<div className="flex-1">
							<p className="font-medium">Signature Required</p>
							<p className="text-sm text-muted-foreground">
								{!contract.clientSigned && !contract.freelancerSigned
									? "Both parties need to sign this contract"
									: contract.clientSigned && !contract.freelancerSigned
										? "Waiting for freelancer to sign"
										: !contract.clientSigned && contract.freelancerSigned
											? "Waiting for client to sign"
											: "Contract fully executed"}
							</p>
						</div>
						<div className="flex gap-2">
							<Badge variant={contract.clientSigned ? "default" : "secondary"}>
								{contract.clientSigned ? (
									<CheckCircle2 className="mr-1 h-3 w-3" />
								) : (
									<Clock className="mr-1 h-3 w-3" />
								)}
								Client
							</Badge>
							<Badge
								variant={contract.freelancerSigned ? "default" : "secondary"}
							>
								{contract.freelancerSigned ? (
									<CheckCircle2 className="mr-1 h-3 w-3" />
								) : (
									<Clock className="mr-1 h-3 w-3" />
								)}
								Freelancer
							</Badge>
						</div>
					</CardContent>
				</Card>

				<div className="grid gap-8 lg:grid-cols-3">
					<div className="space-y-6 lg:col-span-2">						<Card className="border-2 border-primary/20">
							<CardHeader className="pt-0">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center bg-primary/10 justify-center rounded-lg">
										<PenTool className="h-5 w-5 text-primary" />
									</div>
									<div>
										<CardTitle>Sign with Documenso</CardTitle>
										<CardDescription>
											Secure embedded document signing
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4 px-2">
								{hasUserSigned ? (
									<div className="rounded-lg border-green-200 bg-green-50 p-8 text-center">
										<CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
										<h4 className="mb-2 font-semibold text-green-900">
											You&apos;ve Already Signed
										</h4>
										<p className="mb-4 text-sm text-green-700">
											{contract.clientSigned && contract.freelancerSigned
												? "Contract is fully signed! 🎉"
												: "Waiting for the other party to sign the contract."}
										</p>
										{contract.clientSigned && contract.freelancerSigned && (
											<Button
												onClick={() => router.push(`/dashboard`)}
											>
												Go to Dashboard
											</Button>
										)}
									</div>
								) : isLoadingToken ? (
									<div className="rounded-lg bg-muted/50 p-8 text-center">
										<Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground animate-spin" />
										<h4 className="mb-2 font-semibold">
											Preparing Signing Interface
										</h4>
										<p className="text-sm text-muted-foreground">
											Generating your signing token...
										</p>
									</div>
								) : signingToken ? (
									<div style={{ minHeight: "800px" }}>
										<EmbedSignDocument
											className="h-220 w-full"
											token={signingToken}
											host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST}
											onDocumentCompleted={handleDocumentCompleted}
											onDocumentError={handleDocumentError}
										/>
									</div>
								) : (
									<div className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 text-center">
										<AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
										<h4 className="mb-2 font-semibold">
											Unable to Load Signing Interface
										</h4>
										<p className="text-sm text-muted-foreground">
											Failed to generate signing token. Please try refreshing
											the page.
										</p>
									</div>
								)}

								<p className="text-center text-xs text-muted-foreground">
									By signing, you agree to the terms and conditions outlined in
									this contract
								</p>
							</CardContent>
						</Card>						<Card>
							<CardHeader>
								<CardTitle>Freelance Service Agreement</CardTitle>
								<CardDescription>Contract ID: {contract.id}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">								<div>
									<h3 className="mb-3 font-semibold">Parties</h3>
									<div className="space-y-3">
										<div className="flex items-center gap-3 rounded-lg border border-border p-3">
											<Avatar className="h-10 w-10">
												<AvatarImage
													src={job.postedBy.avatar || "/placeholder.svg"}
													alt={job.postedBy.name}
												/>
												<AvatarFallback>{job.postedBy.name[0]}</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<p className="font-medium">{job.postedBy.name}</p>
												<p className="text-sm text-muted-foreground">Client</p>
											</div>
											{contract.clientSigned && (
												<CheckCircle2 className="h-5 w-5 text-green-600" />
											)}
										</div>
										<div className="flex items-center gap-3 rounded-lg border border-border p-3">
											<Avatar className="h-10 w-10">
												<AvatarImage
													src={
														application.freelancer.avatar || "/placeholder.svg"
													}
													alt={application.freelancer.name}
												/>
												<AvatarFallback>
													{application.freelancer.name[0]}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<p className="font-medium">
													{application.freelancer.name}
												</p>
												<p className="text-sm text-muted-foreground">
													Freelancer
												</p>
											</div>
											{contract.freelancerSigned && (
												<CheckCircle2 className="h-5 w-5 text-green-600" />
											)}
										</div>
									</div>
								</div>

								<Separator />								<div>
									<h3 className="mb-3 font-semibold">Project Details</h3>
									<div className="space-y-2 text-sm">
										<div>
											<span className="text-muted-foreground">Project:</span>
											<span className="ml-2 font-medium">{job.title}</span>
										</div>
										<div>
											<span className="text-muted-foreground">
												Total Value:
											</span>
											<span className="ml-2 font-medium">
												$
												{contract.milestones
													.reduce((sum, m) => sum + m.amount, 0)
													.toLocaleString()}
											</span>
										</div>
										<div>
											<span className="text-muted-foreground">Duration:</span>
											<span className="ml-2 font-medium">
												{application.proposedDuration}
											</span>
										</div>
									</div>
								</div>

								<Separator />								<div>
									<h3 className="mb-3 font-semibold">Payment Milestones</h3>
									<div className="space-y-3">
										{contract.milestones.map((milestone, index) => (
											<div
												key={milestone.id}
												className="rounded-lg border border-border p-4"
											>
												<div className="mb-2 flex items-start justify-between">
													<div>
														<h4 className="font-medium">
															Milestone {index + 1}: {milestone.title}
														</h4>
														<p className="mt-1 text-sm text-muted-foreground">
															{milestone.description}
														</p>
													</div>
													<Badge variant="outline">
														${milestone.amount.toLocaleString()}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground">
													Due:{" "}
													{new Date(milestone.dueDate).toLocaleDateString()}
												</p>
											</div>
										))}
									</div>
								</div>

								<Separator />								<div>
									<h3 className="mb-3 font-semibold">Terms & Conditions</h3>
									<div className="space-y-2 text-sm text-muted-foreground">
										<p>
											1.{" "}
											<strong className="text-foreground">
												Payment Terms:
											</strong>{" "}
											Payments will be released upon completion and approval of
											each milestone.
										</p>
										<p>
											2.{" "}
											<strong className="text-foreground">
												Intellectual Property:
											</strong>{" "}
											All work product created under this agreement becomes the
											property of the Client upon full payment.
										</p>
										<p>
											3.{" "}
											<strong className="text-foreground">
												Confidentiality:
											</strong>{" "}
											Both parties agree to maintain confidentiality of
											proprietary information.
										</p>
										<p>
											4.{" "}
											<strong className="text-foreground">Termination:</strong>{" "}
											Either party may terminate this agreement with 14 days
											written notice.
										</p>
										<p>
											5.{" "}
											<strong className="text-foreground">
												Dispute Resolution:
											</strong>{" "}
											Any disputes will be resolved through the platform&apos;s
											mediation process.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Signing Status</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										{contract.clientSigned ? (
											<CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
										) : (
											<Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
										)}
										<div className="flex-1">
											<p className="font-medium">Client Signature</p>
											<p className="text-sm text-muted-foreground">
												{contract.clientSigned ? "Signed" : "Pending"}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										{contract.freelancerSigned ? (
											<CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
										) : (
											<Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
										)}
										<div className="flex-1">
											<p className="font-medium">Freelancer Signature</p>
											<p className="text-sm text-muted-foreground">
												{contract.freelancerSigned ? "Signed" : "Pending"}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">Contract Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Total Value</span>
									<span className="font-semibold">
										$
										{contract.milestones
											.reduce((sum, m) => sum + m.amount, 0)
											.toLocaleString()}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Milestones</span>
									<span className="font-semibold">
										{contract.milestones.length}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Created</span>
									<span className="font-semibold">
										{new Date(contract.createdAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Status</span>
									<Badge variant="secondary">{contract.status}</Badge>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">Need Help?</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm text-muted-foreground">
								<p>If you have questions about this contract, you can:</p>
								<ul className="space-y-1">
									<li>• Contact the other party</li>
									<li>• Review our contract guidelines</li>
									<li>• Reach out to support</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
