import type { LucideIcon } from "lucide-react"
import { AlertTriangle, HardHat, Wind, Zap } from "lucide-react"

type Mentor = {
  name: string
  avatarId: number
}

export type ModulePresentation = {
  icon: LucideIcon
  eyebrow: string
  level: string
  mentors: Mentor[]
  coverClassName: string
  accentClassName: string
  badgeClassName: string
}

const presentations: Record<string, ModulePresentation> = {
  "fall-protection": {
    icon: HardHat,
    eyebrow: "Field protection",
    level: "Intermediate",
    mentors: [
      { name: "Mara Ortiz", avatarId: 2 },
      { name: "Eli Hart", avatarId: 6 },
      { name: "Rae Kim", avatarId: 10 },
    ],
    coverClassName: "from-amber-50 via-white to-orange-50",
    accentClassName: "border-amber-200 bg-amber-50 text-amber-900",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-900",
  },
  "confined-space": {
    icon: Wind,
    eyebrow: "Entry procedures",
    level: "Advanced",
    mentors: [
      { name: "Sami Vega", avatarId: 3 },
      { name: "Noa Price", avatarId: 7 },
      { name: "Ian Cole", avatarId: 11 },
    ],
    coverClassName: "from-emerald-50 via-white to-teal-50",
    accentClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  "hazard-communication": {
    icon: AlertTriangle,
    eyebrow: "Chemical communication",
    level: "Core",
    mentors: [
      { name: "Tessa Lane", avatarId: 4 },
      { name: "Milo Park", avatarId: 8 },
      { name: "June Patel", avatarId: 12 },
    ],
    coverClassName: "from-rose-50 via-white to-pink-50",
    accentClassName: "border-rose-200 bg-rose-50 text-rose-900",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-900",
  },
  "electrical-safety": {
    icon: Zap,
    eyebrow: "Live systems",
    level: "Intermediate",
    mentors: [
      { name: "Owen Reed", avatarId: 1 },
      { name: "Ava Sato", avatarId: 5 },
      { name: "Liam Cross", avatarId: 9 },
    ],
    coverClassName: "from-sky-50 via-white to-indigo-50",
    accentClassName: "border-sky-200 bg-sky-50 text-sky-900",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-900",
  },
}

const fallbackPresentation: ModulePresentation = {
  icon: HardHat,
  eyebrow: "Required training",
  level: "Core",
  mentors: [
    { name: "Avery Stone", avatarId: 13 },
    { name: "Rory Bell", avatarId: 14 },
  ],
  coverClassName: "from-neutral-100 via-white to-stone-100",
  accentClassName: "border-neutral-200 bg-neutral-50 text-neutral-900",
  badgeClassName: "border-neutral-200 bg-neutral-50 text-neutral-900",
}

export function getModulePresentation(moduleId: string): ModulePresentation {
  return presentations[moduleId] ?? fallbackPresentation
}
