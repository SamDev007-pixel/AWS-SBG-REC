import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Cloud Networking',
  slug: 'cloud-networking',
  description:
    'Design and manage virtual networks, DNS routing, content delivery, and hybrid connectivity on AWS.',
  orderIndex: 2,
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
    slug: 'vpc_fundamentals',
    name: 'VPC Fundamentals',
    description:
      'Understand Amazon VPC: subnets, route tables, internet gateways, and how to isolate cloud resources.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'Introduction to Amazon VPC',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Amazon VPC lets you provision a logically isolated section of the AWS Cloud where you can launch resources.',
          'A VPC spans all Availability Zones in a region, giving you high availability by design.',
          'Subnets are ranges of IP addresses within your VPC that can be public or private.',
        ],
      },
    ],
    quiz: [
      q(
        'Which component provides internet access to resources in a public subnet?',
        ['NAT Gateway', 'Internet Gateway', 'VPC Peering', 'Elastic IP'],
        1,
        'An Internet Gateway is a horizontally scaled, redundant component that allows communication between your VPC and the internet.',
      ),
    ],
  },
  {
    slug: 'security_groups',
    name: 'Security Groups & NACLs',
    description:
      'Control inbound and outbound traffic at the instance and subnet level using stateful and stateless firewalls.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'Stateful vs Stateless Firewalls',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Security Groups are stateful: return traffic is automatically allowed regardless of inbound rules.',
          'Network ACLs are stateless: you must explicitly define both inbound and outbound rules.',
          'Security Groups operate at the instance level; NACLs operate at the subnet level.',
        ],
      },
    ],
    quiz: [
      q(
        'Which firewall is stateless and operates at the subnet level?',
        ['Security Group', 'NACL', 'WAF', 'Shield'],
        1,
        'Network ACLs (NACLs) are stateless and evaluate rules in order at the subnet boundary, requiring explicit allow for both inbound and outbound.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'route53',
    name: 'Amazon Route 53',
    description:
      'Manage DNS routing, health checks, and traffic policies for global applications.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'DNS Routing Policies',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Route 53 supports multiple routing policies: simple, weighted, latency-based, failover, and geolocation.',
          'Health checks continuously monitor endpoint availability and automatically remove unhealthy targets.',
          'Route 53 also provides domain registration alongside DNS routing.',
        ],
      },
    ],
    quiz: [
      q(
        'Which Route 53 routing policy distributes traffic across multiple resources based on weights you assign?',
        ['Latency-based', 'Failover', 'Weighted', 'Geolocation'],
        2,
        'Weighted routing lets you assign relative weights to resources, distributing traffic proportionally across endpoints.',
      ),
    ],
  },
  {
    slug: 'cloudfront_cdn',
    name: 'Amazon CloudFront',
    description:
      'Deliver content with low latency globally using AWS Content Delivery Network and edge locations.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'How CloudFront Works',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'CloudFront is a CDN that caches content at edge locations worldwide for low-latency delivery.',
          'An Origin can be an S3 bucket, ALB, EC2, or any custom HTTP backend.',
          'CloudFront integrates with WAF and Shield for security and DDoS protection at the edge.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the origin in a CloudFront distribution?',
        [
          'The edge location serving requests',
          'The cache policy applied to objects',
          'The back-end source of content (S3, ALB, etc.)',
          'The DNS record pointing to CloudFront',
        ],
        2,
        'The origin is the back-end source from which CloudFront fetches content. It can be an S3 bucket, ALB, EC2 instance, or any HTTP server.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'vpc_advanced',
    name: 'Advanced VPC Design',
    description:
      'Architect complex multi-VPC environments with VPC peering, Transit Gateway, and centralized networking.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Transit Gateway and Hybrid Connectivity',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'AWS Transit Gateway connects multiple VPCs and on-premises networks through a single managed gateway.',
          'VPC Peering connects two VPCs but does not support transitive routing across multiple peered VPCs.',
          'Transit Gateway supports IP multicast, route table propagation, and cross-account sharing.',
        ],
      },
    ],
    quiz: [
      q(
        'What is a key limitation of VPC Peering that Transit Gateway solves?',
        [
          'VPC Peering cannot connect across regions',
          'VPC Peering does not support IPv6',
          'VPC Peering does not support transitive routing between multiple VPCs',
          'VPC Peering is limited to a maximum of 2 peerings per VPC',
        ],
        2,
        'VPC Peering creates a 1-to-1 connection. To connect 3 VPCs in a full mesh, you need 3 separate peering connections. Transit Gateway eliminates this with a hub-and-spoke model.',
      ),
    ],
  },
  {
    slug: 'direct_connect',
    name: 'AWS Direct Connect',
    description:
      'Establish dedicated private network connections from on-premises data centers to AWS.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'Direct Connect Architecture',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Direct Connect provides a dedicated 1 Gbps or 10 Gbps network connection from your facility to AWS.',
          'Virtual Interfaces (VIFs) allow you to access VPC resources, AWS public services, or other regions.',
          'Link Aggregation Groups (LAGs) bundle multiple connections for higher throughput and redundancy.',
        ],
      },
    ],
    quiz: [
      q(
        'Which component of Direct Connect provides access to AWS public services like S3 and DynamoDB?',
        ['Private VIF', 'Public VIF', 'Transit VIF', 'Hosted Connection'],
        1,
        'A Public VIF on Direct Connect allows your on-premises network to access AWS public endpoints (S3, DynamoDB, etc.) over the dedicated connection.',
      ),
    ],
  },
];
