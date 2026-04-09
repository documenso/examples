import { headers } from "next/headers"

export async function getBaseUrl() {
  const requestHeaders = await headers()
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http"
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")

  if (!host) {
    throw new Error("Unable to determine request host")
  }

  return `${protocol}://${host}`
}
