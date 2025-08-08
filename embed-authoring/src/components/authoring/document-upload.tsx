"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Remove when the update to the next version of the embeds is published
import { unstable_EmbedCreateDocument as EmbedCreateDocument } from "../../../packages/react";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";

interface DocumentUploadProps {
  host: string;
  presignToken: string;
}

export function DocumentUpload({ host, presignToken }: DocumentUploadProps) {
  const router = useRouter();

  const handleDocumentCreated = () => {
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
            <EmbedCreateDocument
              className="h-[1450px] w-full"
              host={host}
              presignToken={presignToken}
              darkModeDisabled={true}
              onDocumentCreated={handleDocumentCreated}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
