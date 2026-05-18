"use client"

import { Download, ExternalLink, FileSpreadsheet, FileText } from "lucide-react"
import { DATA_ROOM_FILES } from "@/lib/acme-deal"
import { cn } from "@/lib/utils"

function FileIcon({ type }: { type: string }) {
  if (type === "CSV") {
    return (
      <FileSpreadsheet className="size-4 h-lh shrink-0 stroke-muted-foreground" />
    )
  }

  return <FileText className="size-4 h-lh shrink-0 stroke-muted-foreground" />
}

type DataRoomProps = {
  mode: "preview" | "full"
}

export function DataRoom({ mode }: DataRoomProps) {
  const isPreview = mode === "preview"

  return (
    <div>
      <ul role="list" className="divide-y divide-border/60">
        {DATA_ROOM_FILES.map((file) => (
          <li
            key={file.title}
            className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <FileIcon type={file.type} />
                <div className="space-y-1">
                  <p className="font-medium">{file.title}</p>
                  <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground tabular-nums">
                    <span>{file.type}</span>
                    <span>{file.sizeLabel}</span>
                    <span>{file.updatedAt}</span>
                  </p>
                </div>
              </div>

              <p className="max-w-[72ch] text-sm text-pretty text-muted-foreground">
                {file.description}
              </p>
            </div>

            {isPreview ? (
              <p className="text-sm text-muted-foreground lg:text-right">
                Locked until the NDA is completed.
              </p>
            ) : (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm lg:justify-end">
                <a
                  href={file.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
                  )}
                >
                  <ExternalLink className="size-4 shrink-0" />
                  Open
                </a>
                <a
                  href={file.href}
                  download
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
                  )}
                >
                  <Download className="size-4 shrink-0" />
                  Download
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
