import { documenso } from "./documenso";

export const getDocument = async (envelopeId: string) => {
  const envelope = await documenso.envelopes.get({ envelopeId });
  const envelopeItemId = envelope.envelopeItems[0]?.id;

  if (!envelopeItemId) {
    throw new Error("No document file found for envelope");
  }

  const response = await documenso.envelopes.items.download({
    envelopeItemId,
    version: "signed",
  });
  const downloadUrl = response.result?.downloadUrl;

  if (typeof downloadUrl !== "string") {
    throw new Error("Failed to get document download URL");
  }

  return downloadUrl;
};
