import Image from "next/image"
import Link from "next/link"
import QRCode from "qrcode"
import { Dumbbell } from "lucide-react"
import { RecentWaiversFeedLazy } from "@/components/recent-waivers-feed-lazy"
import { buttonVariants } from "@/components/ui/button-variants"
import { getBaseUrl } from "@/lib/base-url"
import { getRecentWaivers } from "@/lib/waivers"

export default async function KioskPage() {
  const baseUrl = await getBaseUrl()
  const signUrl = `${baseUrl}/sign`
  const qrCode = await QRCode.toDataURL(signUrl, {
    width: 320,
    margin: 0,
    color: {
      dark: "#111111",
      light: "#ffffff",
    },
  })

  const { enabled, waivers } = await getRecentWaivers(8)

  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto grid min-h-dvh max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[21fr_13fr] lg:gap-12 lg:px-8 lg:py-10">
        <section className="flex flex-col justify-between gap-12">
          <div className="flex flex-col gap-10">
            <Link
              href="/"
              aria-label="Homepage"
              className="flex w-fit items-center gap-3"
            >
              <Dumbbell className="size-8 shrink-0 stroke-lime-400" />
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold tracking-tight">
                  AcmeFitness
                </div>
                <div className="text-base text-neutral-400 sm:text-sm">
                  Waiver kiosk
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-6">
              <p className="font-mono text-sm tracking-wide text-lime-300/80 uppercase">
                Walk-in check-in
              </p>
              <h1 className="max-w-[14ch] text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Scan the code, sign the waiver, and start training.
              </h1>
              <p className="max-w-[48ch] text-lg text-pretty text-neutral-300 sm:text-xl">
                Visitors can complete the AcmeFitness liability waiver on their
                own phone in a few taps, while staff keep an eye on recent
                check-ins in real time.
              </p>
            </div>

            <ol role="list" className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              {[
                ["01", "Scan the QR code from the gym entrance display."],
                ["02", "Review the waiver and complete the signature flow."],
                ["03", "Wait for staff confirmation and head to the floor."],
              ].map(([step, copy]) => (
                <li
                  key={step}
                  className="flex flex-col gap-3 border-t border-white/10 pt-4"
                >
                  <div className="font-mono text-sm text-lime-300 tabular-nums">
                    {step}
                  </div>
                  <p className="max-w-[32ch] text-base text-pretty text-neutral-300 sm:text-sm">
                    {copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign"
              className={buttonVariants({
                size: "lg",
                className:
                  "h-11 rounded-full px-4 text-sm text-primary-foreground",
              })}
            >
              Open waiver on this device
            </Link>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "h-11 rounded-full border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10",
              })}
            >
              Staff dashboard
            </Link>
          </div>
        </section>

        <aside className="flex flex-col gap-8 border-t border-white/10 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="max-w-[24ch] text-2xl font-semibold tracking-tight text-balance">
                Scan to sign your waiver
              </h2>
              <p className="max-w-[48ch] text-base text-pretty text-neutral-400 sm:text-sm">
                The QR code opens the signing flow directly on the visitor’s
                phone.
              </p>
            </div>

            <div className="w-fit rounded-4xl bg-white p-6 ring-1 ring-white/10">
              <Image
                src={qrCode}
                alt="QR code linking to the waiver signing page"
                width={320}
                height={320}
                priority
                unoptimized
                className="block size-72 sm:size-80"
              />
            </div>

            <p className="max-w-[48ch] text-base text-pretty text-neutral-400 sm:text-sm">
              Direct link:{" "}
              <span className="font-mono text-neutral-300">{signUrl}</span>
            </p>
          </section>

          <section className="flex flex-col gap-4 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-balance">
                Recent waivers
              </h2>
              <p className="max-w-[48ch] text-base text-pretty text-neutral-400 sm:text-sm">
                Live updates appear here as soon as each signing flow is
                completed.
              </p>
            </div>

            <RecentWaiversFeedLazy
              enabled={enabled}
              initialWaivers={waivers}
              limit={8}
              variant="cards"
            />
          </section>
        </aside>
      </div>
    </main>
  )
}
