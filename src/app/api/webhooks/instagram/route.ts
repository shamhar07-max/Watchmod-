import { NextRequest, NextResponse } from "next/server";
import { ingestExternalLead, verifyMetaSignature } from "@/lib/webhookIngest";
import { LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Instagram Messaging webhook: entry[].messaging[] carries DM events from the
// connected Instagram professional account.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(raw, signature, process.env.INSTAGRAM_APP_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  type MessagingEvent = {
    sender?: { id?: string };
    message?: { text?: string };
  };
  type Entry = { id: string; messaging?: MessagingEvent[] };

  let body: { entry?: Entry[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entries: Entry[] = body.entry ?? [];

  for (const entry of entries) {
    for (const event of entry.messaging ?? []) {
      if (!event.message?.text) continue;

      await ingestExternalLead(LeadSource.INSTAGRAM, {
        contactName: `Instagram user ${event.sender?.id ?? "unknown"}`,
        message: event.message.text,
        sourceRef: event.sender?.id,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
