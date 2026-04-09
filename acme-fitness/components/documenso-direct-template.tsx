"use client"

import dynamic from "next/dynamic"

type DocumensoDirectTemplateProps = {
  className?: string
  host?: string
  token: string
  externalId?: string
  css?: string
  cssVars?: Record<string, string>
  darkModeDisabled?: boolean
  email?: string
  lockEmail?: boolean
  name?: string
  lockName?: boolean
  additionalProps?: Record<string, string | number | boolean>
  onDocumentReady?: () => void
  onDocumentCompleted?: (data: {
    token: string
    documentId: number
    recipientId: number
  }) => void
  onDocumentError?: (error: string) => void
  onFieldSigned?: () => void
  onFieldUnsigned?: () => void
}

const DEFAULT_DOCUMENSO_HOST = "https://app.documenso.com"

const EmbedDirectTemplate = dynamic(
  () =>
    import("@documenso/embed-react").then(
      (module) => module.EmbedDirectTemplate,
    ),
  {
    ssr: false,
  },
)

export function DocumensoDirectTemplate({
  ...props
}: DocumensoDirectTemplateProps) {
  return (
    <EmbedDirectTemplate
      {...props}
      host={props.host || DEFAULT_DOCUMENSO_HOST}
    />
  )
}
