import { documenso } from "./documenso";

export const createPresignToken = async () => {
  const response = await documenso.embedding.embeddingPresignCreateEmbeddingPresignToken({});
  return response.token;
};
