import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Cost Management & Optimization',
  slug: 'cost-management',
  description:
    'Monitor, analyze, and optimize cloud spending with budgets, pricing tools, and reserved capacity.',
  orderIndex: 10,
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
    slug: 'billing_basics',
    name: 'AWS Billing Basics',
    description:
      'Understand AWS pricing models, the billing console, and how to set up cost allocation tags.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'Understanding AWS Pricing',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'AWS uses a pay-as-you-go pricing model with no upfront costs or long-term commitments required.',
          'Cost allocation tags let you categorize and track AWS costs by project, team, or environment.',
          'The Billing Dashboard provides a real-time summary of your current charges and forecast.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the primary benefit of AWS pay-as-you-go pricing?',
        [
          'You get a fixed monthly bill regardless of usage',
          'You only pay for what you use with no upfront commitment',
          'AWS provides free resources to all accounts',
          'Pricing is the same across all regions',
        ],
        1,
        'Pay-as-you-go means you are billed only for the services you consume, with no upfront investment or termination fees.',
      ),
    ],
  },
  {
    slug: 'budgets_basics',
    name: 'AWS Budgets Basics',
    description:
      'Set custom cost, usage, and reservation budgets with alerts to stay informed about spending.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'Cost Budgets and Alerts',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'AWS Budgets lets you set custom budgets for cost, usage, or reservation utilization.',
          'Alerts are sent via SNS, email, or Amazon Chime when thresholds are exceeded.',
          'Budget actions can automatically trigger SCP changes, IAM policy changes, or instance stop/terminate.',
        ],
      },
    ],
    quiz: [
      q(
        'What can AWS Budgets automatically trigger when a cost threshold is exceeded?',
        [
          'New EC2 instances',
          'Budget actions like stopping instances or changing IAM policies',
          'Database backups',
          'Auto Scaling policies',
        ],
        1,
        'Budget actions can automate responses to cost overruns by triggering instance stop/start, Lambda functions, or IAM policy changes.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'cost_explorer',
    name: 'AWS Cost Explorer',
    description:
      'Visualize and analyze your AWS spending patterns with charts, forecasts, and recommendations.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'Cost Analysis and Forecasting',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Cost Explorer provides interactive charts to visualize spending by service, region, account, or tag.',
          'Forecasting predicts future costs based on historical usage patterns and seasonal trends.',
          'Rightsizing recommendations identify underutilized resources and suggest optimal instance types.',
        ],
      },
    ],
    quiz: [
      q(
        'Which Cost Explorer feature predicts future AWS spending based on historical patterns?',
        ['Rightsizing recommendations', 'Cost forecasting', 'Tag editor', 'Budget alerts'],
        1,
        'Cost forecasting analyzes historical spending patterns to project future costs, helping you plan budgets proactively.',
      ),
    ],
  },
  {
    slug: 'reserved_instances',
    name: 'Reserved Instances & Savings Plans',
    description:
      'Save up to 72% on compute costs by committing to usage over one or three years.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'Commitment-Based Savings',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Reserved Instances provide significant discounts for 1 or 3 year commitments on specific instance types.',
          'Compute Savings Plans offer flexibility across EC2, Fargate, and Lambda with automatic price adjustments.',
          'The RI Utilization Report shows how effectively your reserved instances are being used.',
        ],
      },
    ],
    quiz: [
      q(
        'How do Savings Plans differ from traditional Reserved Instances?',
        [
          'Savings Plans are always cheaper',
          'Savings Plans offer broader flexibility across multiple services instead of specific instance types',
          'Savings Plans require no commitment',
          'Savings Plans only apply to EC2',
        ],
        1,
        'Savings Plans provide discounts in exchange for a usage commitment (e.g., $10/hour) while automatically applying across EC2, Fargate, and Lambda.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'trusted_advisor',
    name: 'AWS Trusted Advisor',
    description:
      'Get automated recommendations for cost optimization, security, performance, and fault tolerance.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Automated Best Practice Checks',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Trusted Advisor inspects your AWS environment and makes recommendations across five categories.',
          'Cost Optimization checks identify idle resources, unused reservations, and over-provisioned instances.',
          'Business and Enterprise Support plans provide full Trusted Advisor checks with email alerts.',
        ],
      },
    ],
    quiz: [
      q(
        'Which Trusted Advisor category identifies underutilized EC2 instances and unused Elastic IPs?',
        ['Security', 'Fault Tolerance', 'Cost Optimization', 'Performance'],
        2,
        'Cost Optimization checks flag idle resources, unused reservations, and over-provisioned instances to reduce waste.',
      ),
    ],
  },
  {
    slug: 'finops',
    name: 'FinOps Practices',
    description:
      'Implement a FinOps framework to align cloud spending with business value through cultural and technical practices.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'Cloud Financial Management',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'FinOps combines technology, finance, and business practices to maximize cloud business value.',
          'Unit economics measures cost per user, transaction, or feature to connect cloud spend with revenue.',
          'Showback and chargeback models make cloud costs visible to individual teams, driving accountability.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the primary goal of the FinOps framework?',
        [
          'To eliminate all cloud costs',
          'To maximize the business value derived from every dollar of cloud spend',
          'To move all workloads to on-premises',
          'To reduce cloud spend by 50% regardless of business impact',
        ],
        1,
        'FinOps is about maximizing the value of cloud investment by making cost a shared responsibility across engineering, finance, and business teams.',
      ),
    ],
  },
];
