import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { LeadSource } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  channel: z.nativeEnum(LeadSource),
  label: z.string().min(1).max(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integrations = await prisma.integrationSource.findMany({
    orderBy: { channel: "asc" },
  });

  return NextResponse.json({ integrations });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const integration = await prisma.integrationSource.create({
    data: parsed.data,
  });

  return NextResponse.json({ integration }, { status: 201 });
}
