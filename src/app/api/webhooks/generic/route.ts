import { NextRequest, NextResponse } from "next/server";
import { ingestExternalLead, verifyApiKey } from "@/lib/webhookIngest";
import { LeadSource } from "@prisma/client";
import { z } from "zod";

// Catch-all ingestion endpoint for anything else that can send a webhook or be
// scripted against an API: trade-show lead scanners, email parsing rules,
// Zapier/Make/n8n flows, an ERP, etc. Protected by a shared API key.
const payloadSchema = z.object({
  contactName: z.string().min(1),
  companyName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  message: z.string().optional(),
  productInterest: z.string().optional(),
  source: z.nativeEnum(LeadSource).default(LeadSource.OTHER),
  sourceRef: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!verifyApiKey(apiKey, process.env.GENERIC_WEBHOOK_API_KEY)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { source, ...data } = parsed.data;
  const lead = await ingestExternalLead(source, data);

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
