import { Documenso } from "@documenso/sdk-typescript"

const apiKey = process.env.DOCUMENSO_API_KEY ?? ""
const normalizedHost = process.env.DOCUMENSO_HOST?.replace(/\/+$/, "")
const serverURL = normalizedHost
  ? `${normalizedHost}/api/v2`
  : undefined

export const documenso = new Documenso({ apiKey, serverURL })
