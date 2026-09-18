import { NextRequest, NextResponse } from "next/server";
import { ingestExternalLead, verifyApiKey } from "@/lib/webhookIngest";
import { LeadSource } from "@prisma/client";
import { z } from "zod";

// LinkedIn Lead Gen Forms don't push webhooks directly — they're synced via the
// LinkedIn Lead Sync API (partner access) or bridged through an automation tool
// like Zapier/Make/n8n. This endpoint accepts a normalized payload from that
// bridge, authenticated with a shared API key (see IntegrationSource / .env).
const payloadSchema = z.object({
  contactName: z.string().min(1),
  companyName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  message: z.string().optional(),
  formId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!verifyApiKey(apiKey, process.env.LINKEDIN_WEBHOOK_API_KEY)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const lead = await ingestExternalLead(LeadSource.LINKEDIN, {
    contactName: data.contactName,
    companyName: data.companyName,
    email: data.email,
    phone: data.phone,
    country: data.country,
    message: data.message,
    sourceRef: data.formId,
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
