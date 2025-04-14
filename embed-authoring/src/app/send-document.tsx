"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SendDocumentProps {
  documentId: number;
  sendDocument: (documentId: number) => Promise<void>;
  disabled?: boolean;
}

export const SendDocument = ({
  documentId,
  sendDocument,
  disabled = false,
}: SendDocumentProps) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSend = () => {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      try {
        await sendDocument(documentId);
        setIsSuccess(true);
        // Reset success state after 2 seconds
        setTimeout(() => setIsSuccess(false), 2000);
        router.refresh();
      } catch (error) {
        console.error("Failed to send document:", error);
      }
    });
  };

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
};
