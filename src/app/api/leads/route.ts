import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLeadSchema } from "@/lib/validation";
import { ActivityType, LeadStage } from "@prisma/client";

// POST is public — it's how the marketing site and webhook adapters create leads.
export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createLeadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      contactName: data.contactName,
      companyName: data.companyName || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      country: data.country || undefined,
      productInterest: data.productInterest || undefined,
      message: data.message || undefined,
      source: data.source,
      sourceRef: data.sourceRef,
      stage: LeadStage.NEW,
      activities: {
        create: {
          type: ActivityType.SYSTEM,
          message: `Lead captured from ${data.source}`,
        },
      },
    },
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}

// GET is internal — the dashboard lists/filters leads.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");
  const source = searchParams.get("source");
  const assignedToId = searchParams.get("assignedToId");

  const leads = await prisma.lead.findMany({
    where: {
      stage: stage ? (stage as LeadStage) : undefined,
      source: source ? (source as never) : undefined,
      assignedToId: assignedToId || undefined,
    },
    include: { assignedTo: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ leads });
}
