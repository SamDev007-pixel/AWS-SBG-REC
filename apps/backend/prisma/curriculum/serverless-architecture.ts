import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Serverless Architecture',
  slug: 'serverless-architecture',
  description:
    'Build event-driven, fully serverless applications with APIs, workflows, and message-driven decoupling.',
  orderIndex: 5,
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
    slug: 'api_gateway',
    name: 'Amazon API Gateway',
    description:
      'Create, publish, and manage RESTful and WebSocket APIs with throttling, caching, and authorization.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'API Gateway Overview',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'API Gateway handles request routing, authorization, throttling, and response transformation.',
          'REST APIs support request validation, caching, and custom domain names with TLS certificates.',
          'HTTP APIs are a lighter-weight, lower-cost option for proxying to Lambda or HTTP endpoints.',
        ],
      },
    ],
    quiz: [
      q(
        'Which API Gateway type is more cost-effective for simple Lambda proxy integrations?',
        ['REST API', 'HTTP API', 'WebSocket API', 'GraphQL API'],
        1,
        'HTTP APIs are designed for lightweight proxy use cases and are up to 71% cheaper than REST APIs for simple Lambda integrations.',
      ),
    ],
  },
  {
    slug: 'sqs_sns',
    name: 'SQS & SNS',
    description:
      'Decouple microservices and build event-driven architectures with queues and pub/sub messaging.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'Messaging and Queuing Patterns',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Amazon SQS is a managed message queue that decouples producers and consumers for reliable delivery.',
          'SNS is a pub/sub notification service that fans out messages to multiple subscribers simultaneously.',
          'Combining SNS with SQS creates a powerful fan-out pattern: one message published to SNS is delivered to multiple SQS queues.',
        ],
      },
    ],
    quiz: [
      q(
        'Which pattern allows one message to be delivered to multiple downstream consumers simultaneously?',
        ['Point-to-point queue', 'SNS fan-out', 'Request-reply', 'Polling'],
        1,
        'SNS fan-out publishes a message to multiple subscribed endpoints (SQS queues, Lambda functions, HTTP endpoints) simultaneously.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'step_functions',
    name: 'AWS Step Functions',
    description:
      'Orchestrate complex multi-step workflows visually with built-in error handling and retries.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'Workflow Orchestration',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Step Functions coordinate multiple AWS services into serverless workflows using JSON-based Amazon States Language.',
          'Standard workflows provide exactly-once execution for long-running, non-idempotent operations.',
          'Express workflows offer high-throughput, at-least-once execution for event processing and streaming.',
        ],
      },
    ],
    quiz: [
      q(
        'What language does Step Functions use to define workflow state machines?',
        ['Terraform HCL', 'Amazon States Language (ASL)', 'YAML CloudFormation', 'Python'],
        1,
        'Amazon States Language (ASL) is a JSON-based language that defines state machines with states, transitions, and error handling.',
      ),
    ],
  },
  {
    slug: 'eventbridge',
    name: 'Amazon EventBridge',
    description:
      'Build event-driven architectures with a serverless event bus that routes events between AWS services and applications.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'Event-Driven Architectures',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'EventBridge routes events from AWS services, your apps, and SaaS partners to targets like Lambda, Step Functions, or SQS.',
          'Event rules filter and match events using content-based filtering on event data.',
          'Scheduled rules trigger targets on a cron or rate schedule without additional infrastructure.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the key advantage of EventBridge over directly calling Lambda from an S3 event?',
        [
          'EventBridge is faster',
          'EventBridge enables one-to-many fan-out with filtering without modifying the source',
          'EventBridge provides encryption at rest',
          'EventBridge is free for all use cases',
        ],
        1,
        'EventBridge acts as a central event bus that can route a single event to multiple targets with different filtering rules, without coupling the event source to each consumer.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'serverless_patterns',
    name: 'Serverless Design Patterns',
    description:
      'Architect production-grade serverless applications with idempotency, saga patterns, and async processing.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Advanced Serverless Patterns',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'The Saga pattern orchestrates distributed transactions across multiple services with compensating actions on failure.',
          'Idempotency keys ensure duplicate events do not cause side effects in downstream processing.',
          'The Strangler Fig pattern gradually replaces monolith components with serverless functions without downtime.',
        ],
      },
    ],
    quiz: [
      q(
        'In the Saga pattern, what happens when a step in a distributed transaction fails?',
        [
          'The entire system halts permanently',
          'Compensating transactions undo previously completed steps',
          'The failed step is retried indefinitely',
          'Only the failed step is logged and ignored',
        ],
        1,
        'The Saga pattern executes compensating transactions (rollback actions) for each previously completed step when a failure occurs.',
      ),
    ],
  },
  {
    slug: 'serverless_monitoring',
    name: 'Serverless Observability',
    description:
      'Monitor, trace, and debug serverless applications with X-Ray, CloudWatch, and structured logging.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'Distributed Tracing and Logging',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'AWS X-Ray traces requests across Lambda functions, API Gateway, and downstream services to visualize service maps.',
          'CloudWatch Logs Insights provides SQL-like queries across Lambda logs for fast debugging.',
          'Structured logging with JSON format enables automated filtering and alarming on specific fields.',
        ],
      },
    ],
    quiz: [
      q(
        'Which AWS service provides end-to-end distributed tracing for serverless applications?',
        ['CloudWatch Metrics', 'AWS X-Ray', 'AWS Config', 'CloudTrail'],
        1,
        'AWS X-Ray captures request traces across distributed services, showing latency, errors, and service dependencies in a visual service map.',
      ),
    ],
  },
];
