import { Documenso } from "@documenso/sdk-typescript"

const apiKey = process.env.DOCUMENSO_API_KEY?.trim() ?? ""
const serverURL = process.env.DOCUMENSO_HOST
  ? `${process.env.DOCUMENSO_HOST}/api/v2`
  : undefined

export const documenso = new Documenso({ apiKey, serverURL })

export function getDocumensoConfigurationError() {
  if (!apiKey || apiKey === "your-api-key") {
    return "DOCUMENSO_API_KEY is not configured. Set a real Documenso API key in your local .env file."
  }

  return null
}
