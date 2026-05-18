export type ParticipantStatus = "consented" | "pending" | "screening"

export interface Participant {
  id: string
  name: string
  dob: string
  sex: string
  site: string
  protocolVersion: string
  status: ParticipantStatus
  consentDate: string | null
  randomizationStatus: string
  visitSchedule: string
}

export const STUDY = {
  id: "CR-2026-041",
  title: "Phase III, Cardio-Renal Study",
  protocolVersion: "v3.2",
  phase: "Phase III",
  sponsor: "Acme Therapeutics",
  indication: "Chronic Kidney Disease with Cardiac Comorbidity",
}

export const participants: Participant[] = [
  {
    id: "PRT-001",
    name: "Maria Santos",
    dob: "1968-03-15",
    sex: "Female",
    site: "Boston Medical",
    protocolVersion: "v3.2",
    status: "consented",
    consentDate: "2026-03-15",
    randomizationStatus: "Randomized — Arm A",
    visitSchedule: "Visit 3 — Week 4 (Apr 12, 2026)",
  },
  {
    id: "PRT-002",
    name: "James O'Brien",
    dob: "1972-08-22",
    sex: "Male",
    site: "Boston Medical",
    protocolVersion: "v3.2",
    status: "pending",
    consentDate: null,
    randomizationStatus: "Not Randomized",
    visitSchedule: "Screening Visit (Pending Consent)",
  },
  {
    id: "PRT-003",
    name: "Aisha Patel",
    dob: "1955-11-03",
    sex: "Female",
    site: "Cleveland Clinic",
    protocolVersion: "v3.2",
    status: "screening",
    consentDate: null,
    randomizationStatus: "Not Randomized",
    visitSchedule: "Pre-Screening Assessment",
  },
  {
    id: "PRT-004",
    name: "Robert Kim",
    dob: "1960-06-30",
    sex: "Male",
    site: "Mayo Rochester",
    protocolVersion: "v3.2",
    status: "consented",
    consentDate: "2026-03-18",
    randomizationStatus: "Randomized — Arm B",
    visitSchedule: "Visit 2 — Week 2 (Apr 1, 2026)",
  },
]

export function getParticipant(id: string): Participant | undefined {
  return participants.find((p) => p.id === id)
}

