"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Aperture,
  Camera,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Image,
  Sparkles,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SERVICES = [
  "Brand Photography",
  "Product Shots",
  "Event Coverage",
  "Headshots",
]

const PORTFOLIO = [
  { label: "Brand Campaign", gradient: "from-primary to-fuchsia-500" },
  { label: "Product Series", gradient: "from-indigo-500 to-primary" },
  { label: "Event Recap", gradient: "from-purple-500 to-pink-500" },
  { label: "Studio Portraits", gradient: "from-fuchsia-500 to-rose-500" },
]

const REVIEWS = [
  {
    name: "Maya Chen",
    rating: 5,
    text: "Jordan captured our product line perfectly. The images elevated our entire brand presence online.",
    date: "2 weeks ago",
  },
  {
    name: "Derek Williams",
    rating: 5,
    text: "Professional, creative, and incredibly easy to work with. Our event photos were delivered in under 48 hours.",
    date: "1 month ago",
  },
  {
    name: "Ava Thompson",
    rating: 4,
    text: "Great eye for detail and composition. My new headshots got me booked for three campaigns within a week.",
    date: "2 months ago",
  },
]

export function CreatorProfile() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    deliverables: "",
    deadline: "",
    budget: "2500",
    usageRights: "Limited",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/create-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          creatorName: "Jordan Lee",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push(`/contract/${data.id}`)
    } catch (err) {
      console.error("Failed to create contract:", err)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto min-h-svh max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start gap-6">
        <Avatar className="h-20 w-20 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
            JL
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Jordan Lee</h1>
            <Badge variant="secondary" className="gap-1">
              <Aperture className="h-3 w-3" />
              Pro
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">Brand Photographer</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Los Angeles
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              $150/hr
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              4.9/5
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Responds in 2hrs
            </span>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Services</h2>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <Badge key={s} variant="outline" className="gap-1.5 px-3 py-1.5">
              <Camera className="h-3 w-3 text-primary" />
              {s}
            </Badge>
          ))}
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Portfolio</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PORTFOLIO.map((item) => (
            <div
              key={item.label}
              className={`flex aspect-[4/3] items-end rounded-lg bg-gradient-to-br ${item.gradient} p-3`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                <Image className="h-3 w-3" />
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Reviews */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Reviews</h2>
        <div className="space-y-4">
          {REVIEWS.map((review) => (
            <Card key={review.name}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Hire CTA */}
      <div className="sticky bottom-4 flex justify-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="gap-2 px-8 shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Hire for Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Hire Jordan Lee</DialogTitle>
              <DialogDescription>
                Fill in your project details to generate a service agreement.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Your Name</Label>
                  <Input
                    id="clientName"
                    required
                    value={form.clientName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, clientName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Your Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    required
                    value={form.clientEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, clientEmail: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliverables">Deliverables</Label>
                <Textarea
                  id="deliverables"
                  required
                  rows={3}
                  value={form.deliverables}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deliverables: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    required
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deadline: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    required
                    value={form.budget}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, budget: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageRights">Usage Rights</Label>
                  <Select
                    value={form.usageRights}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, usageRights: v ?? "" }))
                    }
                  >
                    <SelectTrigger id="usageRights">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Limited">Limited</SelectItem>
                      <SelectItem value="Full">Full</SelectItem>
                      <SelectItem value="Exclusive">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating Contract..." : "Create Contract"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Press <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]">d</kbd> to
        toggle dark mode
      </p>
    </div>
  )
}
