import { SigningPage } from "@/components/signing-page"

export default async function Page({
  params,
}: {
  params: Promise<{ subId: string }>
}) {
  const { subId } = await params

  return <SigningPage subId={subId} />
}
