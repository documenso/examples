import { documenso } from "./documenso";

type Recipient = {
  email: string;
  name: string;
  role: "CC" | "SIGNER" | "VIEWER" | "APPROVER" | "ASSISTANT";
  signingStatus: "NOT_SIGNED" | "SIGNED" | "REJECTED";
  token?: string;
  signedAt?: string | null;
};

type Document = {
  id: number;
  title: string;
  status: "DRAFT" | "PENDING" | "COMPLETED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  recipients: Recipient[];
};

export type DocumentsResponse = {
  data: Document[];
  count: number;
};

export const findDocuments = async () => {
  const response = await documenso.documents.find({});

  const data: Document[] = response.data.map((doc) => ({
    id: doc.id,
    title: doc.title,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    completedAt: doc.completedAt,
    recipients: doc.recipients.map((recipient) => ({
      email: recipient.email,
      name: recipient.name,
      role: recipient.role,
      signingStatus: recipient.signingStatus,
      token: recipient.token,
      signedAt: recipient.signedAt,
    })),
  }));

  return {
    data,
    count: response.count,
  };
};
