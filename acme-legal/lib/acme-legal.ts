import type { TemplateGetTemplateByIdResponse } from "@documenso/sdk-typescript/models/operations"
import { MATTER_TYPES, type MatterType } from "@/lib/mock-data"

export const FIRM_NAME = "AcmeLegal LLP"
export const INTAKE_STORAGE_KEY = "acme-legal:intake"

export const HOURLY_RATES: Record<MatterType, number> = {
  "Business Formation": 425,
  "Contract Dispute": 575,
  "IP Protection": 625,
  "Employment Law": 450,
  "Real Estate": 395,
}

export interface IntakePayload {
  name: string
  email: string
  matterType: MatterType
  description: string
}

export interface EngagementTemplateFields {
  clientRecipientId?: number
  attorneyRecipientId?: number
  engagementDateFieldId?: number
  matterTypeFieldId?: number
  matterDescriptionFieldId?: number
  retainerAmountFieldId?: number
  hourlyRateFieldId?: number
}

const FIELD_LABELS = {
  engagementDate: "Engagement Date",
  matterType: "Matter Type",
  matterDescription: "Matter Description",
  retainerAmount: "Retainer Amount",
  hourlyRate: "Hourly Rate",
} as const

export function isMatterType(value: string): value is MatterType {
  return MATTER_TYPES.includes(value as MatterType)
}

export function formatMatterDescription({
  matterType,
  description,
}: Pick<IntakePayload, "matterType" | "description">) {
  const normalizedDescription = description.trim()

  if (!normalizedDescription) {
    return matterType
  }

  return normalizedDescription
}

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export function getEngagementTemplateFields(
  template: TemplateGetTemplateByIdResponse
): EngagementTemplateFields {
  const signers = template.recipients
    .filter((recipient) => recipient.role === "SIGNER")
    .sort(
      (left, right) => (left.signingOrder ?? Number.MAX_SAFE_INTEGER) - (right.signingOrder ?? Number.MAX_SAFE_INTEGER)
    )

  const clientRecipient = signers[0]
  const attorneyRecipient = signers[1]

  const findFieldIdByLabel = (label: string) =>
    template.fields.find((field) => field.fieldMeta?.label === label)?.id

  const numberFields = template.fields
    .filter((field) => field.fieldMeta?.type === "number")
    .sort((left, right) => Number(left.positionY ?? 0) - Number(right.positionY ?? 0))

  return {
    clientRecipientId: clientRecipient?.id,
    attorneyRecipientId: attorneyRecipient?.id,
    engagementDateFieldId:
      findFieldIdByLabel(FIELD_LABELS.engagementDate) ??
      template.fields.find(
        (field) =>
          field.fieldMeta?.type === "text" &&
          field.page === 1 &&
          Number(field.positionY ?? 0) < 20
      )?.id,
    matterTypeFieldId:
      findFieldIdByLabel(FIELD_LABELS.matterType) ??
      template.fields.find(
        (field) =>
          field.fieldMeta?.type === "text" &&
          field.page === 1 &&
          Number(field.positionY ?? 0) >= 14 &&
          Number(field.positionY ?? 0) <= 18
      )?.id,
    matterDescriptionFieldId:
      findFieldIdByLabel(FIELD_LABELS.matterDescription) ??
      template.fields.find(
        (field) =>
          field.fieldMeta?.type === "text" &&
          field.page === 1 &&
          Number(field.positionY ?? 0) >= 38 &&
          Number(field.positionY ?? 0) <= 46
      )?.id,
    retainerAmountFieldId:
      findFieldIdByLabel(FIELD_LABELS.retainerAmount) ?? numberFields[0]?.id,
    hourlyRateFieldId:
      findFieldIdByLabel(FIELD_LABELS.hourlyRate) ?? numberFields[1]?.id,
  }
}

export function createEngagementDocumentTitle({
  name,
  matterType,
}: Pick<IntakePayload, "name" | "matterType">) {
  return `Engagement Letter - ${name} - ${matterType}`
}
