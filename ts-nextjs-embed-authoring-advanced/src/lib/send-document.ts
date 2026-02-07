import { documenso } from "./documenso";

export const sendDocument = async (documentId: number): Promise<void> => {
  await documenso.documents.distribute({ documentId });
};
