import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Security & Compliance',
  slug: 'security-compliance',
  description:
    'Protect cloud workloads with encryption, threat detection, web application firewalling, and compliance automation.',
  orderIndex: 4,
  theme: 'CRYSTAL' as const,
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
    slug: 'kms_basics',
    name: 'AWS KMS Basics',
    description:
      'Encrypt data at rest and in transit using managed encryption keys with AWS Key Management Service.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'Encryption Key Management',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'AWS KMS creates and manages cryptographic keys used to encrypt data across AWS services.',
          'Customer Managed Keys (CMKs) give you full control over key policies, rotation, and auditing.',
          'KMS integrates with S3, EBS, RDS, Lambda, and dozens of other AWS services for transparent encryption.',
        ],
      },
    ],
    quiz: [
      q(
        'Who manages the underlying hardware security modules (HSMs) for AWS-managed KMS keys?',
        ['The customer', 'AWS', 'A third-party auditor', 'The IAM admin'],
        1,
        'AWS manages the HSMs that protect KMS keys. Customers control access through key policies and IAM permissions.',
      ),
    ],
  },
  {
    slug: 'waf_basics',
    name: 'AWS WAF Basics',
    description:
      'Filter and block malicious web requests targeting your applications with a managed web application firewall.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'Web Application Firewall',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'AWS WAF protects against common web exploits like SQL injection and cross-site scripting (XSS).',
          'Rules can match on IP addresses, HTTP headers, URI strings, or managed rule groups.',
          'WAF integrates with CloudFront, ALB, API Gateway, and AppSync for edge protection.',
        ],
      },
    ],
    quiz: [
      q(
        'Which of the following attacks can AWS WAF help prevent?',
        [
          'DDoS attacks at Layer 3',
          'SQL injection and cross-site scripting',
          'Man-in-the-middle attacks on VPC traffic',
          'Phishing emails to end users',
        ],
        1,
        'AWS WAF inspects HTTP/HTTPS requests at Layer 7 and can block SQL injection, XSS, and other OWASP Top 10 vulnerabilities.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'guardduty',
    name: 'Amazon GuardDuty',
    description:
      'Detect threats and malicious activity across your AWS accounts using intelligent threat detection.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'Intelligent Threat Detection',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'GuardDuty analyzes CloudTrail, VPC Flow Logs, DNS logs, and EKS audit logs to detect anomalies.',
          'Machine learning models identify unauthorized behavior, credential compromises, and data exfiltration.',
          'Findings are prioritized by severity and can trigger automated remediation via EventBridge.',
        ],
      },
    ],
    quiz: [
      q(
        'Which data sources does GuardDuty analyze for threat detection?',
        [
          'Only CloudTrail logs',
          'Only VPC Flow Logs',
          'CloudTrail, VPC Flow Logs, DNS logs, and EKS audit logs',
          'Only S3 access logs',
        ],
        2,
        'GuardDuty ingests and correlates logs from multiple sources including CloudTrail, VPC Flow Logs, DNS logs, and EKS audit logs for comprehensive threat detection.',
      ),
    ],
  },
  {
    slug: 'security_hub',
    name: 'AWS Security Hub',
    description:
      'Aggregate and prioritize security findings from multiple AWS services and third-party tools.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'Centralized Security Posture',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Security Hub provides a single pane of glass for security findings across GuardDuty, Inspector, Macie, and IAM Access Analyzer.',
          'It runs continuous compliance checks against industry standards like CIS Benchmarks and AWS Foundational Security Best Practices.',
          'The Security Score dashboard shows your overall security posture and highlights areas needing attention.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the primary benefit of AWS Security Hub?',
        [
          'It replaces all other security services',
          'It provides a centralized view of security findings and compliance status across AWS accounts',
          'It only monitors IAM users',
          'It encrypts all data at rest automatically',
        ],
        1,
        'Security Hub aggregates findings from multiple security services, runs compliance checks, and provides a centralized dashboard for security posture management.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'security_hub_advanced',
    name: 'Security Hub Advanced',
    description:
      'Automate remediation workflows, custom insights, and cross-account security governance.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Automated Security Remediation',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Security Hub custom insights let you group and filter findings by your own criteria beyond the default views.',
          'Automated response rules use EventBridge to trigger Lambda functions or Systems Manager runbooks on findings.',
          'Cross-account aggregation allows security teams to monitor findings from multiple AWS Organizations accounts.',
        ],
      },
    ],
    quiz: [
      q(
        'How can Security Hub findings automatically trigger remediation actions?',
        [
          'By emailing the security team manually',
          'By creating CloudWatch alarms only',
          'By using EventBridge rules to invoke Lambda or Systems Manager runbooks',
          'By requiring manual console intervention for every finding',
        ],
        2,
        'EventBridge rules can match on Security Hub findings by severity or type and automatically trigger Lambda functions or SSM Runbooks for remediation.',
      ),
    ],
  },
  {
    slug: 'secrets_manager',
    name: 'AWS Secrets Manager',
    description:
      'Securely store, rotate, and manage database credentials, API keys, and other secrets at scale.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'Secrets Management and Rotation',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Secrets Manager automatically rotates secrets on a schedule using AWS Lambda rotation functions.',
          'It integrates with RDS, Redshift, DocumentDB, and other services for transparent credential rotation.',
          'Fine-grained access control via IAM policies and resource-based policies determines who can retrieve secrets.',
        ],
      },
    ],
    quiz: [
      q(
        'Which feature of Secrets Manager automatically changes stored credentials on a schedule?',
        [
          'Encryption at rest',
          'Automatic rotation using Lambda functions',
          'Cross-region replication',
          'Resource-based policies',
        ],
        1,
        'Secrets Manager can automatically rotate secrets using Lambda rotation functions on a defined schedule, reducing the risk of compromised credentials.',
      ),
    ],
  },
];
