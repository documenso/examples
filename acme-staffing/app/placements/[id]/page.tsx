import { notFound } from "next/navigation"
import { PlacementDetailPage as PlacementDetailView } from "@/components/placement-detail-page"
import { getPlacement } from "@/lib/mock-data"

export default async function PlacementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const placement = getPlacement(id)

  if (!placement) {
    notFound()
  }

  return <PlacementDetailView initialPlacement={placement} />
}
