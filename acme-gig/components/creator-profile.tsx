"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const SERVICES = [
  {
    title: "Brand photography",
    description:
      "Editorial campaign imagery for consumer brands and product launches.",
  },
  {
    title: "Product shots",
    description:
      "Studio and lifestyle stills for commerce, paid social, and retail decks.",
  },
  {
    title: "Event coverage",
    description:
      "Launch events, dinners, conferences, and activation recaps with same-week delivery.",
  },
  {
    title: "Headshots",
    description:
      "Founder portraits and team photos that feel consistent with the wider brand system.",
  },
]

const WORK = [
  {
    title: "Spring brand refresh",
    description: "Looply · Launch stills for paid social and the new homepage.",
    image: "https://assets.ui.sh/wallpapers/landscapes.webp?variant=coast",
  },
  {
    title: "Studio catalog",
    description:
      "Artifact · Clean product coverage for a seasonal accessories drop.",
    image:
      "https://assets.ui.sh/wallpapers/landscapes.webp?variant=fossil-cliffs",
  },
  {
    title: "Founder portrait series",
    description: "Relay · Press portraits and investor update imagery.",
    image:
      "https://assets.ui.sh/wallpapers/landscapes.webp?variant=misty-marshland",
  },
  {
    title: "Launch-night coverage",
    description: "Orbital · Event documentation with 48-hour selects.",
    image: "https://assets.ui.sh/wallpapers/landscapes.webp?variant=lake",
  },
]

const REVIEWS = [
  {
    name: "Riley Chen",
    role: "Brand lead at Looply",
    date: "2 weeks ago",
    avatar: "https://assets.ui.sh/avatars/3.webp?size=96",
    quote:
      "Jordan gave us a full campaign library that felt considered from the first scouting note to final delivery.",
  },
  {
    name: "Casey Morgan",
    role: "Founder at Relay",
    date: "1 month ago",
    avatar: "https://assets.ui.sh/avatars/11.webp?size=96",
    quote:
      "The process was calm, direct, and fast. We shipped updated headshots and product stills in the same week.",
  },
  {
    name: "Avery Patel",
    role: "Marketing director at Artifact",
    date: "2 months ago",
    avatar: "https://assets.ui.sh/avatars/6.webp?size=96",
    quote:
      "The images landed exactly where we needed them to. Nothing felt over-styled, and the licensing was clear from day one.",
  },
]

const primaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-base font-medium text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:px-3 sm:text-sm dark:bg-white dark:text-zinc-950"

const secondaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-lg px-4 text-base font-medium text-zinc-700 ring-1 ring-zinc-950/10 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:h-9 sm:px-3 sm:text-sm dark:text-zinc-200 dark:ring-white/10"

const fieldClassName =
  "w-full rounded-lg bg-white px-4 py-3 text-base text-zinc-900 ring-1 ring-zinc-950/10 outline-none placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-500 sm:px-3 sm:py-2 sm:text-sm dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-zinc-500"

