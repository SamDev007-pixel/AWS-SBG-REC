import { PrismaClient } from '@prisma/client';
import { TOPIC as AWS_TOPIC, CURRICULUM_MODULES as AWS_MODULES } from './curriculum/aws-roadmap';
import { TOPIC as DEVOPS_TOPIC, CURRICULUM_MODULES as DEVOPS_MODULES } from './curriculum/devops-foundations';
import { TOPIC as NETWORKING_TOPIC, CURRICULUM_MODULES as NETWORKING_MODULES } from './curriculum/cloud-networking';
import { TOPIC as DATABASE_TOPIC, CURRICULUM_MODULES as DATABASE_MODULES } from './curriculum/database-services';
import { TOPIC as SECURITY_TOPIC, CURRICULUM_MODULES as SECURITY_MODULES } from './curriculum/security-compliance';
import { TOPIC as SERVERLESS_TOPIC, CURRICULUM_MODULES as SERVERLESS_MODULES } from './curriculum/serverless-architecture';
import { TOPIC as STORAGE_TOPIC, CURRICULUM_MODULES as STORAGE_MODULES } from './curriculum/storage-data';
import { TOPIC as MONITORING_TOPIC, CURRICULUM_MODULES as MONITORING_MODULES } from './curriculum/monitoring-operations';
import { TOPIC as ML_TOPIC, CURRICULUM_MODULES as ML_MODULES } from './curriculum/machine-learning-ai';
import { TOPIC as CONTAINER_TOPIC, CURRICULUM_MODULES as CONTAINER_MODULES } from './curriculum/container-services';
import { TOPIC as COST_TOPIC, CURRICULUM_MODULES as COST_MODULES } from './curriculum/cost-management';
import { TOPIC as MIGRATION_TOPIC, CURRICULUM_MODULES as MIGRATION_MODULES } from './curriculum/migration-transfer';
import { TOPIC as CICD_TOPIC, CURRICULUM_MODULES as CICD_MODULES } from './curriculum/cicd-pipelines';
import { TOPIC as IAC_TOPIC, CURRICULUM_MODULES as IAC_MODULES } from './curriculum/infrastructure-as-code';
import { TOPIC as PYTHON_TOPIC, CURRICULUM_MODULES as PYTHON_MODULES } from './curriculum/python-for-cloud';
import { TOPIC as DWH_TOPIC, CURRICULUM_MODULES as DWH_MODULES } from './curriculum/data-warehousing';
import { TOPIC as NETSEC_TOPIC, CURRICULUM_MODULES as NETSEC_MODULES } from './curriculum/network-security';
import { TOPIC as RTA_TOPIC, CURRICULUM_MODULES as RTA_MODULES } from './curriculum/real-time-analytics';
import { TOPIC as APPINT_TOPIC, CURRICULUM_MODULES as APPINT_MODULES } from './curriculum/application-integration';
import { TOPIC as EDGE_TOPIC, CURRICULUM_MODULES as EDGE_MODULES } from './curriculum/edge-computing';
import { TOPIC as MEDIA_TOPIC, CURRICULUM_MODULES as MEDIA_MODULES } from './curriculum/media-services';
import { TOPIC as DESKTOP_TOPIC, CURRICULUM_MODULES as DESKTOP_MODULES } from './curriculum/desktop-app-streaming';
import { TOPIC as BLOCKCHAIN_TOPIC, CURRICULUM_MODULES as BLOCKCHAIN_MODULES } from './curriculum/blockchain-managed';
import { TOPIC as QUANTUM_TOPIC, CURRICULUM_MODULES as QUANTUM_MODULES } from './curriculum/quantum-braket';
import { TOPIC as MAINFRAME_TOPIC, CURRICULUM_MODULES as MAINFRAME_MODULES } from './curriculum/mainframe-modernization';
import { TOPIC as VMWARE_TOPIC, CURRICULUM_MODULES as VMWARE_MODULES } from './curriculum/vmware-cloud';
import { TOPIC as FINTECH_TOPIC, CURRICULUM_MODULES as FINTECH_MODULES } from './curriculum/financial-services';
import { TOPIC as HEALTH_TOPIC, CURRICULUM_MODULES as HEALTH_MODULES } from './curriculum/healthcare-compliance';
import { TOPIC as MFG_TOPIC, CURRICULUM_MODULES as MFG_MODULES } from './curriculum/manufacturing-iot';
import { TOPIC as AUTO_TOPIC, CURRICULUM_MODULES as AUTO_MODULES } from './curriculum/automotive-connected';
import { TOPIC as ENERGY_TOPIC, CURRICULUM_MODULES as ENERGY_MODULES } from './curriculum/energy-smart-grid';
import { TOPIC as MEDIAS_TOPIC, CURRICULUM_MODULES as MEDIAS_MODULES } from './curriculum/media-streaming';
import { TOPIC as GAME_TOPIC, CURRICULUM_MODULES as GAME_MODULES } from './curriculum/game-development';
import { TOPIC as SOCIAL_TOPIC, CURRICULUM_MODULES as SOCIAL_MODULES } from './curriculum/social-media-scale';
import { TOPIC as NONPROFIT_TOPIC, CURRICULUM_MODULES as NONPROFIT_MODULES } from './curriculum/nonprofit-programs';
import { TOPIC as GOV_TOPIC, CURRICULUM_MODULES as GOV_MODULES } from './curriculum/government-compliance';
import { TOPIC as LEGAL_TOPIC, CURRICULUM_MODULES as LEGAL_MODULES } from './curriculum/legal-discovery';
import { TOPIC as AG_TOPIC, CURRICULUM_MODULES as AG_MODULES } from './curriculum/agriculture-precision';
import { TOPIC as RE_TOPIC, CURRICULUM_MODULES as RE_MODULES } from './curriculum/real-estate-tech';
import { TOPIC as TRAVEL_TOPIC, CURRICULUM_MODULES as TRAVEL_MODULES } from './curriculum/travel-logistics';
import { TOPIC as FOOD_TOPIC, CURRICULUM_MODULES as FOOD_MODULES } from './curriculum/food-supply';
import { TOPIC as RETAIL_TOPIC, CURRICULUM_MODULES as RETAIL_MODULES } from './curriculum/retail-personalization';
import { TOPIC as CONSTRUCTION_TOPIC, CURRICULUM_MODULES as CONSTRUCTION_MODULES } from './curriculum/construction-tech';
import { TOPIC as LOGISTICS_TOPIC, CURRICULUM_MODULES as LOGISTICS_MODULES } from './curriculum/logistics-tracking';
import { TOPIC as PROFSERV_TOPIC, CURRICULUM_MODULES as PROFSERV_MODULES } from './curriculum/professional-services';
import { TOPIC as AMS_TOPIC, CURRICULUM_MODULES as AMS_MODULES } from './curriculum/aws-managed-services';
import { TOPIC as DIGITAL_TOPIC, CURRICULUM_MODULES as DIGITAL_MODULES } from './curriculum/digital-transformation';
import { TOPIC as SUSTAIN_TOPIC, CURRICULUM_MODULES as SUSTAIN_MODULES } from './curriculum/sustainability-tech';
import { TOPIC as IOT_TOPIC, CURRICULUM_MODULES as IOT_MODULES } from './curriculum/iot-core';
import { TOPIC as XR_TOPIC, CURRICULUM_MODULES as XR_MODULES } from './curriculum/mixed-reality';

