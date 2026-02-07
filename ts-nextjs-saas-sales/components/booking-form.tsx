"use client";

import { ArrowRight, Check, FileText } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DemoData } from "./demo-scheduler";

type BookingFormProps = {
	onComplete: (data: DemoData) => void;
};

export function BookingForm({ onComplete }: BookingFormProps) {
	const [formData, setFormData] = useState<DemoData>({
		name: "",
		email: "",
		company: "",
		role: "",
		phone: "",
	});
	const [openModal, setOpenModal] = useState<
		"enterprise" | "pricing" | "faq" | null
	>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onComplete(formData);
	};

	const isValid =
		formData.name && formData.email && formData.company && formData.role;

	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b border-border">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<button
						onClick={() => window.location.reload()}
						className="flex items-center gap-2 hover:opacity-80 transition-opacity"
					>
						<FileText className="h-6 w-6 text-accent" />
						<span className="text-xl font-semibold">Documenso Pro</span>
					</button>
					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<button
							onClick={() => setOpenModal("enterprise")}
							className="hover:text-foreground transition-colors"
						>
							Enterprise
						</button>
						<button
							onClick={() => setOpenModal("pricing")}
							className="hover:text-foreground transition-colors"
						>
							Pricing
						</button>
						<button
							onClick={() => setOpenModal("faq")}
							className="hover:text-foreground transition-colors"
						>
							FAQ
						</button>
					</div>
				</div>
			</header>

			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-2xl">
					<div className="text-center mb-12">
						<div className="inline-block mb-4">
							<span className="text-accent text-sm font-medium px-3 py-1 rounded-full bg-accent/10">
								Enterprise Demo
							</span>
						</div>
						<h1 className="text-5xl font-bold mb-6 text-balance leading-tight">
							Experience embedded document signing
						</h1>
						<p className="text-xl text-muted-foreground text-balance leading-relaxed max-w-xl mx-auto">
							See how enterprise teams integrate seamless NDA signing directly
							into their sales workflows.
						</p>
					</div>

					<Card className="p-8 bg-card border-border">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="name" className="text-foreground">
										Full Name *
									</Label>
									<Input
										id="name"
										type="text"
										placeholder="John Smith"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										required
										className="bg-background border-input text-foreground"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email" className="text-foreground">
										Work Email *
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="john@company.com"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										required
										className="bg-background border-input text-foreground"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="company" className="text-foreground">
										Company *
									</Label>
									<Input
										id="company"
										type="text"
										placeholder="Acme Corp"
										value={formData.company}
										onChange={(e) =>
											setFormData({ ...formData, company: e.target.value })
										}
										required
										className="bg-background border-input text-foreground"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="role" className="text-foreground">
										Role *
									</Label>
									<Input
										id="role"
										type="text"
										placeholder="VP of Sales"
										value={formData.role}
										onChange={(e) =>
											setFormData({ ...formData, role: e.target.value })
										}
										required
										className="bg-background border-input text-foreground"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone" className="text-foreground">
									Phone Number (Optional)
								</Label>
								<Input
									id="phone"
									type="tel"
									placeholder="+1 (555) 000-0000"
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									className="bg-background border-input text-foreground"
								/>
							</div>

							<div className="pt-4">
								<Button
									type="submit"
									disabled={!isValid}
									className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
								>
									Continue to NDA Signing
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</div>

							<p className="text-sm text-muted-foreground text-center">
								By continuing, you agree to sign our NDA to access sensitive
								product features
							</p>
						</form>
					</Card>

					<div className="mt-12 text-center">
						<p className="text-sm text-muted-foreground mb-4">
							Trusted by enterprise teams at
						</p>
						<div className="flex items-center justify-center gap-8 text-muted-foreground/60">
							<span className="text-lg font-semibold">NETFLIX</span>
							<span className="text-lg font-semibold">Tripadvisor</span>
							<span className="text-lg font-semibold">box</span>
							<span className="text-lg font-semibold">ebay</span>
						</div>
					</div>
				</div>
			</div>

			<Dialog
				open={openModal === "enterprise"}
				onOpenChange={(open) => !open && setOpenModal(null)}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="text-2xl">Enterprise Features</DialogTitle>
						<DialogDescription>
							Built for teams that need advanced security, compliance, and
							customization
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-6 py-4">
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
								<div>
									<h4 className="font-semibold mb-1">
										Advanced Security & Compliance
									</h4>
									<p className="text-sm text-muted-foreground">
										SOC 2 Type II, GDPR compliant, SSO/SAML support, and
										advanced audit logs
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
								<div>
									<h4 className="font-semibold mb-1">
										White-label Customization
									</h4>
									<p className="text-sm text-muted-foreground">
										Fully customizable branding, domains, and email templates
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
								<div>
									<h4 className="font-semibold mb-1">Dedicated Support</h4>
									<p className="text-sm text-muted-foreground">
										Priority support with dedicated CSM and 99.9% uptime SLA
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
								<div>
									<h4 className="font-semibold mb-1">Advanced Workflows</h4>
									<p className="text-sm text-muted-foreground">
										Bulk sending, custom templates, API access, and webhook
										integrations
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
								<div>
									<h4 className="font-semibold mb-1">Embedded Signing</h4>
									<p className="text-sm text-muted-foreground">
										Seamlessly integrate document signing directly into your
										application
									</p>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={openModal === "pricing"}
				onOpenChange={(open) => !open && setOpenModal(null)}
			>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle className="text-2xl">Pricing Plans</DialogTitle>
						<DialogDescription>
							Choose the plan that best fits your team's needs
						</DialogDescription>
					</DialogHeader>
					<div className="grid md:grid-cols-3 gap-4 py-4">
						<Card className="p-6 border-border">
							<h3 className="text-lg font-semibold mb-2">Starter</h3>
							<div className="mb-4">
								<span className="text-3xl font-bold">$29</span>
								<span className="text-muted-foreground">/month</span>
							</div>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>Up to 50 documents/month</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>Basic templates</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>Email support</span>
								</li>
							</ul>
						</Card>
						<Card className="p-6 border-accent border-2 relative">
							<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
								Popular
							</div>
							<h3 className="text-lg font-semibold mb-2">Professional</h3>
							<div className="mb-4">
								<span className="text-3xl font-bold">$99</span>
								<span className="text-muted-foreground">/month</span>
							</div>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>Up to 500 documents/month</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>Advanced templates</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>API access</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>Priority support</span>
								</li>
							</ul>
						</Card>
						<Card className="p-6 border-border">
							<h3 className="text-lg font-semibold mb-2">Enterprise</h3>
							<div className="mb-4">
								<span className="text-3xl font-bold">Custom</span>
							</div>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>Unlimited documents</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>White-label branding</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>SSO/SAML</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-4 w-4 text-accent mt-0.5" />
									<span>Dedicated CSM</span>
								</li>
							</ul>
						</Card>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={openModal === "faq"}
				onOpenChange={(open) => !open && setOpenModal(null)}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-2xl">
							Frequently Asked Questions
						</DialogTitle>
						<DialogDescription>
							Common questions about Documenso Pro
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-6 py-4">
						<div>
							<h4 className="font-semibold mb-2">
								What is this demo showcasing?
							</h4>
							<p className="text-sm text-muted-foreground">
								This demo showcases how enterprise teams can integrate embedded
								document signing directly into their sales workflows. You'll
								experience signing an NDA as part of the demo booking process.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">
								How does embedded signing work?
							</h4>
							<p className="text-sm text-muted-foreground">
								Our embedded signing feature allows you to integrate document
								signing directly into your application using our React SDK or
								API. Documents appear seamlessly within your UI, maintaining
								your brand experience.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">
								Is Documenso legally binding?
							</h4>
							<p className="text-sm text-muted-foreground">
								Yes, documents signed through Documenso are legally binding and
								comply with ESIGN, UETA, and eIDAS regulations. Each signature
								includes a full audit trail.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">
								What security features are included?
							</h4>
							<p className="text-sm text-muted-foreground">
								Enterprise plans include SOC 2 Type II compliance, GDPR
								compliance, SSO/SAML support, advanced encryption, and
								comprehensive audit logs.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">
								Can I customize the signing experience?
							</h4>
							<p className="text-sm text-muted-foreground">
								Yes! Enterprise customers can fully white-label the signing
								experience with custom branding, domains, email templates, and
								UI customization.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Do you offer API access?</h4>
							<p className="text-sm text-muted-foreground">
								Yes, Professional and Enterprise plans include full API access
								with comprehensive documentation, webhooks, and SDK support for
								popular frameworks.
							</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
