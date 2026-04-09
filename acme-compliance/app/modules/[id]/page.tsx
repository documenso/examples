import { notFound } from "next/navigation"
import { getModule } from "@/lib/mock-data"
import { ModuleContent } from "@/components/module-content"

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const mod = getModule(id)

  if (!mod) {
    notFound()
  }

  return <ModuleContent module={mod} />
}
