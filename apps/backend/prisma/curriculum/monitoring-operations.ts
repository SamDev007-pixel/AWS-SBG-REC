import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Monitoring & Operations',
  slug: 'monitoring-operations',
  description:
    'Observe, debug, and automate operational tasks across your AWS infrastructure with visibility and control.',
  orderIndex: 7,
  theme: 'CITADEL' as const,
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
    slug: 'cloudwatch_basics',
    name: 'Amazon CloudWatch Basics',
    description:
      'Monitor AWS resources and applications with metrics, logs, and alarms for operational visibility.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'CloudWatch Metrics and Alarms',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'CloudWatch collects metrics from AWS services like EC2, RDS, Lambda, and custom namespaces.',
          'Alarms watch a single metric over time and trigger actions when thresholds are breached.',
          'CloudWatch Logs aggregates log files from EC2, Lambda, and other services into a searchable store.',
        ],
      },
    ],
    quiz: [
      q(
        'What does a CloudWatch alarm do when a metric breaches its threshold?',
        [
          'It automatically terminates the resource',
          'It triggers a predefined action like SNS notification or Auto Scaling',
          'It creates a new metric',
          'It restarts the monitored service',
        ],
        1,
        'CloudWatch alarms trigger actions such as sending SNS notifications, invoking Lambda functions, or changing Auto Scaling group capacity.',
      ),
    ],
  },
  {
    slug: 'cloudtrail_basics',
    name: 'AWS CloudTrail Basics',
    description:
      'Log and audit all API calls across your AWS account for governance and compliance.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'API Activity Logging',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'CloudTrail records who did what, when, and from where for every API call in your AWS account.',
          'Management events capture control-plane operations like creating VPCs or launching instances.',
          'Data events capture data-plane operations like S3 GetObject or Lambda function invocations.',
        ],
      },
    ],
    quiz: [
      q(
        'Which type of CloudTrail event captures actions like "RunInstances" and "CreateBucket"?',
        ['Data events', 'Management events', 'Insight events', 'Custom events'],
        1,
        'Management events record API calls that create, modify, or delete AWS resources (control-plane operations).',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'cloudwatch_advanced',
    name: 'CloudWatch Advanced',
    description:
      'Create dashboards, use Logs Insights queries, and set up composite alarms for complex monitoring.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'Dashboards and Logs Insights',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'CloudWatch Dashboards visualize metrics from multiple services in a single customizable view.',
          'Logs Insights provides a SQL-like query language to search and analyze log data in real time.',
          'Composite alarms combine multiple alarms to reduce notification noise and trigger only on complex conditions.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the purpose of CloudWatch Logs Insights?',
        [
          'To store metrics permanently',
          'To query and analyze log data using a SQL-like syntax',
          'To replace CloudTrail for API logging',
          'To provision new EC2 instances',
        ],
        1,
        'Logs Insights lets you interactively search and analyze log data using a purpose-built query language, without provisioning infrastructure.',
      ),
    ],
  },
  {
    slug: 'xray',
    name: 'AWS X-Ray',
    description:
      'Trace requests through distributed applications to identify performance bottlenecks and errors.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'Distributed Tracing with X-Ray',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'X-Ray traces a request from the entry point through all downstream services to identify latency.',
          'Service maps visualize the relationships between microservices and show error rates and latency.',
          'X-Ray segments capture timing data, annotations, and metadata for each service in the request path.',
        ],
      },
    ],
    quiz: [
      q(
        'What does X-Ray provide that CloudWatch Metrics alone cannot?',
        [
          'CPU utilization per instance',
          'End-to-end request tracing across multiple services',
          'Log file storage',
          'Automatic resource scaling',
        ],
        1,
        'X-Ray provides distributed tracing that follows a request across service boundaries, showing latency at each hop — something individual CloudWatch metrics cannot show.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'systems_manager',
    name: 'AWS Systems Manager',
    description:
      'Automate operational tasks, patch instances, and manage configurations across your fleet.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Fleet Management and Automation',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Systems Manager Session Manager provides secure shell access to instances without opening SSH ports.',
          'Patch Manager automates OS patching across EC2 instances and on-premises servers on a schedule.',
          'State Manager ensures instances maintain a desired configuration baseline across your fleet.',
        ],
      },
    ],
    quiz: [
      q(
        'Which Systems Manager feature eliminates the need to open inbound SSH ports for instance access?',
        ['Parameter Store', 'Patch Manager', 'Session Manager', 'State Manager'],
        2,
        'Session Manager provides browser-based and CLI shell access to instances over HTTPS (port 443), eliminating the need for SSH key management and port 22 access.',
      ),
    ],
  },
  {
    slug: 'operational_excellence',
    name: 'Operational Excellence',
    description:
      'Implement AWS Well-Architected operational best practices for reliability, automation, and incident response.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'Well-Architected Operational Pillar',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Runbooks automate common operational procedures, reducing human error during incidents.',
          'Chaos engineering with Fault Injection Simulator tests resilience by injecting real-world failures.',
          'Incident response playbooks define step-by-step procedures for detecting, triaging, and resolving incidents.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the purpose of AWS Fault Injection Simulator?',
        [
          'To monitor application performance',
          'To simulate real-world failures and test application resilience',
          'To inject code into running instances',
          'To simulate network latency between regions',
        ],
        1,
        'Fault Injection Simulator is a fully managed chaos engineering service that intentionally introduces faults into your applications to test resilience and identify issues before they affect customers.',
      ),
    ],
  },
];
