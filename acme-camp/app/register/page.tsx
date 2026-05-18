"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getSession } from "@/lib/camp-data"

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")
  const campSession = sessionId ? getSession(sessionId) : undefined

  const [processing, setProcessing] = useState(false)

  const [childName, setChildName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [parentName, setParentName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [emergencyName, setEmergencyName] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")
  const [medical, setMedical] = useState("")

  useEffect(() => {
    if (!sessionId || !campSession) {
      router.replace("/")
    }
  }, [sessionId, campSession, router])

  if (!campSession) return null

  const isFormValid = Boolean(
    childName.trim() &&
    childAge &&
    parentName.trim() &&
    email.trim() &&
    phone.trim() &&
    emergencyName.trim() &&
    emergencyPhone.trim(),
  )

  function handlePay() {
    if (!isFormValid) return
    setProcessing(true)

    sessionStorage.setItem(
      "camp-registration",
      JSON.stringify({
        childName,
        childAge,
        parentName,
        email,
        phone,
        emergencyName,
        emergencyPhone,
        medical,
        sessionId: campSession!.id,
        sessionDates: campSession!.dates,
        price: campSession!.price,
      }),
    )

    setTimeout(() => {
      router.push("/waivers")
    }, 1800)
  }

  return (
    <section className="py-10 sm:py-14">
      <PageContainer>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sessions
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-primary">Week {campSession.week}</p>
          <h1 className="mt-3 max-w-[16ch] text-4xl font-semibold tracking-tight text-balance">
            Register your camper.
          </h1>
          <p className="mt-4 max-w-[48ch] text-base text-muted-foreground text-pretty">
            Session dates: {campSession.dates}. Tuition: ${campSession.price}. Complete
            this form, then finish payment and waivers.
          </p>

          <div className="mt-8 rounded-[2rem] border border-border/80 bg-card p-6 sm:p-8">
            <div className="space-y-8">
              <section>
                <p className="text-base font-medium text-foreground">Camper details</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="childName">Child&apos;s name</Label>
                    <Input
                      id="childName"
                      name="childName"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="First and last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childAge">Age</Label>
                    <Select
                      name="childAge"
                      value={childAge}
                      onValueChange={(value) => setChildAge(value ?? "")}
                    >
                      <SelectTrigger id="childAge" className="w-full">
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 11 }, (_, i) => i + 6).map((age) => (
                          <SelectItem key={age} value={String(age)}>
                            {age} years old
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-base font-medium text-foreground">Parent or guardian</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Full name</Label>
                    <Input
                      id="parentName"
                      name="parentName"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section>
                <p className="text-base font-medium text-foreground">Emergency contact</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact name</Label>
                    <Input
                      id="emergencyName"
                      name="emergencyName"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact phone</Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section>
                <p className="text-base font-medium text-foreground">Medical notes</p>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="medical">Conditions, allergies, or medications</Label>
                  <Textarea
                    id="medical"
                    name="medical"
                    value={medical}
                    onChange={(e) => setMedical(e.target.value)}
                    placeholder="Leave blank if none"
                    rows={3}
                  />
                </div>
              </section>

              <section>
                <p className="text-base font-medium text-foreground">Payment</p>
                <div className="mt-4 rounded-[1.5rem] bg-muted px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Demo payment</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Uses the test card ending in 4242.
                      </p>
                    </div>
                    <p className="text-xl font-semibold tracking-tight tabular-nums">
                      ${campSession.price}
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="mt-4 w-full"
                    size="lg"
                    disabled={!isFormValid || processing}
                    onClick={handlePay}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Processing payment
                      </>
                    ) : (
                      `Pay $${campSession.price}`
                    )}
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<section className="py-10 sm:py-14" />}>
      <RegisterPageContent />
    </Suspense>
  )
}
