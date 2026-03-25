"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SendDocumentButtonProps {
  documentId: number;
  sendDocument: (documentId: number) => Promise<void>;
  disabled?: boolean;
}

export function SendDocumentButton({
  documentId,
  sendDocument,
  disabled = false,
}: SendDocumentButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  function handleSend() {
    if (isPending) return;
    startTransition(async () => {
      try {
        await sendDocument(documentId);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
        router.refresh();
      } catch (error) {
        console.error("Failed to send document:", error);
      }
    });
  }

  return (
    <Button
      onClick={handleSend}
      size="sm"
      className="relative"
      variant={isSuccess ? "outline" : "default"}
      disabled={disabled || isPending || isSuccess}
    >
      <span className={isPending ? "invisible" : ""}>
        {isSuccess ? "Sent!" : "Send"}
      </span>
      {isPending && (
        <span className="absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}
    </Button>
  );
}
