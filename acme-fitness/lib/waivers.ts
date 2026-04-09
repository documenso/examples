import { randomUUID } from "node:crypto"
import { getDb, isDatabaseConfigured } from "@/lib/db"

export type RecentWaiver = {
  id: string
  documentId: string
  memberName: string
  memberEmail: string
  documentTitle: string
  completedAt: string
}

export type RecentWaiversResult = {
  enabled: boolean
  waivers: RecentWaiver[]
}

let ensuredTablePromise: Promise<void> | null = null

async function ensureWaiverTable() {
  if (!isDatabaseConfigured()) {
    return
  }

  if (ensuredTablePromise) {
    return ensuredTablePromise
  }

  const sql = getDb()

  ensuredTablePromise = sql`
    CREATE TABLE IF NOT EXISTS waiver_events (
      id TEXT PRIMARY KEY,
      document_id TEXT UNIQUE NOT NULL,
      member_name TEXT NOT NULL,
      member_email TEXT NOT NULL,
      document_title TEXT NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL,
      source TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
    .then(() => undefined)
    .catch((error) => {
      ensuredTablePromise = null
      throw error
    })

  return ensuredTablePromise
}

export async function insertWaiverEvent(input: {
  documentId: string
  memberName: string
  memberEmail: string
  documentTitle: string
  completedAt: string
  source: string
  payload: unknown
}) {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured")
  }

  await ensureWaiverTable()

  const sql = getDb()

  await sql`
    INSERT INTO waiver_events (
      id,
      document_id,
      member_name,
      member_email,
      document_title,
      completed_at,
      source,
      payload
    )
    VALUES (
      ${randomUUID()},
      ${input.documentId},
      ${input.memberName},
      ${input.memberEmail},
      ${input.documentTitle},
      ${input.completedAt},
      ${input.source},
      ${JSON.stringify(input.payload)}
    )
    ON CONFLICT (document_id) DO NOTHING;
  `
}

export async function getRecentWaivers(
  limit = 10,
): Promise<RecentWaiversResult> {
  if (!isDatabaseConfigured()) {
    return {
      enabled: false,
      waivers: [],
    }
  }

  await ensureWaiverTable()

  const sql = getDb()
  const rows = await sql`
    SELECT
      id,
      document_id AS "documentId",
      member_name AS "memberName",
      member_email AS "memberEmail",
      document_title AS "documentTitle",
      completed_at AS "completedAt"
    FROM waiver_events
    ORDER BY completed_at DESC
    LIMIT ${limit};
  `

  return {
    enabled: true,
    waivers: rows as RecentWaiver[],
  }
}
