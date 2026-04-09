import { FlaskConical, ShieldCheck } from "lucide-react"
import { STUDY } from "@/lib/mock-data"
import { ParticipantRoster } from "@/components/participant-roster"

export function StudyDashboard() {
  return (
    <div className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FlaskConical className="size-4 shrink-0 stroke-muted-foreground" />
              <span>Active study workspace</span>
            </div>
            <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {STUDY.title}
            </h1>
            <p className="max-w-[60ch] text-base text-pretty text-muted-foreground">
              Coordinators can generate the informed consent form from a
              Documenso template, pre-fill participant details, capture the
              signature inline, and review the envelope audit trail.
            </p>
          </div>

          <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <StudyMetaItem label="Phase" value={STUDY.phase} />
            <StudyMetaItem label="Study ID" value={STUDY.id} />
            <StudyMetaItem label="Protocol" value={STUDY.protocolVersion} />
            <StudyMetaItem label="Sponsor" value={STUDY.sponsor} />
          </dl>
        </div>

        <aside className="space-y-6 border-l border-border pl-6 lg:pl-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 shrink-0 stroke-primary" />
              <span>Consent operations</span>
            </div>
            <p className="text-sm text-pretty text-muted-foreground">
              Participant signature is required before randomization can begin.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Protocol in use</p>
            <p className="text-2xl font-semibold tabular-nums">
              {STUDY.protocolVersion}
            </p>
            <p className="text-sm text-pretty text-muted-foreground">
              The current ICF template pre-fills participant name, study ID,
              protocol version, and site name before the signing flow opens.
            </p>
          </div>
        </aside>
      </section>

      <ParticipantRoster />
    </div>
  )
}

function StudyMetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
