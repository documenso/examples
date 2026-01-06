import { documenso } from "./documenso";

export const createPresignToken = async () => {
  const response = await documenso.embedding.embeddingPresignCreateEmbeddingPresignToken({
    expiresIn: 3600,
  });
  return response.token;
};
