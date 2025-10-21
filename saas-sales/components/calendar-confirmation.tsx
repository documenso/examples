"use client"

import { useState, useMemo } from "react"
import { addDays, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, CheckCircle2, Clock, FileText, Mail, Video } from "lucide-react"
import type { DemoData } from "./demo-scheduler"

type CalendarConfirmationProps = {
  demoData: DemoData
  documentId: string | null
}

export function CalendarConfirmation({ demoData, documentId }: CalendarConfirmationProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isBooked, setIsBooked] = useState(false)

  const availableDates = useMemo(() => {
    const today = new Date()
    return [
      { date: format(addDays(today, 1), "EEE, MMM d"), slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
      { date: format(addDays(today, 2), "EEE, MMM d"), slots: ["9:00 AM", "11:00 AM", "3:00 PM"] },
      { date: format(addDays(today, 3), "EEE, MMM d"), slots: ["10:00 AM", "1:00 PM", "4:00 PM"] },
    ]
  }, [])

  const handleBookDemo = () => {
    setIsBooked(true)
  }

  const handleAddToCalendar = () => {
    if (!selectedDate || !selectedTime) return

    // Parse the selected date and time to create a proper Date object
    const today = new Date()
    const dateMatch = selectedDate.match(/(\w{3}), (\w{3}) (\d+)/)
    if (!dateMatch) return

    const [, , month, day] = dateMatch
    const year = today.getFullYear()

    // Convert time to 24-hour format
    const [time, period] = selectedTime.split(" ")
    const [hours, minutes] = time.split(":")
    let hour24 = parseInt(hours)
    if (period === "PM" && hour24 !== 12) hour24 += 12
    if (period === "AM" && hour24 === 12) hour24 = 0

    const startDate = new Date(`${month} ${day}, ${year} ${hour24}:${minutes}:00`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Documenso Pro//Enterprise Demo//EN
BEGIN:VEVENT
UID:${Date.now()}@documenso.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Documenso Pro Enterprise Demo
DESCRIPTION:Enterprise demo for ${demoData.company}\\n\\nNDA Document ID: ${documentId}\\n\\nWe'll cover:\\n- Live walkthrough of embedded document signing\\n- Custom integration options\\n- Enterprise pricing and security
LOCATION:Video Conference (link will be sent via email)
ORGANIZER;CN=Documenso Sales:mailto:sales@documenso.com
ATTENDEE;CN=${demoData.name};RSVP=TRUE:mailto:${demoData.email}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Demo starting in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `documenso-demo-${demoData.company.toLowerCase().replace(/\s+/g, "-")}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  if (isBooked) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-accent" />
              <span className="text-xl font-semibold">Documenso Pro</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">Demo Scheduled Successfully!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your enterprise demo is confirmed for {selectedDate} at {selectedTime}
            </p>

            <Card className="p-8 bg-card border-border text-left mb-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Video className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Video Conference</p>
                    <p className="text-sm text-muted-foreground">A meeting link will be sent to {demoData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Calendar className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <p className="font-semibold mb-1">
                      {selectedDate} at {selectedTime}
                    </p>
                    <p className="text-sm text-muted-foreground">60 minutes • Pacific Time</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <p className="font-semibold mb-1">NDA Signed</p>
                    <p className="text-sm text-muted-foreground">Document ID: {documentId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Confirmation Sent</p>
                    <p className="text-sm text-muted-foreground">
                      Check {demoData.email} for calendar invite and meeting details
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Button
                onClick={handleAddToCalendar}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
              >
                Add to Calendar
              </Button>
              <Button variant="outline" className="w-full h-12 text-base bg-transparent">
                View Demo Preparation Guide
              </Button>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">Questions? Contact us at sales@documenso.com</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-accent" />
            <span className="text-xl font-semibold">Documenso Pro</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Details</span>
            </div>
            <div className="w-16 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">NDA Signing</span>
            </div>
            <div className="w-16 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-sm font-semibold text-accent-foreground">3</span>
              </div>
              <span className="text-sm font-semibold">Schedule Demo</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Choose your demo time</h1>
            <p className="text-lg text-muted-foreground">Select a convenient time to meet with our enterprise team</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {availableDates.map((day) => (
              <Card key={day.date} className="p-6 bg-card border-border">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <Calendar className="h-5 w-5 text-accent" />
                  <span className="font-semibold">{day.date}</span>
                </div>
                <div className="space-y-2">
                  {day.slots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedDate(day.date)
                        setSelectedTime(time)
                      }}
                      className={`w-full p-3 rounded-lg border transition-all ${
                        selectedDate === day.date && selectedTime === time
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{time}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 bg-card border-border mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Video className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">What to expect in your demo</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Live walkthrough of embedded document signing features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Custom integration options for your sales workflow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Enterprise pricing and security compliance review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Q&A with our solutions architect</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleBookDemo}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
          >
            Confirm Demo Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
