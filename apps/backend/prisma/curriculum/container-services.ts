import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Container Services',
  slug: 'container-services',
  description:
    'Package, run, and orchestrate containerized workloads with ECR, ECS, EKS, and Fargate.',
  orderIndex: 9,
  theme: 'FORGE' as const,
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
    slug: 'ecr_basics',
    name: 'Amazon ECR Basics',
    description:
      'Store, manage, and deploy Docker container images with a fully managed private registry.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'Container Image Registry',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'ECR is a fully managed Docker container registry that stores, manages, and deploys container images.',
          'ECR integrates with ECS, EKS, and Lambda for seamless container deployments.',
          'Image scanning detects vulnerabilities in container images before they are deployed.',
        ],
      },
    ],
    quiz: [
      q(
        'Which AWS service provides a private Docker container registry?',
        ['Docker Hub', 'Amazon ECR', 'GitHub Packages', 'AWS CodeArtifact'],
        1,
        'Amazon ECR is a fully managed Docker container registry that integrates tightly with AWS container services.',
      ),
    ],
  },
  {
    slug: 'ecs_basics',
    name: 'Amazon ECS Basics',
    description:
      'Run and manage Docker containers on a fully managed orchestration service with EC2 or Fargate.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'Elastic Container Service',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'ECS is a container orchestration service that runs Docker containers on EC2 instances or Fargate.',
          'A Task Definition describes container images, CPU, memory, and networking for your application.',
          'Services maintain the desired count of running tasks and integrate with ALB for load balancing.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the difference between ECS launch types EC2 and Fargate?',
        [
          'EC2 is serverless; Fargate requires instance management',
          'EC2 requires managing servers; Fargate is serverless and abstracts infrastructure',
          'They are identical in pricing',
          'Fargate only supports Linux containers',
        ],
        1,
        'With EC2 launch type you manage the underlying instances; Fargate is serverless, abstracting infrastructure management entirely.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'fargate',
    name: 'AWS Fargate',
    description:
      'Run containers without provisioning or managing servers using a serverless compute engine.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'Serverless Containers',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Fargate removes the need to provision, configure, and scale clusters of virtual machines.',
          'You pay only for the CPU and memory used by your containers with no idle capacity charges.',
          'Fargate supports both ECS and EKS for running containers without managing infrastructure.',
        ],
      },
    ],
    quiz: [
      q(
        'What does Fargate eliminate compared to the EC2 launch type?',
        [
          'The need to write Dockerfiles',
          'The need to provision, manage, and scale container instances',
          'The need for IAM roles',
          'The need for container images',
        ],
        1,
        'Fargate abstracts the underlying infrastructure entirely, so you don\'t need to provision, patch, or scale EC2 instances for your containers.',
      ),
    ],
  },
  {
    slug: 'eks_basics',
    name: 'Amazon EKS Basics',
    description:
      'Run Kubernetes clusters on AWS with a managed control plane and worker node scaling.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'Managed Kubernetes',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'EKS runs the Kubernetes control plane across multiple AZs for high availability.',
          'Managed node groups automate the provisioning and lifecycle of EC2 instances running Kubernetes.',
          'EKS supports both EC2 and Fargate launch types for running Kubernetes pods.',
        ],
      },
    ],
    quiz: [
      q(
        'What makes EKS different from self-managed Kubernetes on EC2?',
        [
          'EKS runs a different version of Kubernetes',
          'EKS manages the Kubernetes control plane with high availability across AZs',
          'EKS does not support Docker containers',
          'EKS is only available in us-east-1',
        ],
        1,
        'EKS runs the Kubernetes control plane across three Availability Zones automatically, handling patching, upgrades, and redundancy.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'ecs_advanced',
    name: 'ECS Advanced Patterns',
    description:
      'Implement advanced ECS patterns with service discovery, blue/green deployments, and task placement.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Advanced ECS Orchestration',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Service Connect provides service discovery and load balancing across ECS services using DNS or HTTP.',
          'Blue/green deployments with CodeDeploy shift traffic gradually, enabling instant rollback on failure.',
          'Task placement strategies optimize for availability (spread across AZs) or cost (pack onto fewer instances).',
        ],
      },
    ],
    quiz: [
      q(
        'What does ECS Service Connect provide?',
        [
          'Automatic container image builds',
          'Service discovery and load balancing across ECS services',
          'EC2 instance management',
          'Database migration tools',
        ],
        1,
        'Service Connect enables service discovery via DNS names and provides integrated load balancing, making inter-service communication seamless.',
      ),
    ],
  },
  {
    slug: 'eks_advanced',
    name: 'EKS Advanced Patterns',
    description:
      'Optimize Kubernetes clusters with node autoscaling, pod security policies, and multi-cluster strategies.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'Production Kubernetes on AWS',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Karpenter automatically provisions right-sized compute resources based on pod scheduling requirements.',
          'Pod Security Standards and admission controllers enforce security policies on pod creation.',
          'EKS Anywhere extends Kubernetes to on-premises data centers using the same operational tooling.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the primary benefit of Karpenter over the standard Cluster Autoscaler?',
        [
          'Karpenter supports more Kubernetes versions',
          'Karpenter directly provisions compute resources based on pod requirements without intermediate node groups',
          'Karpenter is free while Cluster Autoscaler costs extra',
          'Karpenter only works with Fargate',
        ],
        1,
        'Karpenter bypasses node groups and directly provisions compute resources based on pod requirements, enabling faster scaling and better cost optimization.',
      ),
    ],
  },
];
