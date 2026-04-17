import { documenso } from "./documenso";

export const sendDocument = async (envelopeId: string): Promise<void> => {
  await documenso.envelopes.distribute({ envelopeId });
};
