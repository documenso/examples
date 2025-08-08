"use client";

import { useState } from "react";
import { FileText, Clock, CheckCircle, Users, Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SendDocumentButton } from "@/components/authoring/send-document-button";
import { unstable_EmbedUpdateDocument as EmbedUpdateDocument } from "@documenso/embed-react";
import { toast } from "@/components/ui/sonner";
import { X } from "lucide-react";
import type { DocumentsResponse } from "@/lib/find-documents";
import { useRouter } from "next/navigation";

interface DocumentDashboardProps {
  documents: DocumentsResponse["data"];
  stats: {
    total: number;
    pending: number;
    completed: number;
    draft: number;
  };
  host: string;
  presignToken: string;
  sendDocument: (documentId: number) => Promise<void>;
}

export function DocumentDashboard({
  documents,
  stats,
  host,
  presignToken,
  sendDocument,
}: DocumentDashboardProps) {
  const router = useRouter();
  const [editingDocument, setEditingDocument] = useState<
    DocumentsResponse["data"][0] | null
  >(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200">
            Draft
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDocumentType = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("contract") || lowerTitle.includes("employment"))
      return "Employment Contract";
    if (lowerTitle.includes("nda") || lowerTitle.includes("disclosure"))
      return "Non-Disclosure Agreement";
    if (lowerTitle.includes("w-4") || lowerTitle.includes("tax"))
      return "Tax Form";
    if (lowerTitle.includes("i-9")) return "I-9 Form";
    if (lowerTitle.includes("handbook")) return "Employee Handbook";
    if (lowerTitle.includes("benefits")) return "Benefits Enrollment";
    return "Document";
  };

  const getRecipientInfo = (document: DocumentsResponse["data"][0]) => {
    const recipient =
      document.recipients.find((r) => r.role === "SIGNER") ||
      document.recipients[0];
    return recipient ? { name: recipient.name, email: recipient.email } : null;
  };

  const recentDocuments = [...documents]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  const handleDocumentUpdated = () => {
    toast.success("Document updated successfully");
    router.refresh();
    setEditingDocument(null);
  };

  if (editingDocument) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Edit: {editingDocument.title}</span>
              </CardTitle>
              <CardDescription>
                Update document fields and recipients
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingDocument(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <EmbedUpdateDocument
              className="h-[1220px] w-full"
              host={host}
              presignToken={presignToken}
              documentId={editingDocument.id}
              darkModeDisabled={true}
              onDocumentUpdated={handleDocumentUpdated}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draft} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Signatures
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.completed / stats.total) * 100)}% completion rate`
                : "0% completion rate"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                documents.filter((d) => {
                  const created = new Date(d.createdAt);
                  const now = new Date();
                  return (
                    created.getMonth() === now.getMonth() &&
                    created.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Document Activity</CardTitle>
          <CardDescription>
            Track the status of documents sent for signature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => {
                const recipientInfo = getRecipientInfo(doc);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {doc.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {getDocumentType(doc.title)} •{" "}
                          {recipientInfo?.email || "No recipients"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(doc.status)}
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {doc.status === "COMPLETED" && doc.completedAt
                            ? `Completed ${new Date(doc.completedAt).toLocaleDateString()}`
                            : `Updated ${new Date(doc.updatedAt).toLocaleDateString()}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === "DRAFT" ? (
                          <>
                            <SendDocumentButton
                              documentId={doc.id}
                              sendDocument={sendDocument}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingDocument(doc)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/?tab=preview&documentId=${doc.id}`
                                )
                              }
                            >
                              {doc.status === "PENDING" ? "Sign" : "Preview"}
                            </Button>
                            {doc.status !== "COMPLETED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingDocument(doc)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No documents yet. Start by uploading your first document.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
