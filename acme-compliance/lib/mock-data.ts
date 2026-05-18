export type ModuleStatus = "not-started" | "certified"

export interface TrainingModule {
  id: string
  title: string
  oshaRef: string
  description: string
  duration: string
  videoUrl: string
  keyPoints: string[]
  status: ModuleStatus
  certifiedDate?: string
  expiryDate?: string
}

const trainingVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"

export const modules: TrainingModule[] = [
  {
    id: "fall-protection",
    title: "Fall Protection",
    oshaRef: "OSHA 1926.501",
    description:
      "Comprehensive training on fall protection systems, requirements, and best practices for construction sites. Covers guardrails, safety nets, personal fall arrest systems, and positioning devices.",
    duration: "45 min",
    videoUrl: trainingVideoUrl,
    keyPoints: [
      "Identify fall hazards on construction sites",
      "Select and inspect personal fall arrest systems",
      "Understand guardrail and safety net requirements",
      "Implement rescue procedures for fall incidents",
    ],
    status: "not-started",
  },
  {
    id: "confined-space",
    title: "Confined Space Entry",
    oshaRef: "OSHA 1910.146",
    description:
      "Training on permit-required confined space entry procedures, atmospheric testing, and emergency response. Covers entry permits, attendant duties, and rescue operations.",
    duration: "45 min",
    videoUrl: trainingVideoUrl,
    keyPoints: [
      "Classify confined spaces and identify hazards",
      "Perform atmospheric testing before entry",
      "Follow permit-required entry procedures",
      "Execute emergency rescue operations",
    ],
    status: "not-started",
  },
  {
    id: "hazard-communication",
    title: "Hazard Communication",
    oshaRef: "OSHA 1910.1200",
    description:
      "Understanding chemical hazards in the workplace, Safety Data Sheets (SDS), and the Globally Harmonized System (GHS) of classification and labeling.",
    duration: "45 min",
    videoUrl: trainingVideoUrl,
    keyPoints: [
      "Read and interpret Safety Data Sheets (SDS)",
      "Identify GHS pictograms and hazard categories",
      "Handle and store hazardous chemicals safely",
      "Respond to chemical spills and exposures",
    ],
    status: "not-started",
  },
  {
    id: "electrical-safety",
    title: "Electrical Safety",
    oshaRef: "OSHA 1910.303",
    description:
      "Electrical safety fundamentals including lockout/tagout procedures, arc flash protection, and working near energized equipment. Covers NFPA 70E compliance.",
    duration: "45 min",
    videoUrl: trainingVideoUrl,
    keyPoints: [
      "Apply lockout/tagout procedures correctly",
      "Identify electrical hazards and shock risks",
      "Select appropriate PPE for electrical work",
      "Understand arc flash boundaries and protection",
    ],
    status: "not-started",
  },
]

export function getModule(id: string): TrainingModule | undefined {
  return modules.find((m) => m.id === id)
}
