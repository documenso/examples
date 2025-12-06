import { FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { findDocuments } from "@/lib/find-documents";
import { createPresignToken } from "@/lib/create-presign-token";
import { AuthoringTabs } from "@/components/authoring/authoring-tabs";
import { getDocument } from "@/lib/get-document";
import { sendDocument } from "@/lib/send-document";

async function getDocumentUrlAction(documentId: number): Promise<string> {
  "use server";
  return await getDocument(documentId);
}

async function sendDocumentAction(documentId: number): Promise<void> {
  "use server";
  return await sendDocument(documentId);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; documentId?: string }>;
}) {
  const params = await searchParams;
  const host = process.env.DOCUMENSO_HOST || "https://app.documenso.com";
  const presignToken = await createPresignToken();
  const { data: documents, count } = await findDocuments();

  const stats = {
    total: count,
    pending: documents.filter((d) => d.status === "PENDING").length,
    completed: documents.filter((d) => d.status === "COMPLETED").length,
    draft: documents.filter((d) => d.status === "DRAFT").length,
  };

  const selectedDocument = params.documentId
    ? documents.find((d) => d.id === Number(params.documentId)) || null
    : documents[0] || null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">Acme</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>HR</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">Duncan</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AuthoringTabs
          documents={documents}
          stats={stats}
          selectedDocument={selectedDocument}
          host={host}
          presignToken={presignToken}
          getDocumentUrl={getDocumentUrlAction}
          sendDocument={sendDocumentAction}
          initialTab={params.tab || "dashboard"}
        />
      </div>
    </div>
  );
}
