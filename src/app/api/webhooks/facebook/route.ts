import { NextRequest, NextResponse } from "next/server";
import { ingestExternalLead, verifyMetaSignature } from "@/lib/webhookIngest";
import { LeadSource } from "@prisma/client";

// Meta calls this once, on setup, to verify the endpoint.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Facebook Page Lead Ads webhook: entry[].changes[].value contains a leadgen_id
// that must be resolved via the Graph API (GET /{leadgen_id}?access_token=...)
// to get the submitted field_data. That lookup needs a Page access token, which
// is issued once the client's Facebook App + Page are connected — see README.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(raw, signature, process.env.FACEBOOK_APP_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  type LeadgenChange = { field: string; value?: { leadgen_id?: string; form_id?: string } };
  type Entry = { id: string; changes?: LeadgenChange[] };

  let body: { entry?: Entry[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entries: Entry[] = body.entry ?? [];

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen") continue;
      const leadgenId = change.value?.leadgen_id;

      await ingestExternalLead(LeadSource.FACEBOOK, {
        contactName: "Facebook Lead Ad submission",
        message: `New Facebook Lead Ad submission (leadgen_id: ${leadgenId ?? "unknown"}). ` +
          "Fetch full field data via the Graph API using the Page access token.",
        sourceRef: leadgenId,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
