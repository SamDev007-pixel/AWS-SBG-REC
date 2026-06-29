import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Database Services',
  slug: 'database-services',
  description:
    'Choose, configure, and optimize relational, NoSQL, and in-memory databases on AWS.',
  orderIndex: 3,
  theme: 'HARBOR' as const,
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
    slug: 'rds_basics',
    name: 'Amazon RDS Basics',
    description:
      'Launch and manage relational databases in the cloud with automated backups, patching, and multi-AZ deployment.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'Relational Database Service Overview',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Amazon RDS supports engines including MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Aurora.',
          'Multi-AZ deployments provide high availability with automatic failover to a standby replica.',
          'Automated backups retain your database for up to 35 days with point-in-time recovery.',
        ],
      },
    ],
    quiz: [
      q(
        'Which RDS feature provides automatic failover to a standby instance in a different Availability Zone?',
        ['Read Replicas', 'Multi-AZ Deployment', 'Snapshot Restore', 'Parameter Groups'],
        1,
        'Multi-AZ deployments maintain a synchronous standby replica in a different AZ, enabling automatic failover in case of primary failure.',
      ),
    ],
  },
  {
    slug: 'dynamodb_basics',
    name: 'Amazon DynamoDB Basics',
    description:
      'Build serverless NoSQL tables with single-digit millisecond performance at any scale.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'NoSQL with DynamoDB',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'DynamoDB is a fully managed key-value and document database with predictable performance.',
          'Tables store items (rows) composed of attributes (columns), with a primary key for unique identification.',
          'On-demand capacity mode automatically scales read and write capacity without provisioning.',
        ],
      },
    ],
    quiz: [
      q(
        'What are the two primary key types supported by DynamoDB?',
        [
          'Hash key only and Range key only',
          'Simple primary key and composite primary key',
          'Primary key and Foreign key',
          'Partition key and Sort key (used together only)',
        ],
        1,
        'DynamoDB supports a simple primary key (partition key only) and a composite primary key (partition key + sort key) for flexible data modeling.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'aurora_serverless',
    name: 'Amazon Aurora Serverless',
    description:
      'Use auto-scaling relational databases that start and stop based on application demand.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'Aurora Serverless Architecture',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Aurora Serverless v2 scales capacity automatically based on application demand in fine-grained increments.',
          'Aurora is compatible with MySQL and PostgreSQL while offering up to 5x the throughput of standard MySQL.',
          'Serverless v2 supports read replicas, global databases, and backtracking for quick recovery.',
        ],
      },
    ],
    quiz: [
      q(
        'How does Aurora Serverless v2 handle scaling?',
        [
          'Scales in fixed increments (small, medium, large)',
          'Scales automatically in fine-grained ACU increments based on demand',
          'Requires manual resizing of the instance type',
          'Only scales read capacity, not write capacity',
        ],
        1,
        'Aurora Serverless v2 scales capacity up and down in fine-grained increments (as little as 0.5 ACUs) based on real-time application demand.',
      ),
    ],
  },
  {
    slug: 'elasticache',
    name: 'Amazon ElastiCache',
    description:
      'Accelerate application performance with in-memory caching using Redis or Memcached.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'In-Memory Caching Patterns',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'ElastiCache supports Redis (feature-rich, persistence, replication) and Memcached (simple, multi-threaded).',
          'Cache-aside pattern: the application checks the cache first, then falls back to the database on miss.',
          'Redis supports data structures like strings, hashes, lists, sets, and sorted sets.',
        ],
      },
    ],
    quiz: [
      q(
        'Which ElastiCache engine supports data persistence and replication?',
        ['Memcached', 'Redis', 'Both equally', 'Neither'],
        1,
        'Redis supports snapshots and append-only files for persistence, plus replica shards for read scaling and failover.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'dynamodb_advanced',
    name: 'DynamoDB Advanced',
    description:
      'Master global tables, DynamoDB Streams, DAX, and single-table design patterns.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Global Tables and DAX',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'DynamoDB Global Tables provide a fully managed multi-region, multi-active database with millisecond replication.',
          'DynamoDB Accelerator (DAX) is an in-memory caching layer that delivers microsecond read latency.',
          'DynamoDB Streams capture a time-ordered sequence of item-level modifications for event-driven architectures.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the primary purpose of DynamoDB Accelerator (DAX)?',
        [
          'To provide multi-region replication',
          'To enable event-driven triggers on data changes',
          'To deliver microsecond read latency through in-memory caching',
          'To encrypt data at rest automatically',
        ],
        2,
        'DAX sits in front of DynamoDB tables, caching frequently read items in memory to provide microsecond response times for read-heavy workloads.',
      ),
    ],
  },
  {
    slug: 'rds_performance',
    name: 'RDS Performance Tuning',
    description:
      'Optimize relational database performance with parameter groups, read replicas, and query analysis.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'Database Performance Optimization',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Parameter Groups allow you to tune database engine settings like buffer pools, query cache, and connections.',
          'Read Replicas offload read traffic from the primary instance, improving throughput for read-heavy workloads.',
          'Performance Insights provides a dashboard to identify bottlenecks in database queries and wait events.',
        ],
      },
    ],
    quiz: [
      q(
        'Which feature provides a visual analysis of database load and query performance over time?',
        ['CloudWatch Metrics', 'Performance Insights', 'AWS Config', 'Trusted Advisor'],
        1,
        'Performance Insights offers a real-time dashboard showing database load, top SQL queries, and wait events to quickly identify performance bottlenecks.',
      ),
    ],
  },
];
