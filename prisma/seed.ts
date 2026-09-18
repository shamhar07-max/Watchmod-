import { PrismaClient, LeadStage, LeadSource, ActivityType, ProductCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 10);
  const salesPasswordHash = await bcrypt.hash("ChangeMe123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@uaepcs.com" },
    update: {},
    create: {
      name: "Operations Admin",
      email: "admin@uaepcs.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: "sales@uaepcs.com" },
    update: {},
    create: {
      name: "Sales Executive",
      email: "sales@uaepcs.com",
      passwordHash: salesPasswordHash,
      role: "SALES",
    },
  });

  await prisma.product.createMany({
    data: [
      { sku: "NW-SW-24P", name: "24-Port Gigabit Network Switch", category: ProductCategory.NETWORKING, retailPrice: 450, wholesalePrice: 380, stockQty: 60 },
      { sku: "HW-LAP-14", name: "14-inch Business Laptop", category: ProductCategory.HARDWARE, retailPrice: 2200, wholesalePrice: 1950, stockQty: 40 },
      { sku: "CS-TNR-BLK", name: "Black Toner Cartridge (Universal)", category: ProductCategory.CONSUMABLES, retailPrice: 65, wholesalePrice: 48, stockQty: 500 },
    ],
    skipDuplicates: true,
  });

  const CHANNELS: LeadSource[] = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "LINKEDIN"];
  for (const channel of CHANNELS) {
    await prisma.integrationSource.upsert({
      where: { channel_label: { channel, label: `Main ${channel}` } },
      update: {},
      create: { channel, label: `Main ${channel}`, isActive: true },
    });
  }

  const sampleLeads: {
    contactName: string;
    companyName?: string;
    email?: string;
    phone?: string;
    country?: string;
    productInterest?: string;
    source: LeadSource;
    stage: LeadStage;
    assignedToId?: string;
  }[] = [
    { contactName: "Omar Al Farsi", companyName: "Gulf Networks LLC", email: "omar@gulfnetworks.ae", country: "UAE", productInterest: "Gigabit switches", source: LeadSource.WEBSITE, stage: LeadStage.NEW },
    { contactName: "Priya Nair", companyName: "TechImport Kenya", email: "priya@techimport.ke", country: "Kenya", productInterest: "Bulk laptops", source: LeadSource.WHATSAPP, stage: LeadStage.CONTACTED, assignedToId: sales.id },
    { contactName: "Ahmed Saleh", companyName: "Saleh Trading Est.", email: "ahmed@salehtrading.com", country: "Saudi Arabia", productInterest: "Networking cabling", source: LeadSource.FACEBOOK, stage: LeadStage.QUALIFIED, assignedToId: sales.id },
    { contactName: "Elena Petrova", companyName: "EuroTech Distribution", email: "elena@eurotech.eu", country: "Poland", productInterest: "Container-load export", source: LeadSource.LINKEDIN, stage: LeadStage.QUOTED, assignedToId: sales.id },
    { contactName: "Michael Owusu", companyName: "Owusu IT Supplies", email: "michael@owusuit.com", country: "Ghana", productInterest: "Printer consumables", source: LeadSource.INSTAGRAM, stage: LeadStage.NEGOTIATION, assignedToId: sales.id },
    { contactName: "Fatima Khan", companyName: "Khan Enterprises", email: "fatima@khanent.pk", country: "Pakistan", productInterest: "Server hardware", source: LeadSource.WEBSITE, stage: LeadStage.WON, assignedToId: admin.id },
  ];

  for (const data of sampleLeads) {
    const lead = await prisma.lead.create({
      data: {
        ...data,
        activities: {
          create: {
            type: ActivityType.SYSTEM,
            message: `Lead captured from ${data.source}`,
          },
        },
      },
    });

    if (lead.stage !== LeadStage.NEW) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: ActivityType.STAGE_CHANGE,
          message: `Stage set to ${lead.stage}`,
          createdById: data.assignedToId,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`  Admin login: admin@uaepcs.com / ChangeMe123!`);
  console.log(`  Sales login: sales@uaepcs.com / ChangeMe123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
