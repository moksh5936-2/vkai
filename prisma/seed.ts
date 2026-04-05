import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding VKai Ecosystem...");

  const ecosystemMembers = [
    {
      name: "TechStars India",
      type: "INCUBATOR",
      description: "Global accelerator that helps entrepreneurs succeed.",
      website: "https://www.techstars.com/accelerators/india",
      isVerified: true,
    },
    {
      name: "Sequoia Scout Network",
      type: "INVESTOR",
      description: "Early-stage investment network by Sequoia Capital.",
      website: "https://www.sequoiacap.com",
      isVerified: true,
    },
    {
      name: "McKinsey Digital Advisory",
      type: "CONSULTANT",
      description: "Strategic consultant for digital transformation and startup scaling.",
      website: "https://www.mckinsey.com/business-functions/mckinsey-digital/how-we-help-clients",
      isVerified: true,
    },
    {
      name: "HDFC Bank Startup Cell",
      type: "BANK",
      description: "Dedicated banking services and credit lines for startups.",
      website: "https://www.hdfcbank.com/personal/resources/learning-centre/smefinance/startup-banking",
      isVerified: true,
    },
    {
      name: "Y Combinator Alumni Network",
      type: "INVESTOR",
      description: "A network of world-class founders and early-stage investors.",
      website: "https://www.ycombinator.com",
      isVerified: true,
    },
    {
      name: "91springboard",
      type: "INCUBATOR",
      description: "Co-working community and incubator for high-growth startups.",
      website: "https://www.91springboard.com",
      isVerified: true,
    },
  ];

  for (const member of ecosystemMembers) {
    await prisma.ecosystemMember.upsert({
      where: { id: member.name.replace(/\s+/g, "-").toLowerCase() }, // Just a temporary unique key for seed
      update: {},
      create: {
        ...member,
        id: member.name.replace(/\s+/g, "-").toLowerCase(),
      },
    });
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
