import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTaskSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const assignedToId = searchParams.get("assignedToId");

  const tasks = await prisma.task.findMany({
    where: {
      status: status ? (status as never) : undefined,
      assignedToId: assignedToId || undefined,
    },
    include: {
      lead: { select: { id: true, contactName: true, companyName: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    take: 200,
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      leadId: data.leadId,
      assignedToId: data.assignedToId ?? (session.user as { id?: string }).id,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
