import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all registrations, tickets, and attendance logs...');
  
  // Deleting registrations will cascade and delete tickets, registration answers, and attendance logs automatically.
  const result = await prisma.registration.deleteMany({});
  console.log(`Successfully cleared ${result.count} registrations (and all cascaded tickets/answers/logs).`);
}

main()
  .catch((e) => {
    console.error('Error clearing registrations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
