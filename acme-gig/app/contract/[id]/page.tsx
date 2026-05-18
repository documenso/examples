import { ContractSigning } from "@/components/contract-signing"

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <ContractSigning contractId={id} />
}
