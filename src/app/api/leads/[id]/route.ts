import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canTransition, transitionLead, InvalidTransitionError } from "@/lib/workflow";
import { LeadStage } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  stage: z.nativeEnum(LeadStage).optional(),
  assignedToId: z.string().nullable().optional(),
  note: z.string().max(2000).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      customer: true,
      tasks: { orderBy: { createdAt: "desc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { id: true, name: true } } },
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    lead,
    allowedNextStages: Object.values(LeadStage).filter((s) => canTransition(lead.stage, s)),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { stage, assignedToId, note } = parsed.data;
  const actorUserId = (session.user as { id?: string }).id;

  try {
    if (stage) {
      await transitionLead(id, stage, { actorUserId, note });
    }

    if (assignedToId !== undefined) {
      await prisma.lead.update({ where: { id }, data: { assignedToId } });
    }

    const lead = await prisma.lead.findUniqueOrThrow({
      where: { id },
      include: { assignedTo: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ lead });
  } catch (err) {
    if (err instanceof InvalidTransitionError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
