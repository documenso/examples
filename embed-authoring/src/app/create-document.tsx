"use client";

import { ReactNode, useState } from "react";
import { Upload } from "lucide-react";

import { unstable_EmbedCreateDocument as EmbedCreateDocument } from "@documenso/embed-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CreateDocumentProps = {
  presignToken: string;
  host?: string;
  trigger?: ReactNode;
  buttonText?: string;
};

export const CreateDocument = ({
  presignToken,
  host,
  trigger,
  buttonText = "Upload Document",
}: CreateDocumentProps) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleDocumentCreated = () => {
    setOpen(false);

    toast.success("Document created successfully");
    router.refresh();
  };

  const defaultTrigger = (
    <Button>
      <Upload className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-5xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>

        <div key={open ? "open" : "closed"} className="-mx-4 -mt-6">
          <EmbedCreateDocument
            className="h-[80dvh] w-full"
            host={host}
            presignToken={presignToken}
            onDocumentCreated={handleDocumentCreated}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
