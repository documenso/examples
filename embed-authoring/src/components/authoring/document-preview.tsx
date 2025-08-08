"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  User,
  Calendar,
  Mail,
  CheckCircle,
  Edit,
  Download,
} from "lucide-react";
import type { DocumentsResponse } from "@/lib/find-documents";
import { EmbedSignDocument } from "@documenso/embed-react";
import { unstable_EmbedUpdateDocument as EmbedUpdateDocument } from "@documenso/embed-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";

interface DocumentPreviewProps {
  selectedDocument: DocumentsResponse["data"][0] | null;
  documents: DocumentsResponse["data"];
  host: string;
  presignToken: string;
  getDocumentUrl: (documentId: number) => Promise<string>;
}

export function DocumentPreview({
  selectedDocument,
  documents,
  host,
  presignToken,
  getDocumentUrl,
}: DocumentPreviewProps) {
  const router = useRouter();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [recipientToken, setRecipientToken] = useState<string | null>(null);

  const displayDocument = selectedDocument || documents[0];

  useEffect(() => {
    if (displayDocument) {
      setDocumentUrl(null);

      if (displayDocument.status === "COMPLETED") {
        getDocumentUrl(displayDocument.id)
          .then((url) => {
            setDocumentUrl(url);
          })
          .catch((error) => {
            toast.error(`Failed to load document preview: ${error.message}`);
          });
      }

      if (displayDocument.status === "PENDING") {
        const signer = displayDocument.recipients.find(
          (r) => r.role === "SIGNER"
        );
        if (signer?.token) {
          setRecipientToken(signer.token);
        }
      }
    }
  }, [displayDocument, getDocumentUrl]);

  const handleDocumentUpdated = () => {
    toast.success("Document updated successfully");
    router.refresh();
    setShowEdit(false);
  };

  const getRecipientInfo = (document: DocumentsResponse["data"][0]) => {
    const recipient =
      document.recipients.find((r) => r.role === "SIGNER") ||
      document.recipients[0];
    return recipient;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!displayDocument) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-2">
            <FileText className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold">No Documents</h3>
            <p className="text-gray-600">Upload a document to get started</p>
            <p className="text-xs text-gray-500 mt-2">
              Total documents available: {documents.length}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recipientInfo = getRecipientInfo(displayDocument);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{displayDocument.title}</span>
              </CardTitle>
              <CardDescription>
                Document details and status information
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  displayDocument.status === "COMPLETED"
                    ? "default"
                    : displayDocument.status === "PENDING"
                      ? "secondary"
                      : "outline"
                }
              >
                {displayDocument.status === "PENDING" && (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {displayDocument.status === "COMPLETED" && (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                {displayDocument.status}
              </Badge>
              {displayDocument.status === "DRAFT" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEdit(!showEdit)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {showEdit ? "Hide Edit" : "Edit Document"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {recipientInfo?.name || "No recipient"}
                </p>
                <p className="text-sm text-gray-500">{recipientInfo?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-500">
                  {formatDate(displayDocument.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Status</p>
                <p className="text-sm text-gray-500 capitalize">
                  {displayDocument.status.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {displayDocument.status === "PENDING" && recipientToken ? (
        <Card>
          <CardHeader>
            <CardTitle>Document Signing</CardTitle>
            <CardDescription>
              Sign the document using the embedded signing interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <EmbedSignDocument
                className="h-[900px] w-full"
                host={host}
                token={recipientToken}
                darkModeDisabled={true}
                onDocumentCompleted={() => {
                  window.location.reload();
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : showEdit && displayDocument.status === "DRAFT" ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Document</CardTitle>
            <CardDescription>
              Update document fields and recipients before sending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <EmbedUpdateDocument
                className="h-[600px] w-full"
                host={host}
                presignToken={presignToken}
                documentId={displayDocument.id}
                darkModeDisabled={true}
                onDocumentUpdated={handleDocumentUpdated}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Document Preview</CardTitle>
                <CardDescription>
                  View the document content inline
                </CardDescription>
              </div>
              {documentUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {documentUrl ? (
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <embed
                  type="application/pdf"
                  src={documentUrl}
                  className="w-full h-[800px] border-0"
                  title={displayDocument.title}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center space-y-3">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                  {displayDocument.status === "COMPLETED" ? (
                    <>
                      <p className="text-gray-600 font-medium">
                        Loading document preview...
                      </p>
                      <p className="text-sm text-gray-500">
                        Please wait while we fetch the PDF
                      </p>
                    </>
                  ) : displayDocument.status === "PENDING" ? (
                    <>
                      <p className="text-gray-600 font-medium">
                        Document Preview Not Available
                      </p>
                      <p className="text-sm text-gray-500">
                        This document is pending signature and cannot be
                        previewed yet
                      </p>
                      <p className="text-xs text-gray-400">
                        Use the signing interface above to complete the document
                      </p>
                    </>
                  ) : displayDocument.status === "DRAFT" ? (
                    <>
                      <p className="text-gray-600 font-medium">
                        Document Preview Not Available
                      </p>
                      <p className="text-sm text-gray-500">
                        This document is still in draft status
                      </p>
                      <p className="text-xs text-gray-400">
                        Complete editing and send for signature to enable
                        preview
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 font-medium">
                        Document Preview Not Available
                      </p>
                      <p className="text-sm text-gray-500">
                        Preview is only available for completed documents
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
