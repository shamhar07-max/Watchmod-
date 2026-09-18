import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TaskStatus } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  assignedToId: z.string().nullable().optional(),
  title: z.string().min(1).max(300).optional(),
  dueAt: z.string().datetime().nullable().optional(),
});

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

  const { dueAt, ...rest } = parsed.data;
  const task = await prisma.task.update({
    where: { id },
    data: { ...rest, dueAt: dueAt === undefined ? undefined : dueAt ? new Date(dueAt) : null },
  });

  return NextResponse.json({ task });
}
