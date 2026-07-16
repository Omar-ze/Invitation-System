import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create partner accounts
  const partner1Password = await bcrypt.hash("omar1234", 12);
  const partner1 = await prisma.user.upsert({
    where: { email: "omar@gmail.com" },
    update: {},
    create: {
      email: "omar@gmail.com",
      password: partner1Password,
      fullName: "omar",
      role: Role.PARTNER,
    },
  });

  const partner2Password = await bcrypt.hash("youssef1234", 12);
  const partner2 = await prisma.user.upsert({
    where: { email: "youssef@gmail.com" },
    update: {},
    create: {
      email: "youssef@gmail.com",
      password: partner2Password,
      fullName: "youssef",
      role: Role.PARTNER,
    },
  });

  console.log("✅ Partners created:");
  console.log(`   - ${partner1.fullName} (${partner1.email}) — password: omar1234`);
  console.log(`   - ${partner2.fullName} (${partner2.email}) — password: youssef1234`);

  // Create some demo invitations for partner1
  await prisma.invitation.createMany({
    data: [
      { partnerId: partner1.id, code: "demo-invite-001" },
      { partnerId: partner1.id, code: "demo-invite-002" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Demo invitations created for Omar");
  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });