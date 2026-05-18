"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmbedCreateEnvelopeV2 } from "@documenso/embed-react";
import { embedCssVars } from "@/lib/embed-css-vars";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";

interface DocumentUploadProps {
  host: string;
  presignToken: string;
}

export function DocumentUpload({ host, presignToken }: DocumentUploadProps) {
  const router = useRouter();

  const handleEnvelopeCreated = () => {
    toast.success("Document created successfully");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload and Configure Documents</CardTitle>
          <CardDescription>
            Upload documents and configure signing fields directly in this
            interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden">
            <EmbedCreateEnvelopeV2
              className="h-[1450px] w-full"
              host={host}
              presignToken={presignToken}
              type="DOCUMENT"
              darkModeDisabled={true}
              cssVars={embedCssVars}
              onEnvelopeCreated={handleEnvelopeCreated}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
