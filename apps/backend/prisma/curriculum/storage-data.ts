import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Storage & Data Management',
  slug: 'storage-data',
  description:
    'Select block, file, and hybrid storage solutions and manage large-scale data transfers on AWS.',
  orderIndex: 6,
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
    slug: 'ebs_basics',
    name: 'Amazon EBS Basics',
    description:
      'Provision persistent block storage volumes for EC2 instances with snapshot backup capabilities.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'Elastic Block Store Overview',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'EBS provides persistent block storage that persists independently from the life of an EC2 instance.',
          'Volume types include General Purpose (gp3), Provisioned IOPS (io2), Throughput Optimized (st1), and Cold (sc1).',
          'EBS snapshots are incremental backups stored in S3, allowing point-in-time recovery of entire volumes.',
        ],
      },
    ],
    quiz: [
      q(
        'Which EBS volume type offers the highest IOPS performance for mission-critical databases?',
        ['gp3', 'io2', 'st1', 'sc1'],
        1,
        'io2 volumes deliver up to 64,000 IOPS per volume, designed for latency-sensitive, mission-critical workloads like databases.',
      ),
    ],
  },
  {
    slug: 'efs_basics',
    name: 'Amazon EFS Basics',
    description:
      'Create elastic NFS file systems that automatically grow and shrink with your application needs.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'Elastic File System',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'EFS provides a fully managed NFS file system that can be mounted by multiple EC2 instances simultaneously.',
          'Storage capacity grows and shrinks automatically as you add and remove files, with no provisioning required.',
          'EFS Standard and EFS Infrequent Access storage classes optimize cost based on access patterns.',
        ],
      },
    ],
    quiz: [
      q(
        'How many EC2 instances can mount an EFS file system simultaneously?',
        ['Only one', 'Up to 10', 'Only within the same AZ', 'Thousands across multiple AZs'],
        3,
        'EFS is a shared file system that supports thousands of concurrent connections from EC2 instances across multiple Availability Zones.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'storage_gateway',
    name: 'AWS Storage Gateway',
    description:
      'Connect on-premises applications to cloud storage with a hybrid cloud gateway.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'Hybrid Cloud Storage',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'File Gateway provides NFS and SMB access to S3, caching frequently accessed data on-premises.',
          'Volume Gateway provides cloud-backed iSCSI block storage volumes for on-premises applications.',
          'Tape Gateway replaces physical tape infrastructure with virtual tape library backed by S3 and Glacier.',
        ],
      },
    ],
    quiz: [
      q(
        'Which Storage Gateway type provides NFS/SMB file shares backed by S3?',
        ['Volume Gateway', 'File Gateway', 'Tape Gateway', 'Snowball Gateway'],
        1,
        'File Gateway presents S3 objects as files via NFS or SMB protocols, allowing on-premises applications to use cloud storage transparently.',
      ),
    ],
  },
  {
    slug: 'snow_family',
    name: 'AWS Snow Family',
    description:
      'Transfer massive datasets offline using rugged physical devices when network transfer is impractical.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'Offline Data Transfer',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Snowcone is a small, rugged device for edge computing and data transfer (8 TB to 42 TB).',
          'Snowball Edge Compute Optimized provides compute and storage for remote locations (up to 42 TB).',
          'Snowmobile is a 45-foot shipping container that transfers up to 100 PB of data to AWS.',
        ],
      },
    ],
    quiz: [
      q(
        'Which Snow device is best suited for transferring hundreds of petabytes of data?',
        ['Snowcone', 'Snowball Edge', 'Snowmobile', 'Direct Connect'],
        2,
        'Snowmobile is a 45-foot truck that can transfer up to 100 PB of data, making it ideal for extremely large dataset migrations.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'ebs_advanced',
    name: 'EBS Advanced Features',
    description:
      'Optimize block storage with multi-attach volumes, encryption, and performance monitoring.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Advanced EBS Capabilities',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Multi-Attach lets you attach a single io2 or io1 volume to multiple Nitro-based EC2 instances in the same AZ.',
          'EBS encryption uses KMS customer managed keys to encrypt data at rest with no performance impact.',
          'EBS io2 Block Express delivers sub-millisecond latency and up to 256,000 IOPS per volume.',
        ],
      },
    ],
    quiz: [
      q(
        'Which EBS volume type supports Multi-Attach across multiple EC2 instances?',
        ['gp3', 'st1', 'io2', 'sc1'],
        2,
        'io2 and io1 volumes support Multi-Attach, allowing concurrent access from multiple Nitro-based instances in the same AZ.',
      ),
    ],
  },
  {
    slug: 'data_lifecycle',
    name: 'Data Lifecycle Manager',
    description:
      'Automate snapshot creation, retention, and lifecycle policies for EBS volumes and AMIs.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'Automated Data Lifecycle Management',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'EBS Data Lifecycle Manager automates the creation, retention, and deletion of EBS snapshots and AMIs.',
          'Policies can be scheduled to take snapshots daily, weekly, or monthly with cross-account copying.',
          'Snapshot lifecycle policies can archive snapshots to S3 Glacier Flexible Retrieval for long-term retention at lower cost.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the primary benefit of using EBS Data Lifecycle Manager?',
        [
          'It replaces CloudWatch for monitoring',
          'It automates snapshot retention and lifecycle policies to reduce manual management',
          'It encrypts all EBS volumes automatically',
          'It migrates data between EBS volume types',
        ],
        1,
        'Data Lifecycle Manager automates the creation, retention, and cleanup of EBS snapshots, reducing operational overhead and ensuring compliance with data retention policies.',
      ),
    ],
  },
];
