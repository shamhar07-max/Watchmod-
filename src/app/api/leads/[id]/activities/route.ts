import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNoteSchema } from "@/lib/validation";
import { ActivityType } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: leadId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = createNoteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const activity = await prisma.leadActivity.create({
    data: {
      leadId,
      type: ActivityType.NOTE,
      message: parsed.data.message,
      createdById: (session.user as { id?: string }).id,
    },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
