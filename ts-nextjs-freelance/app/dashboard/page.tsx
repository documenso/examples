"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	Briefcase,
	CheckCircle2,
	Clock,
	DollarSign,
	FileText,
	PenTool,
	Star,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	queryKeys,
	useApplications,
	useContracts,
	useJobs,
} from "@/lib/queries";
import { useUser } from "@/lib/user-context";

export default function DashboardPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { isClient, isFreelancer, userId } = useUser();
	const { data: jobs = [] } = useJobs();
	const { data: allApplications = [] } = useApplications(
		isFreelancer ? { freelancerId: userId || undefined } : undefined,
	);
	const { data: contractsData = [] } = useContracts(
		isClient
			? { clientId: userId || undefined }
			: { freelancerId: userId || undefined },
	);

	const contracts = [...contractsData].sort((a, b) => {
		const aWaitingForUser = isClient
			? a.status === "pending-signatures" && !a.clientSigned
			: a.status === "pending-signatures" && !a.freelancerSigned;
		const bWaitingForUser = isClient
			? b.status === "pending-signatures" && !b.clientSigned
			: b.status === "pending-signatures" && !b.freelancerSigned;

		if (aWaitingForUser && !bWaitingForUser) return -1;
		if (!aWaitingForUser && bWaitingForUser) return 1;

		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	// Filter applications based on user role
	const applications = isClient
		? allApplications.filter((app) => jobs.some((job) => job.id === app.jobId))
		: allApplications;

	// Calculate stats from real data
	const activeContracts = contracts.filter(
		(c) => c.status === "active" || c.status === "pending-signatures",
	).length;
	const totalSpent = contracts.reduce((sum, contract) => {
		return (
			sum +
			contract.milestones.reduce(
				(milestoneSum, m) => milestoneSum + m.amount,
				0,
			)
		);
	}, 0);
	const totalEarned = contracts
		.filter((c) => c.status === "completed")
		.reduce((sum, contract) => {
			return (
				sum +
				contract.milestones
					.filter((m) => m.status === "paid")
					.reduce((milestoneSum, m) => milestoneSum + m.amount, 0)
			);
		}, 0);

	const handleAcceptApplication = async (applicationId: string) => {
		router.push(`/contract/new?applicationId=${applicationId}`);
	};

	const handleRejectApplication = async (applicationId: string) => {
		if (!confirm("Are you sure you want to reject this application?")) {
			return;
		}

		try {
			const response = await fetch(`/api/applications/${applicationId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					status: "rejected",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to reject application");
			}

			// Invalidate queries to refresh data
			await queryClient.invalidateQueries({
				queryKey: queryKeys.applications(),
			});
			await queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
		} catch {
			alert("Failed to reject application. Please try again.");
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<Navigation />

			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">				<div className="mb-8">
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="mt-2 text-muted-foreground">
						{isClient
							? "Manage your jobs and applications"
							: "Track your applications and contracts"}
					</p>
				</div>				<div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{isClient ? (
						<>
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Active Jobs
									</CardTitle>
									<Briefcase className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{jobs.filter((j) => j.status === "open").length}
									</div>
									<p className="text-xs text-muted-foreground">
										Currently hiring
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Total Applications
									</CardTitle>
									<Users className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{applications.length}
									</div>
									<p className="text-xs text-muted-foreground">
										Pending review
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Active Contracts
									</CardTitle>
									<FileText className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{activeContracts}</div>
									<p className="text-xs text-muted-foreground">In progress</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Total Spent
									</CardTitle>
									<DollarSign className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										${totalSpent.toLocaleString()}
									</div>
									<p className="text-xs text-muted-foreground">All time</p>
								</CardContent>
							</Card>
						</>
					) : (
						<>
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Active Applications
									</CardTitle>
									<Briefcase className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{applications.filter((a) => a.status === "pending").length}
									</div>
									<p className="text-xs text-muted-foreground">
										Awaiting response
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Active Contracts
									</CardTitle>
									<FileText className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{activeContracts}</div>
									<p className="text-xs text-muted-foreground">In progress</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Total Earned
									</CardTitle>
									<DollarSign className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										${totalEarned.toLocaleString()}
									</div>
									<p className="text-xs text-muted-foreground">All time</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										Total Applications
									</CardTitle>
									<Star className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{applications.length}
									</div>
									<p className="text-xs text-muted-foreground">Submitted</p>
								</CardContent>
							</Card>
						</>
					)}
				</div>				<Tabs
					defaultValue={isClient ? "jobs" : "applications"}
					className="space-y-6"
				>
					<TabsList>
						{isClient ? (
							<>
								<TabsTrigger value="jobs">My Jobs</TabsTrigger>
								<TabsTrigger value="applications">Applications</TabsTrigger>
								<TabsTrigger value="contracts">Contracts</TabsTrigger>
							</>
						) : (
							<>
								<TabsTrigger value="applications">My Applications</TabsTrigger>
								<TabsTrigger value="contracts">Contracts</TabsTrigger>
							</>
						)}
					</TabsList>

					{isClient && (
						<>							<TabsContent value="jobs" className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-semibold">Your Posted Jobs</h2>
									<Button asChild>
										<Link href="/post-job">Post New Job</Link>
									</Button>
								</div>

								<div className="space-y-4">
									{jobs.map((job) => (
										<Card key={job.id}>
											<CardHeader>
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1">
														<div className="flex items-center gap-3">
															<CardTitle className="text-lg">
																{job.title}
															</CardTitle>
															<Badge
																variant={
																	job.status === "open"
																		? "default"
																		: "secondary"
																}
															>
																{job.status}
															</Badge>
														</div>
														<CardDescription className="mt-2">
															Posted{" "}
															{new Date(job.postedAt).toLocaleDateString()}
														</CardDescription>
													</div>
													<Button variant="outline" size="sm" asChild>
														<Link href={`/jobs/${job.id}`}>View Job</Link>
													</Button>
												</div>
											</CardHeader>
											<CardContent>
												<div className="grid gap-4 sm:grid-cols-3">
													<div className="flex items-center gap-2 text-sm">
														<Users className="h-4 w-4 text-muted-foreground" />
														<span className="font-medium">
															{job.applicants}
														</span>
														<span className="text-muted-foreground">
															applicants
														</span>
													</div>
													<div className="flex items-center gap-2 text-sm">
														<DollarSign className="h-4 w-4 text-muted-foreground" />
														<span className="font-medium">
															${job.budget.min.toLocaleString()}-$
															{job.budget.max.toLocaleString()}
														</span>
													</div>
													<div className="flex items-center gap-2 text-sm">
														<Clock className="h-4 w-4 text-muted-foreground" />
														<span className="text-muted-foreground">
															{job.duration}
														</span>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</TabsContent>							<TabsContent value="applications" className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-semibold">
										Received Applications
									</h2>
									<p className="text-sm text-muted-foreground">
										{applications.length} pending review
									</p>
								</div>

								<div className="space-y-4">
									{applications.map((application) => {
										const job = jobs.find((j) => j.id === application.jobId);
										return (
											<Card key={application.id}>
												<CardHeader>
													<div className="flex items-start gap-4">
														<Avatar className="h-12 w-12">
															<AvatarImage
																src={
																	application.freelancer.avatar ||
																	"/placeholder.svg"
																}
																alt={application.freelancer.name}
															/>
															<AvatarFallback>
																{application.freelancer.name[0]}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<div className="flex items-start justify-between gap-4">
																<div>
																	<CardTitle className="text-lg">
																		{application.freelancer.name}
																	</CardTitle>
																	<CardDescription>
																		{application.freelancer.title}
																	</CardDescription>
																</div>
																<Badge variant="secondary">
																	{application.status}
																</Badge>
															</div>
															<div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
																<div className="flex items-center gap-1">
																	<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
																	<span className="font-medium text-foreground">
																		{application.freelancer.rating}
																	</span>
																</div>
																<span>
																	{application.freelancer.completedJobs} jobs
																	completed
																</span>
																<span>
																	${application.freelancer.hourlyRate}/hr
																</span>
															</div>
														</div>
													</div>
												</CardHeader>
												<CardContent className="space-y-4">
													<div>
														<p className="mb-1 text-sm font-medium">
															Applied for:
														</p>
														<Link
															href={`/jobs/${job?.id}`}
															className="text-sm text-primary hover:underline"
														>
															{job?.title}
														</Link>
													</div>

													<div>
														<p className="mb-2 text-sm font-medium">
															Cover Letter:
														</p>
														<p className="text-pretty text-sm leading-relaxed text-muted-foreground">
															{application.coverLetter}
														</p>
													</div>

													<div className="grid gap-4 rounded-lg border border-border bg-muted/50 p-4 sm:grid-cols-2">
														<div>
															<p className="text-xs text-muted-foreground">
																Proposed Budget
															</p>
															<p className="mt-1 font-semibold">
																${application.proposedBudget.toLocaleString()}
															</p>
														</div>
														<div>
															<p className="text-xs text-muted-foreground">
																Estimated Duration
															</p>
															<p className="mt-1 font-semibold">
																{application.proposedDuration}
															</p>
														</div>
													</div>

													{application.status === "pending" && (
														<div className="flex items-center gap-3 border-t border-border pt-4">
															<Button
																className="flex-1"
																onClick={() =>
																	handleAcceptApplication(application.id)
																}
															>
																<CheckCircle2 className="mr-2 h-4 w-4" />
																Accept & Create Contract
															</Button>
															<Button
																variant="outline"
																className="flex-1 bg-transparent"
																onClick={() =>
																	handleRejectApplication(application.id)
																}
															>
																<XCircle className="mr-2 h-4 w-4" />
																Decline
															</Button>
														</div>
													)}
												</CardContent>
											</Card>
										);
									})}
								</div>
							</TabsContent>							<TabsContent value="contracts" className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-semibold">Your Contracts</h2>
								</div>

								{contracts.length > 0 ? (
									<div className="space-y-4">
										{contracts.map((contract) => {
											const job = jobs.find((j) => j.id === contract.jobId);
											const totalValue = contract.milestones.reduce(
												(sum, m) => sum + m.amount,
												0,
											);

											return (
												<Card key={contract.id}>
													<CardHeader>
														<div className="flex items-start justify-between gap-4">
															<div className="flex-1">
																<div className="flex items-center gap-3">
																	<CardTitle className="text-lg">
																		{job?.title || "Contract"}
																	</CardTitle>
																	<Badge
																		variant={
																			contract.status === "active"
																				? "default"
																				: contract.status === "completed"
																					? "secondary"
																					: "outline"
																		}
																	>
																		{contract.status}
																	</Badge>
																</div>
																<CardDescription className="mt-2">
																	Created{" "}
																	{new Date(
																		contract.createdAt,
																	).toLocaleDateString()}
																</CardDescription>
															</div>
															{contract.status === "pending-signatures" && (
																<Button variant="default" size="sm" asChild>
																	<Link href={`/contract/sign/${contract.id}`}>
																		<PenTool className="mr-2 h-4 w-4" />
																		Sign Contract
																	</Link>
																</Button>
															)}
														</div>
													</CardHeader>
													<CardContent className="space-y-4">														<div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
															<div className="flex flex-1 items-center gap-2">
																{contract.clientSigned ? (
																	<CheckCircle2 className="h-5 w-5 text-green-600" />
																) : (
																	<Clock className="h-5 w-5 text-muted-foreground" />
																)}
																<span className="text-sm">
																	Client{" "}
																	{contract.clientSigned ? "Signed" : "Pending"}
																</span>
															</div>
															<div className="flex flex-1 items-center gap-2">
																{contract.freelancerSigned ? (
																	<CheckCircle2 className="h-5 w-5 text-green-600" />
																) : (
																	<Clock className="h-5 w-5 text-muted-foreground" />
																)}
																<span className="text-sm">
																	Freelancer{" "}
																	{contract.freelancerSigned
																		? "Signed"
																		: "Pending"}
																</span>
															</div>
														</div>														<div className="grid gap-4 sm:grid-cols-2">
															<div>
																<p className="text-xs text-muted-foreground">
																	Total Value
																</p>
																<p className="mt-1 font-semibold">
																	${totalValue.toLocaleString()}
																</p>
															</div>
															<div>
																<p className="text-xs text-muted-foreground">
																	Milestones
																</p>
																<p className="mt-1 font-semibold">
																	{contract.milestones.length}
																</p>
															</div>
														</div>
													</CardContent>
												</Card>
											);
										})}
									</div>
								) : (
									<Card>
										<CardContent className="flex flex-col items-center justify-center py-12">
											<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
											<h3 className="mb-2 text-lg font-semibold">
												No active contracts yet
											</h3>
											<p className="mb-4 text-center text-sm text-muted-foreground">
												Accept an application to create your first contract
											</p>
											<Button asChild>
												<Link href="/dashboard?tab=applications">
													Review Applications
												</Link>
											</Button>
										</CardContent>
									</Card>
								)}
							</TabsContent>
						</>
					)}

					{isFreelancer && (
						<>							<TabsContent value="applications" className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-semibold">Your Applications</h2>
									<Button asChild>
										<Link href="/">Browse More Jobs</Link>
									</Button>
								</div>

								{applications.length > 0 ? (
									<div className="space-y-4">
										{applications.map((application) => {
											const job = jobs.find((j) => j.id === application.jobId);
											return (
												<Card key={application.id}>
													<CardHeader>
														<div className="flex items-start justify-between gap-4">
															<div className="flex-1">
																<div className="flex items-center gap-3">
																	<CardTitle className="text-lg">
																		{job?.title || "Job Details Unavailable"}
																	</CardTitle>
																	<Badge
																		variant={
																			application.status === "accepted"
																				? "default"
																				: application.status === "rejected"
																					? "destructive"
																					: "secondary"
																		}
																	>
																		{application.status}
																	</Badge>
																</div>
																<CardDescription className="mt-2">
																	Applied on{" "}
																	{new Date(
																		application.appliedAt,
																	).toLocaleDateString()}
																</CardDescription>
															</div>
															{job && (
																<Button variant="outline" size="sm" asChild>
																	<Link href={`/jobs/${job.id}`}>View Job</Link>
																</Button>
															)}
														</div>
													</CardHeader>
													<CardContent className="space-y-4">
														<div>
															<p className="mb-2 text-sm font-medium">
																Your Cover Letter:
															</p>
															<p className="text-pretty text-sm leading-relaxed text-muted-foreground">
																{application.coverLetter}
															</p>
														</div>

														<div className="grid gap-4 rounded-lg border border-border bg-muted/50 p-4 sm:grid-cols-2">
															<div>
																<p className="text-xs text-muted-foreground">
																	Your Proposed Budget
																</p>
																<p className="mt-1 font-semibold">
																	${application.proposedBudget.toLocaleString()}
																</p>
															</div>
															<div>
																<p className="text-xs text-muted-foreground">
																	Your Estimated Duration
																</p>
																<p className="mt-1 font-semibold">
																	{application.proposedDuration}
																</p>
															</div>
														</div>
													</CardContent>
												</Card>
											);
										})}
									</div>
								) : (
									<Card>
										<CardContent className="flex flex-col items-center justify-center py-12">
											<Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
											<h3 className="mb-2 text-lg font-semibold">
												No applications yet
											</h3>
											<p className="mb-4 text-center text-sm text-muted-foreground">
												Start applying to jobs to see your applications here
											</p>
											<Button asChild>
												<Link href="/">Browse Jobs</Link>
											</Button>
										</CardContent>
									</Card>
								)}
							</TabsContent>							<TabsContent value="contracts" className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-semibold">Your Contracts</h2>
								</div>

								{contracts.length > 0 ? (
									<div className="space-y-4">
										{contracts.map((contract) => {
											const job = jobs.find((j) => j.id === contract.jobId);
											const totalValue = contract.milestones.reduce(
												(sum, m) => sum + m.amount,
												0,
											);

											return (
												<Card key={contract.id}>
													<CardHeader>
														<div className="flex items-start justify-between gap-4">
															<div className="flex-1">
																<div className="flex items-center gap-3">
																	<CardTitle className="text-lg">
																		{job?.title || "Contract"}
																	</CardTitle>
																	<Badge
																		variant={
																			contract.status === "active"
																				? "default"
																				: contract.status === "completed"
																					? "secondary"
																					: "outline"
																		}
																	>
																		{contract.status}
																	</Badge>
																</div>
																<CardDescription className="mt-2">
																	Created{" "}
																	{new Date(
																		contract.createdAt,
																	).toLocaleDateString()}
																</CardDescription>
															</div>
															{contract.status === "pending-signatures" && (
																<Button variant="default" size="sm" asChild>
																	<Link href={`/contract/sign/${contract.id}`}>
																		<PenTool className="mr-2 h-4 w-4" />
																		Sign Contract
																	</Link>
																</Button>
															)}
														</div>
													</CardHeader>
													<CardContent className="space-y-4">														<div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
															<div className="flex flex-1 items-center gap-2">
																{contract.clientSigned ? (
																	<CheckCircle2 className="h-5 w-5 text-green-600" />
																) : (
																	<Clock className="h-5 w-5 text-muted-foreground" />
																)}
																<span className="text-sm">
																	Client{" "}
																	{contract.clientSigned ? "Signed" : "Pending"}
																</span>
															</div>
															<div className="flex flex-1 items-center gap-2">
																{contract.freelancerSigned ? (
																	<CheckCircle2 className="h-5 w-5 text-green-600" />
																) : (
																	<Clock className="h-5 w-5 text-muted-foreground" />
																)}
																<span className="text-sm">
																	Freelancer{" "}
																	{contract.freelancerSigned
																		? "Signed"
																		: "Pending"}
																</span>
															</div>
														</div>														<div className="grid gap-4 sm:grid-cols-2">
															<div>
																<p className="text-xs text-muted-foreground">
																	Total Value
																</p>
																<p className="mt-1 font-semibold">
																	${totalValue.toLocaleString()}
																</p>
															</div>
															<div>
																<p className="text-xs text-muted-foreground">
																	Milestones
																</p>
																<p className="mt-1 font-semibold">
																	{contract.milestones.length}
																</p>
															</div>
														</div>
													</CardContent>
												</Card>
											);
										})}
									</div>
								) : (
									<Card>
										<CardContent className="flex flex-col items-center justify-center py-12">
											<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
											<h3 className="mb-2 text-lg font-semibold">
												No active contracts yet
											</h3>
											<p className="mb-4 text-center text-sm text-muted-foreground">
												Your accepted applications will appear here as contracts
											</p>
										</CardContent>
									</Card>
								)}
							</TabsContent>
						</>
					)}
				</Tabs>
			</div>
		</div>
	);
}
