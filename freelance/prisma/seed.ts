import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"

// Use Turso adapter for seeding (matches lib/db-turso.ts)
const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const prisma = new PrismaClient({ adapter })

const dummyJobs = [
  {
    id: "1",
    title: "Full-Stack Developer for E-commerce Platform",
    description:
      "We're looking for an experienced full-stack developer to build a modern e-commerce platform with Next.js, React, and Node.js. The project includes user authentication, product management, shopping cart, and payment integration.",
    budget: { min: 5000, max: 8000, type: "fixed" as const },
    duration: "2-3 months",
    skills: ["Next.js", "React", "Node.js", "PostgreSQL", "Stripe"],
    postedBy: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 4.9,
      jobsPosted: 12,
    },
    postedAt: "2024-01-15",
    applicants: 8,
    status: "open" as const,
  },
  {
    id: "2",
    title: "UI/UX Designer for Mobile App",
    description:
      "Seeking a talented UI/UX designer to create a beautiful and intuitive design for our fitness tracking mobile app. Must have experience with Figma and mobile design patterns.",
    budget: { min: 3000, max: 5000, type: "fixed" as const },
    duration: "1 month",
    skills: ["Figma", "UI Design", "UX Design", "Mobile Design", "Prototyping"],
    postedBy: {
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=2",
      rating: 4.8,
      jobsPosted: 7,
    },
    postedAt: "2024-01-14",
    applicants: 15,
    status: "open" as const,
  },
  {
    id: "3",
    title: "Python Developer for Data Analysis Tool",
    description:
      "Need a Python developer to build a data analysis tool that processes large datasets and generates insightful reports. Experience with pandas, numpy, and data visualization libraries required.",
    budget: { min: 50, max: 80, type: "hourly" as const },
    duration: "1-2 months",
    skills: ["Python", "Pandas", "NumPy", "Data Visualization", "SQL"],
    postedBy: {
      name: "Emily Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=3",
      rating: 5.0,
      jobsPosted: 20,
    },
    postedAt: "2024-01-13",
    applicants: 12,
    status: "open" as const,
  },
  {
    id: "4",
    title: "Content Writer for Tech Blog",
    description:
      "Looking for a skilled content writer to create engaging articles about web development, AI, and emerging technologies. Must have strong technical knowledge and excellent writing skills.",
    budget: { min: 40, max: 60, type: "hourly" as const },
    duration: "Ongoing",
    skills: ["Content Writing", "Technical Writing", "SEO", "Research"],
    postedBy: {
      name: "David Park",
      avatar: "https://i.pravatar.cc/150?img=4",
      rating: 4.7,
      jobsPosted: 15,
    },
    postedAt: "2024-01-12",
    applicants: 22,
    status: "open" as const,
  },
  {
    id: "5",
    title: "React Native Developer for Social Media App",
    description:
      "We need an experienced React Native developer to build a cross-platform social media application with real-time messaging, photo sharing, and user profiles.",
    budget: { min: 8000, max: 12000, type: "fixed" as const },
    duration: "3-4 months",
    skills: ["React Native", "Firebase", "Redux", "REST APIs", "Mobile Development"],
    postedBy: {
      name: "Lisa Anderson",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 4.9,
      jobsPosted: 9,
    },
    postedAt: "2024-01-11",
    applicants: 18,
    status: "open" as const,
  },
  {
    id: "6",
    title: "DevOps Engineer for Cloud Infrastructure",
    description:
      "Seeking a DevOps engineer to set up and maintain our cloud infrastructure on AWS. Must have experience with Docker, Kubernetes, CI/CD pipelines, and infrastructure as code.",
    budget: { min: 70, max: 100, type: "hourly" as const },
    duration: "2-3 months",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    postedBy: {
      name: "James Wilson",
      avatar: "https://i.pravatar.cc/150?img=6",
      rating: 4.8,
      jobsPosted: 11,
    },
    postedAt: "2024-01-10",
    applicants: 9,
    status: "open" as const,
  },
]

const dummyApplications = [
  {
    id: "app-1",
    jobId: "1",
    freelancer: {
      id: "freelancer-1",
      name: "Alex Thompson",
      avatar: "https://i.pravatar.cc/150?img=7",
      title: "Full-Stack Developer",
      rating: 4.9,
      completedJobs: 47,
      hourlyRate: 85,
    },
    coverLetter:
      "I have over 5 years of experience building e-commerce platforms with Next.js and React. I've successfully delivered similar projects and can provide references. I'm confident I can deliver a high-quality solution within your timeline.",
    proposedBudget: 7500,
    proposedDuration: "2.5 months",
    status: "pending" as const,
    appliedAt: "2024-01-16",
  },
  {
    id: "app-2",
    jobId: "1",
    freelancer: {
      id: "freelancer-2",
      name: "Maria Garcia",
      avatar: "https://i.pravatar.cc/150?img=8",
      title: "Senior Full-Stack Engineer",
      rating: 5.0,
      completedJobs: 62,
      hourlyRate: 95,
    },
    coverLetter:
      "I specialize in building scalable e-commerce solutions. I've worked with Stripe integration extensively and can ensure a smooth payment flow. My portfolio includes 3 similar projects completed in the last year.",
    proposedBudget: 8000,
    proposedDuration: "2 months",
    status: "pending" as const,
    appliedAt: "2024-01-16",
  },
]

