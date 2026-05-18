"use client";

import { ReactNode, useState } from "react";

import { EmbedUpdateEnvelopeV2 } from "@documenso/embed-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";

type UpdateDocumentProps = {
  presignToken: string;
  envelopeId: string;
  host?: string;
  trigger?: ReactNode;
  buttonText?: string;
};

export const UpdateDocument = ({
  presignToken,
  envelopeId,
  host,
  trigger,
  buttonText = "Update",
}: UpdateDocumentProps) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleEnvelopeUpdated = () => {
    setOpen(false);

    toast.success("Document Updated successfully");
    router.refresh();
  };

  const defaultTrigger = <Button>{buttonText}</Button>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-5xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Update Document</DialogTitle>
        </DialogHeader>

        <div key={open ? "open" : "closed"} className="-mx-4 -mt-6">
          <EmbedUpdateEnvelopeV2
            className="h-[80dvh] w-full"
            host={host}
            presignToken={presignToken}
            envelopeId={envelopeId}
            onEnvelopeUpdated={handleEnvelopeUpdated}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
