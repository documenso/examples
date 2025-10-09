"use client";

import { EmbedSignDocument } from "@documenso/embed-react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Dumbbell,
  ExternalLink,
  FileText,
  Key,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	dateOfBirth: string;
	membershipType: string;
	emergencyContact: string;
	emergencyPhone: string;
	medicalConditions: string;
	marketingConsent: boolean;
}

interface MemberData {
	memberId: string;
	accessCode: string;
	membershipStartDate: string;
	nextBillingDate: string;
}

export default function GymSignupPage() {
	const [currentStep, setCurrentStep] = useState(1);
	const [signingToken, setSigningToken] = useState<string | null>(null);
	const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
	const [isProvisioning, setIsProvisioning] = useState(false);
	const [provisioningStep, setProvisioningStep] = useState(0);
	const [memberData, setMemberData] = useState<MemberData | null>(null);
	const [provisioningProgress, setProvisioningProgress] = useState(0);
	const [showCompletionDashboard, setShowCompletionDashboard] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		dateOfBirth: "",
		membershipType: "",
		emergencyContact: "",
		emergencyPhone: "",
		medicalConditions: "",
		marketingConsent: false,
	});

	useEffect(() => {
		if (isProvisioning) {
			const steps = [
				"Processing signed documents...",
				"Creating member account...",
				"Setting up gym access...",
				"Generating member ID...",
				"Configuring billing...",
				"Sending welcome email...",
			];

			const interval = setInterval(() => {
				setProvisioningStep((prev) => {
					if (prev < steps.length - 1) {
						setProvisioningProgress((prev + 1) * (100 / steps.length));
						return prev + 1;
					} else {
						clearInterval(interval);
						setTimeout(() => {
							const memberId = `FZ${Math.random()
								.toString(36)
								.substr(2, 6)
								.toUpperCase()}`;
							const accessCode = Math.random()
								.toString(36)
								.substr(2, 8)
								.toUpperCase();
							const startDate = new Date().toLocaleDateString();
							const nextBilling = new Date(
								Date.now() + 30 * 24 * 60 * 60 * 1000,
							).toLocaleDateString();

							setMemberData({
								memberId,
								accessCode,
								membershipStartDate: startDate,
								nextBillingDate: nextBilling,
							});
							setIsProvisioning(false);
							setProvisioningProgress(100);
						}, 1000);
						return prev;
					}
				});
			}, 1500);

			return () => clearInterval(interval);
		}
	}, [isProvisioning]);

	const handleInputChange = (
		field: keyof FormData,
		value: string | boolean,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleNext = () => {
		if (currentStep < 3) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const isStepValid = () => {
		switch (currentStep) {
			case 1:
				return (
					formData.firstName &&
					formData.lastName &&
					formData.email &&
					formData.phone &&
					formData.dateOfBirth
				);
			case 2:
				return (
					formData.membershipType &&
					formData.emergencyContact &&
					formData.emergencyPhone
				);
			default:
				return true;
		}
	};

	const generateDocument = async () => {
		setIsGeneratingDocument(true);
		try {
			const response = await fetch("/api/generate-document", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: `${formData.firstName} ${formData.lastName}`,
					email: formData.email,
					externalId: `member-${Date.now()}`,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate document");
			}

			const data = await response.json();
			setSigningToken(data.signingToken);
		} catch (error) {
			console.error("Error generating document:", error);
			alert("Failed to generate document. Please try again.");
		} finally {
			setIsGeneratingDocument(false);
		}
	};

	const startMemberProvisioning = () => {
		setIsProvisioning(true);
		setProvisioningStep(0);
		setProvisioningProgress(0);
	};

	const provisioningSteps = [
		"Processing signed documents...",
		"Creating member account...",
		"Setting up gym access...",
		"Generating member ID...",
		"Configuring billing...",
		"Sending welcome email...",
	];

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b border-border bg-card">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
							<Dumbbell className="w-6 h-6 text-primary-foreground" />
						</div>
						<div>
							<h1 className="text-2xl font-heading font-black text-card-foreground">
								FitZone Gym
							</h1>
							<p className="text-sm text-muted-foreground">
								Your fitness journey starts here
							</p>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-2xl">
				{(isProvisioning || memberData) && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<div className="bg-background rounded-lg shadow-xl max-w-md w-full overflow-hidden">
							{isProvisioning ? (
								<div className="p-6">
									<div className="text-center mb-6">
										<div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
											<Loader2 className="w-8 h-8 text-primary animate-spin" />
										</div>
										<h2 className="text-xl font-heading font-bold text-card-foreground mb-2">
											Setting Up Your Membership
										</h2>
										<p className="text-sm text-muted-foreground">
											Please wait while we process your information and create
											your account.
										</p>
									</div>

									<div className="space-y-4">
										<div className="space-y-2">
											<div className="flex items-center justify-between text-sm">
												<span className="text-card-foreground">
													{provisioningSteps[provisioningStep]}
												</span>
												<span className="text-muted-foreground">
													{Math.round(provisioningProgress)}%
												</span>
											</div>
											<Progress value={provisioningProgress} className="h-2" />
										</div>

										<div className="space-y-2">
											{provisioningSteps.map((step, index) => (
												<div
													key={index}
													className="flex items-center gap-2 text-sm"
												>
													{index < provisioningStep ? (
														<CheckCircle className="w-4 h-4 text-green-600" />
													) : index === provisioningStep ? (
														<Loader2 className="w-4 h-4 text-primary animate-spin" />
													) : (
														<div className="w-4 h-4 border border-muted-foreground rounded-full" />
													)}
													<span
														className={
															index <= provisioningStep
																? "text-card-foreground"
																: "text-muted-foreground"
														}
													>
														{step}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							) : (
								<div className="p-6">
									<div className="text-center mb-6">
										<div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
											<CheckCircle className="w-8 h-8 text-green-600" />
										</div>
										<h2 className="text-xl font-heading font-bold text-card-foreground mb-2">
											Welcome to FitZone Gym!
										</h2>
										<p className="text-sm text-muted-foreground">
											Your membership has been successfully activated.
										</p>
									</div>

									<div className="space-y-4">
										<Card>
											<CardContent className="p-4">
												<div className="space-y-3">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<User className="w-4 h-4 text-primary" />
															<span className="text-sm font-medium">
																Member ID
															</span>
														</div>
														<Badge variant="secondary" className="font-mono">
															{memberData?.memberId}
														</Badge>
													</div>

													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<Key className="w-4 h-4 text-primary" />
															<span className="text-sm font-medium">
																Access Code
															</span>
														</div>
														<Badge variant="outline" className="font-mono">
															{memberData?.accessCode}
														</Badge>
													</div>

													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<Calendar className="w-4 h-4 text-primary" />
															<span className="text-sm font-medium">
																Start Date
															</span>
														</div>
														<span className="text-sm text-muted-foreground">
															{memberData?.membershipStartDate}
														</span>
													</div>

													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<CreditCard className="w-4 h-4 text-primary" />
															<span className="text-sm font-medium">
																Next Billing
															</span>
														</div>
														<span className="text-sm text-muted-foreground">
															{memberData?.nextBillingDate}
														</span>
													</div>
												</div>
											</CardContent>
										</Card>

										<div className="bg-muted p-4 rounded-lg">
											<div className="flex items-start gap-3">
												<Mail className="w-5 h-5 text-primary mt-0.5" />
												<div>
													<p className="text-sm font-medium text-card-foreground mb-1">
														Check Your Email
													</p>
													<p className="text-xs text-muted-foreground">
														We&apos;ve sent your membership details and gym
														access instructions to {formData.email}
													</p>
												</div>
											</div>
										</div>

										<div className="flex gap-2">
											<Button
												className="flex-1 bg-primary hover:bg-primary/90"
												onClick={() => {
													setShowCompletionDashboard(true);
													setMemberData(null);
												}}
											>
												Access Member Portal
											</Button>
											<Button
												variant="outline"
												onClick={() => setMemberData(null)}
												className="bg-transparent"
											>
												Close
											</Button>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{showCompletionDashboard && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
							<div className="p-6">
								<div className="text-center mb-8">
									<div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
										<CheckCircle className="w-10 h-10 text-green-600" />
									</div>
									<h1 className="text-3xl font-heading font-black text-card-foreground mb-3">
										Membership Complete!
									</h1>
									<p className="text-lg text-muted-foreground mb-2">
										Welcome to FitZone Gym, {formData.firstName}!
									</p>
									<p className="text-sm text-muted-foreground">
										Your embedded signing experience is complete. You can now
										return to the main application.
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-lg flex items-center gap-2">
												<User className="w-5 h-5 text-primary" />
												Your Membership
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground">
													Plan
												</span>
												<Badge variant="secondary" className="capitalize">
													{formData.membershipType}
												</Badge>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground">
													Status
												</span>
												<Badge className="bg-green-100 text-green-800 border-green-200">
													Active
												</Badge>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground">
													Documents
												</span>
												<span className="text-sm font-medium text-card-foreground">
													1 Signed
												</span>
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-lg flex items-center gap-2">
												<Clock className="w-5 h-5 text-primary" />
												Next Steps
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex items-start gap-3">
												<CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
												<div>
													<p className="text-sm font-medium text-card-foreground">
														Check your email
													</p>
													<p className="text-xs text-muted-foreground">
														Membership details sent
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												<CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
												<div>
													<p className="text-sm font-medium text-card-foreground">
														Access code generated
													</p>
													<p className="text-xs text-muted-foreground">
														Use at gym entrance
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												<div className="w-4 h-4 border-2 border-primary rounded-full mt-0.5" />
												<div>
													<p className="text-sm font-medium text-card-foreground">
														Visit the gym
													</p>
													<p className="text-xs text-muted-foreground">
														Start your fitness journey
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								<div className="bg-muted p-6 rounded-lg mb-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<h3 className="font-heading font-bold text-card-foreground mb-3">
												Gym Information
											</h3>
											<div className="space-y-2">
												<div className="flex items-center gap-2 text-sm">
													<MapPin className="w-4 h-4 text-primary" />
													<span>123 Fitness Ave, Gym City, GC 12345</span>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<Phone className="w-4 h-4 text-primary" />
													<span>(555) 123-4567</span>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<Clock className="w-4 h-4 text-primary" />
													<span>Mon-Fri: 5AM-11PM, Sat-Sun: 6AM-10PM</span>
												</div>
											</div>
										</div>

										<div>
											<h3 className="font-heading font-bold text-card-foreground mb-3">
												What&apos;s Included
											</h3>
											<div className="space-y-1">
												<div className="flex items-center gap-2 text-sm">
													<CheckCircle className="w-4 h-4 text-green-600" />
													<span>Full gym access</span>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<CheckCircle className="w-4 h-4 text-green-600" />
													<span>Group fitness classes</span>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<CheckCircle className="w-4 h-4 text-green-600" />
													<span>Locker room access</span>
												</div>
												{formData.membershipType !== "basic" && (
													<div className="flex items-center gap-2 text-sm">
														<CheckCircle className="w-4 h-4 text-green-600" />
														<span>Personal training sessions</span>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-3">
									<Button
										className="flex-1 bg-primary hover:bg-primary/90"
										onClick={() => {
											window.parent.postMessage(
												{ type: "SIGNUP_COMPLETE", memberData: formData },
												"*",
											);
											alert("Returning to main application...");
										}}
									>
										<ExternalLink className="w-4 h-4 mr-2" />
										Return to App
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											window.open("/member-portal", "_blank");
											alert("Opening member portal...");
										}}
										className="bg-transparent"
									>
										Open Member Portal
									</Button>
									<Button
										variant="ghost"
										onClick={() => setShowCompletionDashboard(false)}
										className="bg-transparent"
									>
										<ArrowLeft className="w-4 h-4 mr-2" />
										Back
									</Button>
								</div>

								<div className="mt-6 pt-6 border-t border-border text-center">
									<p className="text-xs text-muted-foreground">
										This demo shows how embedded document signing integrates
										seamlessly with member onboarding.
										<br />
										In a real application, users would be automatically
										redirected back to the parent app.
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{signingToken && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<div className="bg-background rounded-lg shadow-xl max-w-5xl w-full overflow-hidden">
							<EmbedSignDocument
								token={signingToken}
								className="w-full h-220"
								host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST}
								name={`${formData.firstName} ${formData.lastName}`}
								lockName={true}
								onDocumentReady={() => {
									console.log("Document ready for signing");
								}}
								onDocumentCompleted={() => {
									console.log("Document signed successfully");
									setSigningToken(null);
									startMemberProvisioning();
								}}
								onDocumentError={(error) => {
									console.error("Document signing error:", error);
									alert("An error occurred while signing. Please try again.");
									setSigningToken(null);
								}}
							/>
						</div>
					</div>
				)}

				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						{[1, 2, 3].map((step) => (
							<div key={step} className="flex items-center">
								<div
									className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
										step <= currentStep
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground"
									}`}
								>
									{step < currentStep ? (
										<CheckCircle className="w-4 h-4" />
									) : (
										step
									)}
								</div>
								{step < 3 && (
									<div
										className={`w-16 h-1 mx-2 ${
											step < currentStep ? "bg-primary" : "bg-muted"
										}`}
									/>
								)}
							</div>
						))}
					</div>
					<div className="flex justify-between text-sm text-muted-foreground">
						<span>Personal Info</span>
						<span>Membership</span>
						<span>Review & Sign</span>
					</div>
				</div>

				{currentStep === 1 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-card-foreground">
								Personal Information
							</CardTitle>
							<CardDescription>
								Let&apos;s get to know you better
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										value={formData.firstName}
										onChange={(e) =>
											handleInputChange("firstName", e.target.value)
										}
										placeholder="Enter your first name"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										value={formData.lastName}
										onChange={(e) =>
											handleInputChange("lastName", e.target.value)
										}
										placeholder="Enter your last name"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange("email", e.target.value)}
									placeholder="Enter your email address"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										id="phone"
										type="tel"
										value={formData.phone}
										onChange={(e) => handleInputChange("phone", e.target.value)}
										placeholder="(555) 123-4567"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="dateOfBirth">Date of Birth</Label>
									<Input
										id="dateOfBirth"
										type="date"
										value={formData.dateOfBirth}
										onChange={(e) =>
											handleInputChange("dateOfBirth", e.target.value)
										}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{currentStep === 2 && (
					<Card>
						<CardHeader>
							<CardTitle className="text-card-foreground">
								Membership & Emergency Contact
							</CardTitle>
							<CardDescription>
								Choose your plan and provide emergency information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="membershipType">Membership Type</Label>
								<Select
									value={formData.membershipType}
									onValueChange={(value) =>
										handleInputChange("membershipType", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a membership plan" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="basic">Basic - $29/month</SelectItem>
										<SelectItem value="premium">Premium - $49/month</SelectItem>
										<SelectItem value="elite">Elite - $79/month</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="emergencyContact">
										Emergency Contact Name
									</Label>
									<Input
										id="emergencyContact"
										value={formData.emergencyContact}
										onChange={(e) =>
											handleInputChange("emergencyContact", e.target.value)
										}
										placeholder="Full name"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="emergencyPhone">
										Emergency Contact Phone
									</Label>
									<Input
										id="emergencyPhone"
										type="tel"
										value={formData.emergencyPhone}
										onChange={(e) =>
											handleInputChange("emergencyPhone", e.target.value)
										}
										placeholder="(555) 123-4567"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="medicalConditions">
									Medical Conditions (Optional)
								</Label>
								<Input
									id="medicalConditions"
									value={formData.medicalConditions}
									onChange={(e) =>
										handleInputChange("medicalConditions", e.target.value)
									}
									placeholder="Any medical conditions we should be aware of"
								/>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="marketingConsent"
									checked={formData.marketingConsent}
									onCheckedChange={(checked) =>
										handleInputChange("marketingConsent", checked as boolean)
									}
								/>
								<Label htmlFor="marketingConsent" className="text-sm">
									I agree to receive marketing communications from FitZone Gym
								</Label>
							</div>
						</CardContent>
					</Card>
				)}

				{currentStep === 3 && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-card-foreground">
									Review Your Information
								</CardTitle>
								<CardDescription>
									Please review your details before signing the membership
									documents
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="font-medium text-card-foreground">
											Name:
										</span>
										<p>
											{formData.firstName} {formData.lastName}
										</p>
									</div>
									<div>
										<span className="font-medium text-card-foreground">
											Email:
										</span>
										<p>{formData.email}</p>
									</div>
									<div>
										<span className="font-medium text-card-foreground">
											Phone:
										</span>
										<p>{formData.phone}</p>
									</div>
									<div>
										<span className="font-medium text-card-foreground">
											Membership:
										</span>
										<Badge variant="secondary" className="capitalize">
											{formData.membershipType}
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-accent/20">
							<CardHeader>
								<div className="flex items-center gap-2">
									<FileText className="w-5 h-5 text-accent" />
									<CardTitle className="text-card-foreground">
										Membership Agreement & Liability Waiver
									</CardTitle>
								</div>
								<CardDescription>
									Review and sign the membership agreement and liability waiver
									to complete your signup
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="p-4 bg-muted rounded-lg">
									<div className="flex items-start gap-3">
										<FileText className="w-5 h-5 text-primary mt-0.5" />
										<div className="flex-1">
											<p className="font-medium text-card-foreground mb-1">
												Ready to Sign?
											</p>
											<p className="text-sm text-muted-foreground mb-4">
												Click the button below to review and electronically sign
												your membership documents using Documenso&apos;s secure
												signing platform.
											</p>
											<Button
												className="bg-primary hover:bg-primary/90"
												onClick={generateDocument}
												disabled={isGeneratingDocument || !!signingToken}
											>
												{isGeneratingDocument ? (
													<>
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														Preparing Document...
													</>
												) : (
													"Sign Membership Documents"
												)}
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				<div className="flex justify-between mt-8">
					<Button
						variant="outline"
						onClick={handleBack}
						disabled={currentStep === 1}
					>
						Back
					</Button>

					{currentStep < 3 && (
						<Button
							onClick={handleNext}
							disabled={!isStepValid()}
							className="bg-primary hover:bg-primary/90"
						>
							Continue
						</Button>
					)}
				</div>
			</main>
		</div>
	);
}
