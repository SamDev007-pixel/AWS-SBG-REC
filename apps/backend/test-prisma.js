const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      speakerDetailsJson: true,
      speakers: {
        select: {
          id: true,
          name: true,
          linkedinUrl: true
        }
      }
    }
  });
  console.log('Events detail:');
  console.dir(events, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
