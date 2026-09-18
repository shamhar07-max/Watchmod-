import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ActivityType, LeadSource, LeadStage } from "@prisma/client";

export type NormalizedLead = {
  contactName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  country?: string;
  message?: string;
  productInterest?: string;
  sourceRef?: string;
};

/**
 * Single entry point every webhook adapter funnels through, so a lead
 * captured from Facebook/Instagram/WhatsApp/LinkedIn/a generic integration
 * all land in the same shape and history trail as a website enquiry.
 */
export async function ingestExternalLead(source: LeadSource, data: NormalizedLead) {
  await prisma.integrationSource.updateMany({
    where: { channel: source },
    data: { lastEventAt: new Date() },
  });

  return prisma.lead.create({
    data: {
      contactName: data.contactName || "Unknown contact",
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      message: data.message,
      productInterest: data.productInterest,
      source,
      sourceRef: data.sourceRef,
      stage: LeadStage.NEW,
      activities: {
        create: {
          type: ActivityType.SYSTEM,
          message: `Lead captured from ${source} webhook`,
        },
      },
    },
  });
}

/** Verifies a Meta (Facebook/Instagram) X-Hub-Signature-256 header against the raw request body. */
export function verifyMetaSignature(rawBody: string, signatureHeader: string | null, appSecret: string | undefined) {
  if (!appSecret) return true; // no secret configured yet — accept, but this should be set before go-live
  if (!signatureHeader) return false;

  const expected =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Simple constant-time API key check for the generic ingestion endpoint. */
export function verifyApiKey(provided: string | null, expected: string | undefined) {
  if (!expected) return false;
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
