import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Migration & Transfer',
  slug: 'migration-transfer',
  description:
    'Plan and execute cloud migrations with automated tools for databases, applications, and large-scale data.',
  orderIndex: 11,
  theme: 'TECH' as const,
};

const LETTERS = ['A', 'B', 'C', 'D'] as const;

function q(
  question: string,
  options: string[],
  answerIndex: number,
  explanation: string,
): CurriculumQuiz {
  return {
    question,
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    optionD: options[3],
    correctAnswer: LETTERS[answerIndex],
    explanation,
  };
}

export const CURRICULUM_MODULES: CurriculumModule[] = [
  // ── BEGINNER (orderIndex 0-1) ─────────────────────────────────
  {
    slug: 'dms_basics',
    name: 'AWS DMS Basics',
    description:
      'Migrate databases to AWS with minimal downtime using Database Migration Service.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'Database Migration Service',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'AWS DMS migrates databases to AWS with minimal downtime using continuous data replication.',
          'DMS supports homogeneous migrations (e.g., Oracle to Oracle) and heterogeneous (e.g., Oracle to Aurora).',
          'A replication instance runs the migration tasks, handling ongoing change data capture (CDC).',
        ],
      },
    ],
    quiz: [
      q(
        'What type of database migration keeps the source database fully operational during the process?',
        ['Offline migration', 'Lift-and-shift only', 'Continuous data replication', 'Schema-only migration'],
        2,
        'DMS uses ongoing change data capture (CDC) to replicate data while the source database remains active, minimizing downtime.',
      ),
    ],
  },
  {
    slug: 'migration_hub',
    name: 'AWS Migration Hub',
    description:
      'Track and manage your application migrations across AWS and partner tools from a central dashboard.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'Central Migration Tracking',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Migration Hub provides a central location to track the progress of applications being migrated.',
          'It integrates with DMS, Application Migration Service (MGN), and over 50 partner tools.',
          'Migration status groups track the overall progress of individual applications across multiple tools.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the primary purpose of AWS Migration Hub?',
        [
          'To automatically migrate all servers',
          'To provide a central dashboard for tracking migration progress across tools and services',
          'To replace DMS for database migrations',
          'To manage production workloads after migration',
        ],
        1,
        'Migration Hub aggregates migration status from multiple AWS services and partner tools, giving you a single pane of glass for tracking progress.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'mgn',
    name: 'Application Migration Service',
    description:
      'Lift-and-shift servers to AWS using automated replication with minimal source impact.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'Automated Server Migration',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Application Migration Service (MGN) automates lift-and-shift migrations from physical, virtual, or cloud servers.',
          'Continuous replication keeps the source and target in sync until you cut over to AWS.',
          'MGN converts source servers to optimized EC2 instances during the conversion phase.',
        ],
      },
    ],
    quiz: [
      q(
        'What happens during the conversion phase of an MGN migration?',
        [
          'The source server is shut down',
          'The replicated data is converted into properly formatted EC2 instances',
          'The replication agent is uninstalled',
          'A new VPC is created automatically',
        ],
        1,
        'During conversion, MGN takes the replicated data and creates properly configured EC2 instances with the right instance types and networking.',
      ),
    ],
  },
  {
    slug: 'datasync',
    name: 'AWS DataSync',
    description:
      'Transfer large datasets between on-premises, edge, and AWS storage at speeds up to 10x faster than open-source tools.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'High-Speed Data Transfer',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'DataSync transfers data between NFS/SMB file systems and S3, EFS, or FSx at up to 10 Gbps.',
          'Built-in data validation ensures transferred data matches the source with integrity verification.',
          'Incremental transfers sync only changed data, reducing transfer time and bandwidth usage.',
        ],
      },
    ],
    quiz: [
      q(
        'How does DataSync optimize data transfers for large datasets?',
        [
          'It compresses all files to 10% of their original size',
          'It transfers only changed data incrementally after the initial full transfer',
          'It uses a proprietary protocol that replaces TCP/IP',
          'It only transfers metadata, not actual file contents',
        ],
        1,
        'After the initial full transfer, DataSync performs incremental transfers, syncing only data that has changed to minimize transfer time.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'migration_planning',
    name: 'Migration Planning',
    description:
      'Assess workloads, build a migration business case, and plan a multi-wave migration strategy.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Migration Strategy and Planning',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'The Migration Acceleration Program (MAP) provides tools, training, and credits for large-scale migrations.',
          'The 7 Rs of migration (Rehost, Replatform, Repurchase, Refactor, Retire, Retain, Relocate) guide workload disposition.',
          'Wave-based migration plans group applications by dependency and risk for phased, controlled execution.',
        ],
      },
    ],
    quiz: [
      q(
        'Which of the following is one of the 7 Rs of migration?',
        [
          'Redesign',
          'Rehost (lift-and-shift)',
          'Rebuild from scratch',
          'Redirect',
        ],
        1,
        'The 7 Rs include Rehost (lift-and-shift), Replatform (move with optimization), Repurchase (switch to SaaS), Refactor, Retire, Retain, and Relocate.',
      ),
    ],
  },
  {
    slug: 'disaster_recovery',
    name: 'Disaster Recovery on AWS',
    description:
      'Design and implement disaster recovery strategies from backup and restore to multi-site active-active.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'DR Strategy Patterns',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Backup and Restore is the simplest DR strategy with RTO in hours and lowest cost.',
          'Pilot Light keeps core services running in DR region with minimal cost, scaling up during failover.',
          'Warm Standby maintains a scaled-down but fully functional environment for faster failover.',
        ],
      },
    ],
    quiz: [
      q(
        'Which DR strategy provides the fastest recovery time with near-zero data loss?',
        [
          'Backup and Restore',
          'Pilot Light',
          'Multi-site Active-Active',
          'Warm Standby',
        ],
        2,
        'Multi-site Active-Active runs fully scaled production environments in multiple regions simultaneously, providing the fastest failover with near-zero data loss.',
      ),
    ],
  },
];
