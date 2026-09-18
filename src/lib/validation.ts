import { z } from "zod";

export const leadSourceValues = [
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "WHATSAPP",
  "LINKEDIN",
  "EMAIL",
  "PHONE",
  "REFERRAL",
  "TRADE_SHOW",
  "OTHER",
] as const;

export const createLeadSchema = z.object({
  contactName: z.string().min(1, "Name is required").max(200),
  companyName: z.string().max(200).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  productInterest: z.string().max(300).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  source: z.enum(leadSourceValues).default("WEBSITE"),
  sourceRef: z.string().max(200).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  leadId: z.string().optional(),
  assignedToId: z.string().optional(),
  dueAt: z.string().datetime().optional(),
});

export const createNoteSchema = z.object({
  message: z.string().min(1).max(2000),
});
