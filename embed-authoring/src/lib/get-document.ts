export const getDocument = async (host: string, documentId: number) => {
  const response = await fetch(
    `${host}/api/v1/documents/${documentId}/download`,
    {
      headers: {
        Authorization: process.env.DOCUMENSO_API_KEY || "",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get document");
  }

  const data = await response.json();

  return data.downloadUrl;
};
