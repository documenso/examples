"use client"

import { unstable_EmbedUpdateDocument as EmbedUpdateDocument } from "@documenso/embed-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/sonner"

type UpdateDocumentInlineProps = {
  presignToken: string
  documentId: number
  host?: string
  onDocumentUpdated?: () => void
  className?: string
}

export const UpdateDocumentInline = ({
  presignToken,
  documentId,
  host,
  onDocumentUpdated,
  className = "h-[600px] w-full"
}: UpdateDocumentInlineProps) => {
  const router = useRouter()

  const handleDocumentUpdated = () => {
    toast.success("Document updated successfully")
    onDocumentUpdated?.()
    router.refresh()
  }

  return (
    <EmbedUpdateDocument
      className={className}
      host={host}
      presignToken={presignToken}
      documentId={documentId}
      onDocumentUpdated={handleDocumentUpdated}
    />
  )
}