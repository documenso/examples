export const createPresignToken = async (host: string) => {
  const response = await fetch(
    `${host}/api/v2-beta/embedding/create-presign-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DOCUMENSO_API_KEY}`,
      },
      body: JSON.stringify({
        expiresIn: 3600,
      }),
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    try {
      const errorData = JSON.parse(responseText);
      console.error("API Error:", errorData);
      throw new Error(errorData.message || "Failed to create presign token");
    } catch {
      console.error("Failed to parse error response:", responseText);
      throw new Error("Failed to create presign token");
    }
  }

  const data = JSON.parse(responseText);
  return data.token;
};