const CURRICULA = [
  { topic: AWS_TOPIC, modules: AWS_MODULES },
  { topic: DEVOPS_TOPIC, modules: DEVOPS_MODULES },
  { topic: NETWORKING_TOPIC, modules: NETWORKING_MODULES },
  { topic: DATABASE_TOPIC, modules: DATABASE_MODULES },
  { topic: SECURITY_TOPIC, modules: SECURITY_MODULES },
  { topic: SERVERLESS_TOPIC, modules: SERVERLESS_MODULES },
  { topic: STORAGE_TOPIC, modules: STORAGE_MODULES },
  { topic: MONITORING_TOPIC, modules: MONITORING_MODULES },
  { topic: ML_TOPIC, modules: ML_MODULES },
  { topic: CONTAINER_TOPIC, modules: CONTAINER_MODULES },
  { topic: COST_TOPIC, modules: COST_MODULES },
  { topic: MIGRATION_TOPIC, modules: MIGRATION_MODULES },
  { topic: CICD_TOPIC, modules: CICD_MODULES },
  { topic: IAC_TOPIC, modules: IAC_MODULES },
  { topic: PYTHON_TOPIC, modules: PYTHON_MODULES },
  { topic: DWH_TOPIC, modules: DWH_MODULES },
  { topic: NETSEC_TOPIC, modules: NETSEC_MODULES },
  { topic: RTA_TOPIC, modules: RTA_MODULES },
  { topic: APPINT_TOPIC, modules: APPINT_MODULES },
  { topic: EDGE_TOPIC, modules: EDGE_MODULES },
  { topic: MEDIA_TOPIC, modules: MEDIA_MODULES },
  { topic: DESKTOP_TOPIC, modules: DESKTOP_MODULES },
  { topic: BLOCKCHAIN_TOPIC, modules: BLOCKCHAIN_MODULES },
  { topic: QUANTUM_TOPIC, modules: QUANTUM_MODULES },
  { topic: MAINFRAME_TOPIC, modules: MAINFRAME_MODULES },
  { topic: VMWARE_TOPIC, modules: VMWARE_MODULES },
  { topic: FINTECH_TOPIC, modules: FINTECH_MODULES },
  { topic: HEALTH_TOPIC, modules: HEALTH_MODULES },
  { topic: MFG_TOPIC, modules: MFG_MODULES },
  { topic: AUTO_TOPIC, modules: AUTO_MODULES },
  { topic: ENERGY_TOPIC, modules: ENERGY_MODULES },
  { topic: MEDIAS_TOPIC, modules: MEDIAS_MODULES },
  { topic: GAME_TOPIC, modules: GAME_MODULES },
  { topic: SOCIAL_TOPIC, modules: SOCIAL_MODULES },
  { topic: NONPROFIT_TOPIC, modules: NONPROFIT_MODULES },
  { topic: GOV_TOPIC, modules: GOV_MODULES },
  { topic: LEGAL_TOPIC, modules: LEGAL_MODULES },
  { topic: AG_TOPIC, modules: AG_MODULES },
  { topic: RE_TOPIC, modules: RE_MODULES },
  { topic: TRAVEL_TOPIC, modules: TRAVEL_MODULES },
  { topic: FOOD_TOPIC, modules: FOOD_MODULES },
  { topic: RETAIL_TOPIC, modules: RETAIL_MODULES },
  { topic: CONSTRUCTION_TOPIC, modules: CONSTRUCTION_MODULES },
  { topic: LOGISTICS_TOPIC, modules: LOGISTICS_MODULES },
  { topic: PROFSERV_TOPIC, modules: PROFSERV_MODULES },
  { topic: AMS_TOPIC, modules: AMS_MODULES },
  { topic: DIGITAL_TOPIC, modules: DIGITAL_MODULES },
  { topic: SUSTAIN_TOPIC, modules: SUSTAIN_MODULES },
  { topic: IOT_TOPIC, modules: IOT_MODULES },
  { topic: XR_TOPIC, modules: XR_MODULES },
];

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roadmap data...');

  // Clear existing roadmap data to avoid orderIndex unique constraint conflicts
  await prisma.learningSlide.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.roadmapModule.deleteMany();
  await prisma.roadmapTopic.deleteMany();
  console.log('Cleared existing roadmap data.');

  for (const curriculum of CURRICULA) {
    const topic = await prisma.roadmapTopic.upsert({
      where: { slug: curriculum.topic.slug },
      update: {
        name: curriculum.topic.name,
        description: curriculum.topic.description,
        orderIndex: curriculum.topic.orderIndex,
        theme: curriculum.topic.theme,
      },
      create: curriculum.topic,
    });
    console.log(`Topic: ${topic.name} (${topic.slug})`);

    for (const m of curriculum.modules) {
      const dbModule = await prisma.roadmapModule.upsert({
        where: { slug: m.slug },
        update: {
          name: m.name,
          description: m.description,
          tier: m.tier,
          xpPoints: m.xpPoints,
          orderIndex: m.orderIndex,
          topicId: topic.id,
          level: m.level,
        },
        create: {
          slug: m.slug,
          name: m.name,
          description: m.description,
          tier: m.tier,
          xpPoints: m.xpPoints,
          orderIndex: m.orderIndex,
          topicId: topic.id,
          level: m.level,
        },
      });

      // Recreate slides
      await prisma.learningSlide.deleteMany({ where: { moduleId: dbModule.id } });
      if (m.slides.length > 0) {
        await prisma.learningSlide.createMany({
          data: m.slides.map((s, i) => ({
            moduleId: dbModule.id,
            title: s.title,
            layoutType: s.layoutType,
            imageUrl: s.imageUrl,
            bullets: s.bullets,
            orderIndex: i,
          })),
        });
      }

      // Recreate questions
      await prisma.quizQuestion.deleteMany({ where: { moduleId: dbModule.id } });
      if (m.quiz.length > 0) {
        await prisma.quizQuestion.createMany({
          data: m.quiz.map((q, i) => ({
            moduleId: dbModule.id,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            orderIndex: i,
          })),
        });
      }
    }
  }
  console.log('Roadmap data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
