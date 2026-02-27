import { redirect } from "next/navigation";

export default async function LegacyChatPage({
  params
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  redirect(`/conversations/${conversationId}`);
}
