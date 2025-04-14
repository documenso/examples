type Recipient = {
  email: string;
  name: string;
  role: "CC" | "SIGNER" | "VIEWER" | "APPROVER" | "ASSISTANT";
  signingStatus: "NOT_SIGNED" | "SIGNED" | "REJECTED";
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

export const findDocuments = async (host: string) => {
  const response = await fetch(`${host}/api/v2-beta/document`, {
    headers: {
      Authorization: process.env.DOCUMENSO_API_KEY || "",
    },
  });

  const data = await response.json();

  return data as DocumentsResponse;
};
