import { LeadStage, ActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Allowed forward/back transitions for the sales workflow.
 * WON and LOST are terminal; a lead can be reopened by moving it back to CONTACTED.
 */
export const ALLOWED_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["QUALIFIED", "LOST"],
  QUALIFIED: ["QUOTED", "LOST"],
  QUOTED: ["NEGOTIATION", "LOST"],
  NEGOTIATION: ["WON", "LOST"],
  WON: ["CONTACTED"],
  LOST: ["CONTACTED"],
};

/** Follow-up task auto-created when a lead enters a given stage. */
const STAGE_FOLLOW_UP: Partial<Record<LeadStage, { title: string; hoursFromNow: number }>> = {
  NEW: { title: "Make first contact with lead", hoursFromNow: 24 },
  CONTACTED: { title: "Qualify lead requirements", hoursFromNow: 48 },
  QUALIFIED: { title: "Prepare and send quotation", hoursFromNow: 72 },
  QUOTED: { title: "Follow up on quotation", hoursFromNow: 96 },
  NEGOTIATION: { title: "Close the deal", hoursFromNow: 48 },
};

export function canTransition(from: LeadStage, to: LeadStage): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export class InvalidTransitionError extends Error {
  constructor(from: LeadStage, to: LeadStage) {
    super(`Cannot move lead from ${from} to ${to}`);
    this.name = "InvalidTransitionError";
  }
}

/**
 * Moves a lead to a new stage, records the activity, and seeds the next
 * follow-up task for whoever owns the lead. This is the single place stage
 * changes should go through so history and tasks never drift out of sync.
 */
export async function transitionLead(
  leadId: string,
  toStage: LeadStage,
  opts: { actorUserId?: string; note?: string } = {},
) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });

  if (!canTransition(lead.stage, toStage)) {
    throw new InvalidTransitionError(lead.stage, toStage);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.lead.update({
      where: { id: leadId },
      data: { stage: toStage },
    });

    await tx.leadActivity.create({
      data: {
        leadId,
        type: ActivityType.STAGE_CHANGE,
        message: `Stage changed from ${lead.stage} to ${toStage}${opts.note ? `: ${opts.note}` : ""}`,
        createdById: opts.actorUserId,
        metadata: { from: lead.stage, to: toStage },
      },
    });

    const followUp = STAGE_FOLLOW_UP[toStage];
    if (followUp) {
      const task = await tx.task.create({
        data: {
          leadId,
          title: followUp.title,
          dueAt: new Date(Date.now() + followUp.hoursFromNow * 60 * 60 * 1000),
          assignedToId: updated.assignedToId ?? opts.actorUserId,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId,
          type: ActivityType.TASK_CREATED,
          message: `Task created: ${task.title}`,
          createdById: opts.actorUserId,
        },
      });
    }

    return updated;
  });
}
