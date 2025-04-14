export const sendDocument = async (host: string, documentId: number) => {
  const response = await fetch(`${host}/api/v2-beta/document/distribute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DOCUMENSO_API_KEY}`,
    },
    body: JSON.stringify({
      documentId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to send document");
  }

  return data;
};
