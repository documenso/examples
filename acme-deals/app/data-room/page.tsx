import Link from "next/link"
import { redirect } from "next/navigation"
import { DataRoom } from "@/components/data-room"
import { DEAL_NAME } from "@/lib/acme-deal"
import { getValidatedDataRoomAccess } from "@/lib/data-room-access"

export const metadata = {
  title: `${DEAL_NAME} Data Room`,
  description: `Unlocked deal room for ${DEAL_NAME}.`,
}

export default async function DataRoomPage() {
  const access = await getValidatedDataRoomAccess()

  if (!access) {
    redirect("/")
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/" aria-label="Homepage" className="text-sm font-medium">
            AcmeDeals
          </Link>
          <span className="text-sm text-muted-foreground">{DEAL_NAME}</span>
        </div>
      </header>

      <main className="isolate mx-auto max-w-5xl px-6 py-10">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="space-y-3">
            <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {DEAL_NAME} data room
            </h1>
            <p className="max-w-[60ch] text-base text-pretty text-muted-foreground">
              The signed NDA is on file. Review or download the materials
              below.
            </p>
          </div>

          <aside className="space-y-2 border-l border-border/60 pl-6 lg:pl-8">
            <div className="space-y-1">
              <p className="text-sm font-medium">Authorized recipient</p>
              <p className="text-sm text-pretty text-muted-foreground">
                {access.recipientName}
                <br />
                {access.recipientEmail}
              </p>
            </div>
          </aside>
        </section>

        <section className="pt-10">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-balance">
              Available files
            </h2>
            <p className="text-base text-pretty text-muted-foreground">
              Open each file in a new tab or download a local copy.
            </p>
          </div>

          <div className="pt-6">
            <DataRoom mode="full" />
          </div>
        </section>
      </main>
    </div>
  )
}
