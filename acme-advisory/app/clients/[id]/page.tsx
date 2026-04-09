"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  TrendingUp,
  ArrowLeft,
  DollarSign,
  Shield,
  Target,
  FileText,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getMockClient, formatAum, calculateFee } from "@/lib/mock-clients"

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const client = getMockClient(id)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    )
  }

  const effectiveFee = calculateFee(client.aum)
  const annualFee =
    client.aum <= 1000000
      ? client.aum * 0.01
      : 1000000 * 0.01 + (client.aum - 1000000) * 0.0075

  async function handleStartOnboarding() {
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch("/api/start-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: client!.name,
          email,
          aum: formatAum(client!.aum),
          fee: effectiveFee,
        }),
      })
      const data = await res.json()
      if (data.sessionId) {
        router.push(`/clients/${data.sessionId}/onboarding`)
      }
    } catch (err) {
      console.error("Failed to start onboarding:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Meridian Wealth Advisors</h1>
              <p className="text-muted-foreground text-xs">Client Detail</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </Link>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
            <p className="text-muted-foreground mt-1">
              {formatAum(client.aum)} Assets Under Management
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {client.stage === "prospect" ? "Prospect" : client.stage}
          </Badge>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Assets Under Management
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAum(client.aum)}</div>
              <p className="text-muted-foreground text-xs">
                Effective fee: {effectiveFee}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Risk Profile</CardTitle>
              <Shield className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.riskProfile}</div>
              <p className="text-muted-foreground text-xs">
                Investment strategy alignment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Estimated Annual Fee
              </CardTitle>
              <Target className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${annualFee.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </div>
              <p className="text-muted-foreground text-xs">
                Based on current AUM
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Fee Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">First $1,000,000</span>
                <span className="font-mono text-sm font-semibold">1.00%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Over $1,000,000</span>
                <span className="font-mono text-sm font-semibold">0.75%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
                <span className="text-sm font-medium">
                  Effective Rate ({formatAum(client.aum)})
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {effectiveFee}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Investment Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{client.investmentGoals}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Onboarding Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Three documents are required to complete client onboarding:
            </p>
            <div className="mb-6 space-y-2">
              <div className="text-muted-foreground flex items-center gap-2 rounded border p-3 text-sm">
                <span className="font-mono text-xs">1.</span>
                Investment Management Agreement (IMA)
              </div>
              <div className="text-muted-foreground flex items-center gap-2 rounded border p-3 text-sm">
                <span className="font-mono text-xs">2.</span>
                Fee Acknowledgment
              </div>
              <div className="text-muted-foreground flex items-center gap-2 rounded border p-3 text-sm">
                <span className="font-mono text-xs">3.</span>
                ADV Part 2 Disclosure
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger>
                <Button className="w-full">
                  Start Onboarding
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Onboarding for {client.name}</DialogTitle>
                  <DialogDescription>
                    Enter the client&apos;s email address to send onboarding
                    documents for signing.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="client@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartOnboarding}
                    disabled={!email || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Documents...
                      </>
                    ) : (
                      "Send Documents"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
