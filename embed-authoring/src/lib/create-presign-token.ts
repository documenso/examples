export const createPresignToken = async (host: string) => {
  const response = await fetch(
    `${host}/api/v2-beta/embedding/create-presign-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DOCUMENSO_API_KEY}`,
      },
      body: JSON.stringify({}),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to create presign token");
  }

  return data.token;
};
