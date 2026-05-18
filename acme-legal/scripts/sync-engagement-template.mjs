import { Documenso } from "@documenso/sdk-typescript"

const FIELD_LABELS = {
  clientHeaderName: "Client Header Name",
  engagementDate: "Engagement Date",
  matterType: "Matter Type",
  matterDescription: "Matter Description",
  clientGreetingName: "Client Greeting Name",
  retainerAmount: "Retainer Amount",
  hourlyRate: "Hourly Rate",
}

const apiKey = process.env.DOCUMENSO_API_KEY
const host = process.env.DOCUMENSO_HOST
const templateId = Number(process.env.DOCUMENSO_TEMPLATE_ENGAGEMENT_LETTER)

if (!apiKey || !host || !templateId) {
  throw new Error("Missing Documenso environment variables.")
}

const documenso = new Documenso({
  apiKey,
  serverURL: `${host}/api/v2`,
})

const template = await documenso.templates.get({ templateId })

const clientRecipient = template.recipients
  .filter((recipient) => recipient.role === "SIGNER")
  .sort(
    (left, right) => (left.signingOrder ?? Number.MAX_SAFE_INTEGER) - (right.signingOrder ?? Number.MAX_SAFE_INTEGER)
  )[0]

if (!clientRecipient) {
  throw new Error("Could not find the client signer on the engagement-letter template.")
}

const findFieldByLabel = (label) =>
  template.fields.find((field) => field.fieldMeta?.label === label)

const numberFields = template.fields
  .filter((field) => field.fieldMeta?.type === "number")
  .sort((left, right) => Number(left.positionY ?? 0) - Number(right.positionY ?? 0))

const greetingNameField = template.fields.find(
  (field) => field.fieldMeta?.type === "name" && field.recipientId === clientRecipient.id
)

const syncExistingFields = []

if (greetingNameField && greetingNameField.fieldMeta?.label !== FIELD_LABELS.clientGreetingName) {
  syncExistingFields.push(
    documenso.templates.fields.update({
      templateId,
      field: {
        type: "NAME",
        id: greetingNameField.id,
        fieldMeta: {
          ...greetingNameField.fieldMeta,
          label: FIELD_LABELS.clientGreetingName,
          readOnly: true,
          type: "name",
        },
      },
    })
  )
}

if (numberFields[0]) {
  syncExistingFields.push(
    documenso.templates.fields.update({
      templateId,
      field: {
        type: "NUMBER",
        id: numberFields[0].id,
        fieldMeta: {
          ...numberFields[0].fieldMeta,
          label: FIELD_LABELS.retainerAmount,
          readOnly: true,
          type: "number",
        },
      },
    })
  )
}

if (numberFields[1]) {
  syncExistingFields.push(
    documenso.templates.fields.update({
      templateId,
      field: {
        type: "NUMBER",
        id: numberFields[1].id,
        fieldMeta: {
          ...numberFields[1].fieldMeta,
          label: FIELD_LABELS.hourlyRate,
          readOnly: true,
          type: "number",
        },
      },
    })
  )
}

await Promise.all(syncExistingFields)

const createField = (label, field) => {
  if (findFieldByLabel(label)) {
    return null
  }

  return documenso.templates.fields.create({
    templateId,
    field,
  })
}

const createdFields = [
  createField(FIELD_LABELS.clientHeaderName, {
    type: "NAME",
    recipientId: clientRecipient.id,
    pageNumber: 1,
    pageX: 11.9,
    pageY: 18.6,
    width: 22,
    height: 2.3,
    fieldMeta: {
      label: FIELD_LABELS.clientHeaderName,
      readOnly: true,
      fontSize: 12,
      type: "name",
      textAlign: "left",
    },
  }),
  createField(FIELD_LABELS.engagementDate, {
    type: "TEXT",
    recipientId: clientRecipient.id,
    pageNumber: 1,
    pageX: 16.8,
    pageY: 12.2,
    width: 20,
    height: 2.1,
    fieldMeta: {
      label: FIELD_LABELS.engagementDate,
      readOnly: true,
      fontSize: 12,
      type: "text",
      textAlign: "left",
    },
  }),
  createField(FIELD_LABELS.matterType, {
    type: "TEXT",
    recipientId: clientRecipient.id,
    pageNumber: 1,
    pageX: 15.2,
    pageY: 15.0,
    width: 30,
    height: 2.1,
    fieldMeta: {
      label: FIELD_LABELS.matterType,
      readOnly: true,
      fontSize: 12,
      type: "text",
      textAlign: "left",
    },
  }),
  createField(FIELD_LABELS.matterDescription, {
    type: "TEXT",
    recipientId: clientRecipient.id,
    pageNumber: 1,
    pageX: 40.6,
    pageY: 40.5,
    width: 24,
    height: 2.3,
    fieldMeta: {
      label: FIELD_LABELS.matterDescription,
      readOnly: true,
      fontSize: 12,
      type: "text",
      textAlign: "left",
    },
  }),
].filter(Boolean)

await Promise.all(createdFields)

const updatedTemplate = await documenso.templates.get({ templateId })

console.log(
  JSON.stringify(
    {
      templateId,
      recipients: updatedTemplate.recipients.map((recipient) => ({
        id: recipient.id,
        name: recipient.name,
        role: recipient.role,
        signingOrder: recipient.signingOrder,
      })),
      fields: updatedTemplate.fields.map((field) => ({
        id: field.id,
        type: field.fieldMeta?.type,
        label: field.fieldMeta?.label ?? null,
        recipientId: field.recipientId,
        page: field.page,
        x: field.positionX,
        y: field.positionY,
      })),
    },
    null,
    2
  )
)
