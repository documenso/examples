"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileSpreadsheet, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClientStatuses } from "@/hooks/use-client-statuses"
import type { TaxClient } from "@/lib/mock-data"

/**
 * Dialog-only form that generates a signing token and redirects
 * to the full-page signing embed at /clients/[id]/sign.
 */
export function SigningFlow({
  client,
  onRequestClose,
}: {
  client: TaxClient
  onRequestClose: () => void
}) {
  const router = useRouter()
  const { updateClientStatus } = useClientStatuses()
  const [email, setEmail] = useState(client.email)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id, email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate document")
      }

      const data = await res.json()
      updateClientStatus(client.id, "pending")
      onRequestClose()
      router.push(`/clients/${client.id}/sign?token=${data.signingToken}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5" />
        <h2 className="text-lg font-semibold">IRS Form 8879 — E-File Authorization</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Send Form 8879 to {client.name} for electronic signature. Tax Year
        2025.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Signer Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send 8879 for Signing
        </Button>
      </form>
    </div>
  )
}
