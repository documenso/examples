"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ViewDocumentProps {
  documentId: number;
  documentTitle: string;
  fetchDocumentUrl: (documentId: number) => Promise<string>;
  disabled?: boolean;
}

export const ViewDocument = ({
  documentId,
  documentTitle,
  fetchDocumentUrl,
  disabled = false,
}: ViewDocumentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    startTransition(async () => {
      if (open) {
        if (!documentUrl) {
          const url = await fetchDocumentUrl(documentId);
          setDocumentUrl(url);
        }
      }

      setIsOpen(open);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative"
          size="sm"
          disabled={disabled || isPending}
        >
          <span className={isPending ? "invisible" : ""}>View</span>
          {isPending && (
            <span className="absolute inset-0 z-10 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{documentTitle}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 h-full">
          {isPending ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documentUrl ? (
            <embed
              type="application/pdf"
              src={documentUrl}
              className="w-full h-[80vh] border-0 rounded-md"
              title={documentTitle}
            />
          ) : (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              Unable to load document
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
