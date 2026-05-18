"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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
    <div className="space-y-5 p-6 sm:p-7">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Form 8879</p>
        <h2 className="max-w-[24ch] text-2xl font-semibold tracking-tight text-balance">
          Send e-file authorization for signature
        </h2>
        <p className="max-w-[48ch] text-base text-pretty text-muted-foreground">
          Confirm the signer email for {client.name}. This request is for the
          2025 return.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xs space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Signer Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="max-sm:text-base/6"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
            />
          )}
          Send 8879 for signing
        </Button>
      </form>
    </div>
  )
}
