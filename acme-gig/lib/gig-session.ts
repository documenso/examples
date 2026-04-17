import {
  GigSessionStatus,
  type GigSession,
} from "@prisma/client"

type DocumensoRecipient = {
  id: number
  email: string
  signingStatus: string
  signedAt: string | null
}

type DocumensoStatusSource = {
  status?: string | null
  completedAt?: string | null
  recipients?: DocumensoRecipient[] | null
  Recipient?: DocumensoRecipient[] | null
}

export const GIG_CREATOR_EMAIL = "jordan@acmegig.demo"

export function buildGigSessionSyncData(
  session: Pick<
    GigSession,
    | "clientEmail"
    | "creatorEmail"
    | "clientRecipientId"
    | "creatorRecipientId"
  >,
  source: DocumensoStatusSource
) {
  const recipients = source.recipients ?? source.Recipient ?? []
  const clientRecipient = findRecipient(
    recipients,
    session.clientRecipientId,
    session.clientEmail
  )
  const creatorRecipient = findRecipient(
    recipients,
    session.creatorRecipientId,
    session.creatorEmail
  )

  if (!clientRecipient || !creatorRecipient) {
    throw new Error("Unable to map Documenso recipients to the AcmeGig session.")
  }

  const clientSigned = clientRecipient.signingStatus === "SIGNED"
  const creatorSigned = creatorRecipient.signingStatus === "SIGNED"
  const rejected =
    source.status === "REJECTED" ||
    clientRecipient.signingStatus === "REJECTED" ||
    creatorRecipient.signingStatus === "REJECTED"

  const status = rejected
    ? GigSessionStatus.REJECTED
    : clientSigned && creatorSigned
      ? GigSessionStatus.COMPLETED
      : clientSigned
        ? GigSessionStatus.PENDING_CREATOR
        : GigSessionStatus.PENDING_CLIENT

  return {
    clientSigned,
    creatorSigned,
    clientSignedAt: parseSignedAt(clientRecipient.signedAt),
    creatorSignedAt: parseSignedAt(creatorRecipient.signedAt),
    status,
    completedAt:
      status === GigSessionStatus.COMPLETED
        ? parseSignedAt(source.completedAt) ??
          parseSignedAt(creatorRecipient.signedAt)
        : null,
  }
}

export function serializeGigSession(session: GigSession) {
  const step =
    session.status === GigSessionStatus.COMPLETED
      ? "complete"
      : session.status === GigSessionStatus.REJECTED
        ? "rejected"
        : session.clientSigned
          ? "creator-pending"
          : "client-sign"

  const activeSigner =
    session.status === GigSessionStatus.PENDING_CLIENT
      ? "client"
      : session.status === GigSessionStatus.PENDING_CREATOR
        ? "creator"
        : null

  const activeToken =
    activeSigner === "client"
      ? session.clientToken
      : activeSigner === "creator"
        ? session.creatorToken
        : null

  return {
    id: session.id,
    clientName: session.clientName,
    creatorName: session.creatorName,
    deliverables: session.deliverables,
    deadline: session.deadline,
    budget: session.budget,
    usageRights: session.usageRights,
    clientSigned: session.clientSigned,
    creatorSigned: session.creatorSigned,
    status: session.status,
    step,
    activeSigner,
    activeToken,
    completedAt: session.completedAt?.toISOString() ?? null,
  }
}

function findRecipient(
  recipients: DocumensoRecipient[],
  recipientId: number | null,
  email: string
) {
  if (recipientId !== null) {
    const matchedById = recipients.find((recipient) => recipient.id === recipientId)

    if (matchedById) {
      return matchedById
    }
  }

  const normalizedEmail = email.trim().toLowerCase()

  return (
    recipients.find(
      (recipient) => recipient.email.trim().toLowerCase() === normalizedEmail
    ) ?? null
  )
}

function parseSignedAt(value: string | null | undefined) {
  return value ? new Date(value) : null
}
