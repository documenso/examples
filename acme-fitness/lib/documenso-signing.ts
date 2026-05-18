const DEFAULT_DOCUMENSO_HOST = "https://app.documenso.com"

export function getConfiguredDocumensoHost() {
  return process.env.NEXT_PUBLIC_DOCUMENSO_HOST?.trim() || DEFAULT_DOCUMENSO_HOST
}

export function getConfiguredTemplateValue() {
  return process.env.NEXT_PUBLIC_TEMPLATE_TOKEN?.trim() || ""
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function extractDocumensoTemplateToken(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ""
  }

  if (!isHttpUrl(trimmedValue)) {
    return trimmedValue
  }

  const url = new URL(trimmedValue)
  const segments = url.pathname.split("/").filter(Boolean)

  return segments.at(-1) || ""
}

export function resolveDocumensoHost(
  configuredHost: string,
  templateValue: string,
) {
  if (!isHttpUrl(templateValue)) {
    return configuredHost
  }

  return new URL(templateValue).origin
}

export function buildDocumensoDirectUrl(
  configuredHost: string,
  templateValue: string,
) {
  const token = extractDocumensoTemplateToken(templateValue)

  if (!token) {
    return ""
  }

  const host = resolveDocumensoHost(configuredHost, templateValue)

  return new URL(`/d/${token}`, host).toString()
}
