"use client"

import { unstable_EmbedCreateDocument as EmbedCreateDocument } from "@documenso/embed-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/sonner"

type CreateDocumentInlineProps = {
  presignToken: string
  host?: string
  onDocumentCreated?: () => void
  className?: string
}

export const CreateDocumentInline = ({
  presignToken,
  host,
  onDocumentCreated,
  className = "h-[800px] w-full"
}: CreateDocumentInlineProps) => {
  const router = useRouter()

  const handleDocumentCreated = () => {
    toast.success("Document created successfully")
    onDocumentCreated?.()
    router.refresh()
  }

  return (
    <EmbedCreateDocument
      className={className}
      host={host}
      presignToken={presignToken}
      onDocumentCreated={handleDocumentCreated}
    />
  )
}