const dummyContracts = [
  {
    id: "contract-1",
    jobId: "1",
    clientId: "client-1",
    freelancerId: "freelancer-1",
    status: "pending-signatures" as const,
    clientSigned: false,
    freelancerSigned: false,
    milestones: [
      {
        id: "milestone-1",
        title: "Project Setup & Architecture",
        description: "Set up the project structure, database schema, and core architecture",
        amount: 2000,
        dueDate: "2024-02-15",
        status: "pending" as const,
      },
      {
        id: "milestone-2",
        title: "User Authentication & Product Management",
        description: "Implement user authentication system and product management features",
        amount: 2500,
        dueDate: "2024-03-15",
        status: "pending" as const,
      },
      {
        id: "milestone-3",
        title: "Shopping Cart & Checkout",
        description: "Build shopping cart functionality and integrate payment processing",
        amount: 2000,
        dueDate: "2024-04-01",
        status: "pending" as const,
      },
      {
        id: "milestone-4",
        title: "Testing & Deployment",
        description: "Complete testing, bug fixes, and deploy to production",
        amount: 1000,
        dueDate: "2024-04-15",
        status: "pending" as const,
      },
    ],
    createdAt: "2024-01-17",
  },
]

async function main() {

  await prisma.milestone.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.application.deleteMany()
  await prisma.job.deleteMany()
  await prisma.user.deleteMany()

  const clientIds = new Map<string, string>()

  for (const job of dummyJobs) {
    if (!clientIds.has(job.postedBy.name)) {
      // Use client@example.com for the first client to match Documenso template
      const email = job.postedBy.name === "Sarah Johnson"
        ? "client@example.com"
        : `${job.postedBy.name.toLowerCase().replace(/\s+/g, ".")}@example.com`

      const user = await prisma.user.create({
        data: {
          name: job.postedBy.name,
          email,
          avatar: job.postedBy.avatar,
          role: "client",
          rating: job.postedBy.rating,
          jobsPosted: job.postedBy.jobsPosted,
        },
      })
      clientIds.set(job.postedBy.name, user.id)
    }
  }

  const freelancerIds = new Map<string, string>()

  for (const application of dummyApplications) {
    if (!freelancerIds.has(application.freelancer.name)) {
      // Use freelance@example.com for the first freelancer to match Documenso template
      const email = application.freelancer.name === "Alex Thompson"
        ? "freelance@example.com"
        : `${application.freelancer.name.toLowerCase().replace(/\s+/g, ".")}@example.com`

      const user = await prisma.user.create({
        data: {
          name: application.freelancer.name,
          email,
          avatar: application.freelancer.avatar,
          role: "freelancer",
          title: application.freelancer.title,
          rating: application.freelancer.rating,
          completedJobs: application.freelancer.completedJobs,
          hourlyRate: application.freelancer.hourlyRate,
        },
      })
      freelancerIds.set(application.freelancer.name, user.id)
    }
  }

  const jobIds = new Map<string, string>()

  for (const job of dummyJobs) {
    const clientId = clientIds.get(job.postedBy.name)
    if (!clientId) continue

    const createdJob = await prisma.job.create({
      data: {
        title: job.title,
        description: job.description,
        budgetMin: job.budget.min,
        budgetMax: job.budget.max,
        budgetType: job.budget.type,
        duration: job.duration,
        skills: JSON.stringify(job.skills),
        status: job.status,
        applicants: job.applicants,
        postedById: clientId,
        createdAt: new Date(job.postedAt),
      },
    })
    jobIds.set(job.id, createdJob.id)
  }

  for (const application of dummyApplications) {
    const jobId = jobIds.get(application.jobId)
    const freelancerId = freelancerIds.get(application.freelancer.name)

    if (!jobId || !freelancerId) continue

    const createdApplication = await prisma.application.create({
      data: {
        coverLetter: application.coverLetter,
        proposedBudget: application.proposedBudget,
        proposedDuration: application.proposedDuration,
        status: application.status,
        jobId,
        freelancerId,
        createdAt: new Date(application.appliedAt),
      },
    })
  }

  for (const contract of dummyContracts) {
    const jobId = jobIds.get(contract.jobId)
    const clientId = clientIds.get(dummyJobs.find((j) => j.id === contract.jobId)?.postedBy.name || "")
    const freelancerId = freelancerIds.get(
      dummyApplications.find((a) => a.freelancer.id === contract.freelancerId)?.freelancer.name || "",
    )

    if (!jobId || !clientId || !freelancerId) continue

    const createdContract = await prisma.contract.create({
      data: {
        status: contract.status,
        clientSigned: contract.clientSigned,
        freelancerSigned: contract.freelancerSigned,
        jobId,
        clientId,
        freelancerId,
        createdAt: new Date(contract.createdAt),
        milestones: {
          create: contract.milestones.map((milestone) => ({
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            dueDate: new Date(milestone.dueDate),
            status: milestone.status,
          })),
        },
      },
    })
  }

}

main()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
