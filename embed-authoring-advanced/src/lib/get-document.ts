import { documenso } from "./documenso";

export const getDocument = async (documentId: number) => {
  const response = await documenso.documents.download({ documentId });
  return response.downloadUrl;
};
