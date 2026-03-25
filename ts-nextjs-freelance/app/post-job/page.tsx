"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect } from "react"
import { X, Plus, ArrowLeft, ArrowRight, Check, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries"

export default function PostJobPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isClient, role, userId } = useUser()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budgetType: "fixed" as "fixed" | "hourly",
    budgetMin: "",
    budgetMax: "",
    duration: "",
    skills: [] as string[],
  })
  const [skillInput, setSkillInput] = useState("")

  useEffect(() => {
    if (role && !isClient) {
      router.push("/")
    }
  }, [role, isClient, router])

  if (role && !isClient) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only clients can post jobs. Switch to a client account to access this feature.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] })
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) })
  }

  const handleSubmit = async () => {
    if (!userId) {
      alert("User not found. Please log in again.")
      router.push("/select-role")
      return
    }

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budgetMin: formData.budgetMin,
          budgetMax: formData.budgetMax,
          budgetType: formData.budgetType,
          duration: formData.duration,
          skills: formData.skills,
          postedById: userId,
        }),
      })

      if (response.ok) {
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: queryKeys.jobs })

        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        alert(`Failed to post job: ${errorData.error || "Unknown error"}`)
      }
    } catch {
      alert("An error occurred while posting the job. Please try again.")
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return formData.title.trim() && formData.description.trim()
    }
    if (step === 2) {
      return formData.budgetMin && formData.budgetMax && formData.duration.trim()
    }
    if (step === 3) {
      return formData.skills.length > 0
    }
    return false
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
                      s < step
                        ? "border-primary bg-primary text-primary-foreground"
                        : s === step
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {s < step ? <Check className="h-5 w-5" /> : s}
                  </div>
                  <span
                    className={`hidden text-sm font-medium sm:block ${s === step ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s === 1 ? "Job Details" : s === 2 ? "Budget & Timeline" : "Skills Required"}
                  </span>
                </div>
                {s < 3 && <div className="mx-4 h-0.5 flex-1 bg-border" />}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? "Tell us about your project" : step === 2 ? "Set your budget" : "What skills are needed?"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Provide a clear title and description to attract the right freelancers"
                : step === 2
                  ? "Define your budget and project timeline"
                  : "Add the skills required for this job"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Full-Stack Developer for E-commerce Platform"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Write a clear, descriptive title that explains what you need
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail. Include what you're building, the features you need, and any specific requirements..."
                    rows={8}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 50 characters. Be specific about your requirements and expectations.
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-3">
                  <Label>Budget Type</Label>
                  <RadioGroup
                    value={formData.budgetType}
                    onValueChange={(value) => setFormData({ ...formData, budgetType: value as "fixed" | "hourly" })}
                  >
                    <div className="flex items-center space-x-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed" className="flex-1 cursor-pointer">
                        <div className="font-medium">Fixed Price</div>
                        <div className="text-sm text-muted-foreground">Pay a set amount for the entire project</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                        <div className="font-medium">Hourly Rate</div>
                        <div className="text-sm text-muted-foreground">Pay based on hours worked</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Minimum {formData.budgetType === "fixed" ? "Budget" : "Rate"}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="budgetMin"
                        type="number"
                        placeholder="5000"
                        className="pl-7"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Maximum {formData.budgetType === "fixed" ? "Budget" : "Rate"}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="budgetMax"
                        type="number"
                        placeholder="8000"
                        className="pl-7"
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Project Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2-3 months, 6 weeks, Ongoing"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Estimate how long this project will take</p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="skills">Add Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      placeholder="e.g., React, Node.js, Python"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Add at least 3 skills that are required for this job</p>
                </div>

                {formData.skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Skills ({formData.skills.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 rounded-full p-0.5 hover:bg-background"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Suggested Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {["JavaScript", "TypeScript", "React", "Node.js", "Python", "UI/UX Design", "Figma"].map(
                      (skill) =>
                        !formData.skills.includes(skill) && (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => setFormData({ ...formData, skills: [...formData.skills, skill] })}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            {skill}
                          </Badge>
                        ),
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between border-t border-border pt-6">
              <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed()}>
                  <Check className="mr-2 h-4 w-4" />
                  Post Job
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
