import { NextRequest, NextResponse } from "next/server";
import { ingestExternalLead, verifyMetaSignature } from "@/lib/webhookIngest";
import { LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// WhatsApp Cloud API webhook: entry[].changes[].value.messages[] carries inbound
// messages, with the sender profile under value.contacts[].
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(raw, signature, process.env.WHATSAPP_APP_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  type WaMessage = { from?: string; text?: { body?: string } };
  type WaContact = { profile?: { name?: string }; wa_id?: string };
  type Change = { value?: { messages?: WaMessage[]; contacts?: WaContact[] } };
  type Entry = { changes?: Change[] };

  let body: { entry?: Entry[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entries: Entry[] = body.entry ?? [];

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];
      const contacts = change.value?.contacts ?? [];

      for (const msg of messages) {
        const contact = contacts.find((c) => c.wa_id === msg.from);

        await ingestExternalLead(LeadSource.WHATSAPP, {
          contactName: contact?.profile?.name || `WhatsApp ${msg.from ?? "unknown"}`,
          phone: msg.from,
          message: msg.text?.body,
          sourceRef: msg.from,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
