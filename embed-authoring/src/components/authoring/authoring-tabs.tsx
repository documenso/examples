"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUpload } from "./document-upload";
import { DocumentPreview } from "./document-preview";
import { DocumentDashboard } from "./document-dashboard";
import type { DocumentsResponse } from "@/lib/find-documents";

interface AuthoringTabsProps {
  documents: DocumentsResponse["data"];
  stats: {
    total: number;
    pending: number;
    completed: number;
    draft: number;
  };
  selectedDocument: DocumentsResponse["data"][0] | null;
  host: string;
  presignToken: string;
  getDocumentUrl: (documentId: number) => Promise<string>;
  sendDocument: (documentId: number) => Promise<void>;
  initialTab: string;
}

export function AuthoringTabs({
  documents,
  stats,
  selectedDocument,
  host,
  presignToken,
  getDocumentUrl,
  sendDocument,
  initialTab,
}: AuthoringTabsProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab") || "dashboard";
    setActiveTab(tab);
  }, [searchParams]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard" className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Dashboard</span>
        </TabsTrigger>
        <TabsTrigger value="upload" className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Documents</span>
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Document Preview</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
        <DocumentDashboard
          documents={documents}
          stats={stats}
          host={host}
          presignToken={presignToken}
          sendDocument={sendDocument}
        />
      </TabsContent>

      <TabsContent value="upload">
        <DocumentUpload host={host} presignToken={presignToken} />
      </TabsContent>

      <TabsContent value="preview">
        <DocumentPreview
          selectedDocument={selectedDocument}
          documents={documents}
          host={host}
          presignToken={presignToken}
          getDocumentUrl={getDocumentUrl}
        />
      </TabsContent>
    </Tabs>
  );
}
