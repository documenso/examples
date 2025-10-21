export const getDocument = async (host: string, documentId: number) => {
  const response = await fetch(
    `${host}/api/v1/documents/${documentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DOCUMENSO_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get document: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  return data.downloadUrl;
};
