type TemplateField = {
  id: number
  type: string
  customText: string
  page?: number | string | null
  positionX?: number | string | null
  positionY?: number | string | null
  fieldMeta?: {
    type?: string
    label?: string
    placeholder?: string
  } | null
}

type LoanAgreementFieldKey =
  | "borrowerName"
  | "businessName"
  | "loanAmount"
  | "apr"
  | "term"
  | "monthlyPayment"
  | "loanPurpose"

type LoanAgreementValues = Record<LoanAgreementFieldKey, string>
type LoanAgreementPrefillField =
  | { id: number; type: "text"; value: string }
  | { id: number; type: "number"; value: string }

const FIELD_CANDIDATES: Record<LoanAgreementFieldKey, string[]> = {
  borrowerName: ["borrower name"],
  businessName: ["business name"],
  loanAmount: ["loan amount"],
  apr: ["annual percentage rate (apr)", "annual percentage rate", "apr"],
  term: ["loan term", "term"],
  monthlyPayment: ["monthly payment"],
  loanPurpose: ["loan purpose", "purpose"],
}

const FORM_VALUE_KEYS: Record<LoanAgreementFieldKey, string[]> = {
  borrowerName: ["Borrower Name"],
  businessName: ["Business Name"],
  loanAmount: ["Loan Amount"],
  apr: ["Annual Percentage Rate (APR)", "APR"],
  term: ["Loan Term", "Term"],
  monthlyPayment: ["Monthly Payment"],
  loanPurpose: ["Loan Purpose", "Purpose"],
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function getFieldTexts(field: TemplateField) {
  return [
    field.fieldMeta?.label,
    field.fieldMeta?.placeholder,
    field.customText,
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalize)
}

function resolveFieldKey(field: TemplateField): LoanAgreementFieldKey | null {
  const texts = getFieldTexts(field)

  for (const [key, candidates] of Object.entries(FIELD_CANDIDATES) as Array<
    [LoanAgreementFieldKey, string[]]
  >) {
    if (texts.some((text) => candidates.some((candidate) => text.includes(candidate)))) {
      return key
    }
  }

  return null
}

function resolvePrefillType(field: TemplateField): LoanAgreementPrefillField["type"] | null {
  const type = (field.fieldMeta?.type ?? field.type).toLowerCase()

  if (type === "text" || type === "number") {
    return type
  }

  return null
}

function sortByDocumentOrder(fields: TemplateField[]) {
  return [...fields].sort((a, b) => {
    const pageDiff = Number(a.page ?? 0) - Number(b.page ?? 0)
    if (pageDiff !== 0) return pageDiff

    const yDiff = Number(a.positionY ?? 0) - Number(b.positionY ?? 0)
    if (yDiff !== 0) return yDiff

    const xDiff = Number(a.positionX ?? 0) - Number(b.positionX ?? 0)
    if (xDiff !== 0) return xDiff

    return a.id - b.id
  })
}

export function buildLoanAgreementPrefill(
  fields: TemplateField[],
  values: LoanAgreementValues,
) {
  const keyToField = new Map<LoanAgreementFieldKey, TemplateField>()
  const prefillFields: LoanAgreementPrefillField[] = []

  for (const field of fields) {
    const fieldKey = resolveFieldKey(field)

    if (!fieldKey || keyToField.has(fieldKey)) {
      continue
    }

    keyToField.set(fieldKey, field)
  }

  const unresolvedTextFields = sortByDocumentOrder(
    fields.filter((field) => {
      const type = (field.fieldMeta?.type ?? field.type).toLowerCase()

      return type === "text" && ![...keyToField.values()].includes(field)
    }),
  )

  const unresolvedNumberFields = sortByDocumentOrder(
    fields.filter((field) => {
      const type = (field.fieldMeta?.type ?? field.type).toLowerCase()

      return type === "number" && ![...keyToField.values()].includes(field)
    }),
  )

  const fallbackAssignments: Array<[LoanAgreementFieldKey, TemplateField | undefined]> = [
    ["borrowerName", unresolvedTextFields[0]],
    ["businessName", unresolvedTextFields[1]],
    ["term", unresolvedTextFields[2]],
    ["loanPurpose", unresolvedTextFields[3]],
    ["loanAmount", unresolvedNumberFields[0]],
    ["apr", unresolvedNumberFields[1]],
    ["monthlyPayment", unresolvedNumberFields[2]],
  ]

  for (const [fieldKey, field] of fallbackAssignments) {
    if (field && !keyToField.has(fieldKey)) {
      keyToField.set(fieldKey, field)
    }
  }

  for (const [fieldKey, field] of keyToField.entries()) {
    const prefillType = resolvePrefillType(field)

    if (!prefillType) {
      continue
    }

    prefillFields.push({
      id: field.id,
      type: prefillType,
      value: values[fieldKey],
    })
  }

  const formValues = Object.fromEntries(
    Object.entries(FORM_VALUE_KEYS).flatMap(([fieldKey, aliases]) =>
      aliases.map((alias) => [alias, values[fieldKey as LoanAgreementFieldKey]]),
    ),
  )

  return {
    prefillFields,
    formValues,
  }
}
