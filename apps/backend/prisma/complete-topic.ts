import { PrismaClient, ProgressStatus } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const email = 'enthu2@rajalakshmi.edu.in';
  console.log(`Finding user with email: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User ${email} not found.`);
    return;
  }

  console.log(`Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

  // Find first topic
  const topics = await prisma.roadmapTopic.findMany({
    orderBy: { orderIndex: 'asc' },
    include: { modules: true },
  });

  if (topics.length === 0) {
    console.error(`No topics found in database.`);
    return;
  }

  const firstTopic = topics[0];
  console.log(`First Topic: "${firstTopic.name}" (ID: ${firstTopic.id}), Slug: "${firstTopic.slug}"`);
  console.log(`Modules count: ${firstTopic.modules.length}`);

  // Set all modules of the first topic to COMPLETED
  for (const module of firstTopic.modules) {
    console.log(`Setting module "${module.name}" (ID: ${module.id}) to COMPLETED`);
    await prisma.userModuleProgress.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: module.id,
        },
      },
      update: {
        status: 'COMPLETED' as ProgressStatus,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        moduleId: module.id,
        status: 'COMPLETED' as ProgressStatus,
        completedAt: new Date(),
      },
    });
  }

  console.log(`First topic "${firstTopic.name}" successfully completed for user ${email}`);
}

main()
  .catch((e) => {
    console.error('Error completing topic:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