export function CreatorProfile() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    setError(null)

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

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create contract")
      }

      router.push(`/contract/${data.id}`)
    } catch (err) {
      console.error("Failed to create contract:", err)
      setError(err instanceof Error ? err.message : "Failed to create contract")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-16 sm:gap-20">
          <section className="grid gap-10 border-b border-zinc-950/8 pb-16 lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] dark:border-white/10">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                  Brand photographer · Los Angeles.
                </p>
                <div className="flex flex-col gap-4">
                  <h1 className="max-w-[14ch] text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                    Clean photography for brands that need to move quickly.
                  </h1>
                  <p className="max-w-[56ch] text-base/7 text-pretty text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                    Jordan Lee photographs campaigns, product launches, and
                    founder teams with a restrained visual style and clear
                    commercial terms.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <DialogTrigger
                  render={
                    <button type="button" className={primaryButtonClassName} />
                  }
                >
                  Book Jordan
                </DialogTrigger>
                <a
                  href="#selected-work"
                  className="text-base/7 font-medium text-zinc-600 underline underline-offset-4 outline-none focus-visible:text-zinc-950 sm:text-sm/6 dark:text-zinc-300 dark:focus-visible:text-white"
                >
                  View selected work
                </a>
              </div>
              <dl className="grid gap-6 text-base/7 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 sm:text-sm/6 xl:grid-cols-4">
                <div className="flex flex-col gap-2 border-t border-zinc-950/8 pt-4 dark:border-white/10">
                  <dt className="text-zinc-500 dark:text-zinc-400">Rate</dt>
                  <dd className="text-2xl font-medium tracking-tight text-zinc-950 tabular-nums sm:text-xl dark:text-white">
                    $150/hr
                  </dd>
                </div>
                <div className="flex flex-col gap-2 border-t border-zinc-950/8 pt-4 dark:border-white/10">
                  <dt className="text-zinc-500 dark:text-zinc-400">Rating</dt>
                  <dd className="text-2xl font-medium tracking-tight text-zinc-950 tabular-nums sm:text-xl dark:text-white">
                    4.9
                  </dd>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    From 48 projects.
                  </p>
                </div>
                <div className="flex flex-col gap-2 border-t border-zinc-950/8 pt-4 dark:border-white/10">
                  <dt className="text-zinc-500 dark:text-zinc-400">
                    Response time
                  </dt>
                  <dd className="text-2xl font-medium tracking-tight text-zinc-950 tabular-nums sm:text-xl dark:text-white">
                    2 hours
                  </dd>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Average reply window.
                  </p>
                </div>
                <div className="flex flex-col gap-2 border-t border-zinc-950/8 pt-4 dark:border-white/10">
                  <dt className="text-zinc-500 dark:text-zinc-400">
                    Availability
                  </dt>
                  <dd className="font-medium text-zinc-950 dark:text-white">
                    May and June
                  </dd>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Currently booking.
                  </p>
                </div>
              </dl>
            </div>
            <div className="flex flex-col gap-4">
              <Image
                src="https://assets.ui.sh/avatars/7.webp?size=720"
                alt=""
                width={720}
                height={900}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[4/5] w-full rounded-[min(1vw,12px)] object-cover outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
              />
              <p className="max-w-[42ch] text-base/7 text-pretty text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                Best fit for consumer brands, early-stage teams, and marketing
                leads who want clear art direction and fast post-production
                without the usual production overhead.
              </p>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="flex flex-col gap-4">
              <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                Services.
              </p>
              <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                A focused service list with pricing that stays straightforward.
              </h2>
            </div>
            <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-y-12">
              {SERVICES.map((service) => (
                <div key={service.title} className="flex flex-col gap-2">
                  <dt className="font-medium text-zinc-950 dark:text-white">
                    {service.title}
                  </dt>
                  <dd className="text-base/7 text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                    {service.description}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            id="selected-work"
            className="flex flex-col gap-8 border-t border-zinc-950/8 pt-16 dark:border-white/10"
          >
            <div className="flex flex-col gap-4">
              <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                Selected work.
              </p>
              <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Recent assignments built for launch calendars, lookbooks, and
                brand updates.
              </h2>
            </div>
            <ul role="list" className="grid gap-8 sm:grid-cols-2">
              {WORK.map((item) => (
                <li key={item.title} className="flex flex-col gap-3">
                  <Image
                    src={item.image}
                    alt=""
                    width={1200}
                    height={900}
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="aspect-[4/3] w-full rounded-[min(1vw,12px)] object-cover outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-zinc-950 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            id="process"
            className="grid gap-8 border-t border-zinc-950/8 pt-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,3.5fr)] dark:border-white/10"
          >
            <div className="flex flex-col gap-4">
              <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                How it works.
              </p>
              <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                The process stays simple from inquiry to signed agreement.
              </h2>
            </div>
            <ol
              role="list"
              className="grid gap-8 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {[
                {
                  step: "01",
                  title: "Share scope and timing",
                  description:
                    "Outline the deliverables, deadline, and licensing needs for the assignment.",
                },
                {
                  step: "02",
                  title: "Generate the agreement",
                  description:
                    "Acme Gig creates a service contract instantly so both sides review the same commercial terms.",
                },
                {
                  step: "03",
                  title: "Sign and start production",
                  description:
                    "Once both signatures land in Documenso, the project moves into scheduling and production.",
                },
              ].map((item) => (
                <li key={item.step} className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-3">
                    <p className="text-2xl font-medium tracking-tight text-zinc-300 tabular-nums sm:text-3xl dark:text-zinc-700">
                      {item.step}
                    </p>
                    <div className="h-px flex-1 bg-zinc-950/8 dark:bg-white/10" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-zinc-950 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-base/7 text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-8 border-t border-zinc-950/8 pt-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,3.5fr)] dark:border-white/10">
            <div className="flex flex-col gap-4">
              <p className="text-base/7 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                Reviews.
              </p>
              <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Clients come back because the work is sharp and the handoff is
                reliable.
              </h2>
            </div>
            <div className="grid gap-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {REVIEWS.map((review) => (
                <blockquote
                  key={review.name}
                  className="flex h-full flex-col justify-between gap-6"
                >
                  <div className="flex flex-col gap-4">
                    <p className="relative max-w-[36ch] pl-4 text-base/7 text-pretty text-zinc-700 before:absolute before:left-4 before:-translate-x-full before:content-['\201C'] after:inline after:content-['\201D'] sm:text-sm/6 dark:text-zinc-300">
                      {review.quote}
                    </p>
                  </div>
                  <footer className="flex items-center gap-3 text-base/7 sm:text-sm/6">
                    <Image
                      src={review.avatar}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 shrink-0 rounded-full object-cover outline-1 -outline-offset-1 outline-black/5 sm:size-10 dark:outline-white/10"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-950 dark:text-white">
                        {review.name}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        {review.role}
                      </p>
                      <p className="text-zinc-400 dark:text-zinc-500">
                        {review.date}
                      </p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-950/8 bg-background/95 p-4 backdrop-blur-sm lg:hidden dark:border-white/10">
        <DialogTrigger
          render={
            <button
              type="button"
              className={`${primaryButtonClassName} w-full`}
            />
          }
        >
          Book Jordan
        </DialogTrigger>
      </div>

      <DialogContent
        showCloseButton={false}
        className="max-w-2xl rounded-lg p-8 shadow-none ring-zinc-950/10 dark:shadow-none dark:ring-white/10"
      >
        <DialogHeader className="gap-3">
          <DialogTitle className="max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-2xl">
            Start a new agreement with Jordan Lee.
          </DialogTitle>
          <DialogDescription className="max-w-[48ch] text-base/7 text-pretty text-zinc-600 sm:text-sm/6 dark:text-zinc-400">
            Share the project scope and Acme Gig will generate a contract for
            both parties to sign in Documenso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="font-medium text-zinc-950 dark:text-white">
                Your name
              </span>
              <input
                id="clientName"
                name="clientName"
                required
                value={form.clientName}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    clientName: e.target.value,
                  }))
                }
                className={fieldClassName}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-medium text-zinc-950 dark:text-white">
                Your email
              </span>
              <input
                id="clientEmail"
                name="clientEmail"
                type="email"
                required
                value={form.clientEmail}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    clientEmail: e.target.value,
                  }))
                }
                className={fieldClassName}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-medium text-zinc-950 dark:text-white">
              Deliverables
            </span>
            <textarea
              id="deliverables"
              name="deliverables"
              required
              rows={4}
              value={form.deliverables}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  deliverables: e.target.value,
                }))
              }
              className={`${fieldClassName} min-h-32 resize-none`}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="font-medium text-zinc-950 dark:text-white">
                Deadline
              </span>
              <input
                id="deadline"
                name="deadline"
                type="date"
                required
                value={form.deadline}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    deadline: e.target.value,
                  }))
                }
                className={fieldClassName}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-medium text-zinc-950 dark:text-white">
                Budget
              </span>
              <input
                id="budget"
                name="budget"
                type="number"
                required
                value={form.budget}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    budget: e.target.value,
                  }))
                }
                className={`${fieldClassName} tabular-nums`}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-medium text-zinc-950 dark:text-white">
                Usage rights
              </span>
              <span className="inline-grid grid-cols-[1fr_--spacing(8)]">
                <select
                  id="usageRights"
                  name="usageRights"
                  value={form.usageRights}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      usageRights: e.target.value,
                    }))
                  }
                  className={`${fieldClassName} col-span-full row-start-1 appearance-none pr-8`}
                >
                  <option value="Limited">Limited</option>
                  <option value="Full">Full</option>
                  <option value="Exclusive">Exclusive</option>
                </select>
                <svg
                  viewBox="0 0 8 5"
                  width="8"
                  height="5"
                  fill="none"
                  className="pointer-events-none col-start-2 row-start-1 place-self-center text-zinc-500 dark:text-zinc-400"
                >
                  <path d="M.5.5 4 4 7.5.5" stroke="currentColor" />
                </svg>
              </span>
            </label>
          </div>

          {error ? (
            <p className="text-base/7 text-red-600 sm:text-sm/6 dark:text-red-400">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose
              render={
                <button type="button" className={secondaryButtonClassName} />
              }
            >
              Cancel
            </DialogClose>
            <button
              type="submit"
              disabled={loading}
              className={primaryButtonClassName}
            >
              {loading ? "Creating agreement..." : "Create agreement"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
