export const DEAL_NAME = "Project Alpine"
export const DEAL_HEADLINE = "Project Alpine (Confidential)."
export const DEAL_ACCESS_COPY = "Sign NDA to access"

export const REQUIRED_TEMPLATE_FIELDS = {
  receivingPartyName: {
    label: "Receiving Party Name",
    fieldType: "name",
  },
  dealName: {
    label: "Deal Name",
    fieldType: "text",
  },
  effectiveDate: {
    label: "Effective Date",
    fieldType: "date",
  },
} as const

export const NDA_TEMPLATE_REPAIR = {
  labeledFieldUpdates: [
    {
      id: 145916,
      type: "NAME",
      fieldType: REQUIRED_TEMPLATE_FIELDS.receivingPartyName.fieldType,
      label: REQUIRED_TEMPLATE_FIELDS.receivingPartyName.label,
    },
    {
      id: 145919,
      type: "TEXT",
      fieldType: REQUIRED_TEMPLATE_FIELDS.dealName.fieldType,
      label: REQUIRED_TEMPLATE_FIELDS.dealName.label,
    },
    {
      id: 145917,
      type: "DATE",
      fieldType: REQUIRED_TEMPLATE_FIELDS.effectiveDate.fieldType,
      label: REQUIRED_TEMPLATE_FIELDS.effectiveDate.label,
    },
  ],
  disclosingFieldIds: [145918, 145920, 145924, 145925, 145926],
  disclosingRecipientId: 27934,
} as const

export type DataRoomFile = {
  title: string
  type: "PDF" | "CSV"
  sizeLabel: string
  updatedAt: string
  description: string
  href: string
}

export const DATA_ROOM_FILES: DataRoomFile[] = [
  {
    title: "Project Alpine CIM",
    type: "PDF",
    sizeLabel: "0.2 MB",
    updatedAt: "Apr 8, 2026",
    description:
      "Executive overview, investment highlights, market positioning, and transaction rationale.",
    href: "/data-room/project-alpine-cim.pdf",
  },
  {
    title: "Project Alpine Historical Financials",
    type: "CSV",
    sizeLabel: "0.01 MB",
    updatedAt: "Apr 8, 2026",
    description:
      "Illustrative revenue, EBITDA, cash flow, and customer concentration metrics for diligence review.",
    href: "/data-room/project-alpine-financials.csv",
  },
  {
    title: "Project Alpine Management Overview",
    type: "PDF",
    sizeLabel: "0.1 MB",
    updatedAt: "Apr 8, 2026",
    description:
      "Management notes covering product mix, customer base, and growth priorities.",
    href: "/data-room/project-alpine-management-overview.pdf",
  },
]

export function normalizeFieldLabel(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? ""
}

export function getEffectiveDateValue(date = new Date()) {
  return date.toISOString().slice(0, 10)
}
