import type {
  CurriculumSlide,
  CurriculumQuiz,
  CurriculumModule,
} from './aws-roadmap';

export type { CurriculumSlide, CurriculumQuiz, CurriculumModule };

export const TOPIC = {
  name: 'Machine Learning & AI',
  slug: 'machine-learning-ai',
  description:
    'Build, train, and deploy machine learning models and generative AI applications on AWS.',
  orderIndex: 8,
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
    slug: 'ai_practitioner',
    name: 'AI & ML Fundamentals',
    description:
      'Understand core concepts of artificial intelligence, machine learning, and deep learning.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 0,
    slides: [
      {
        title: 'Introduction to AI and ML',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Artificial Intelligence is the broader concept of machines mimicking human intelligence.',
          'Machine Learning is a subset of AI where systems learn from data without explicit programming.',
          'Deep Learning uses neural networks with many layers to learn complex patterns from large datasets.',
        ],
      },
    ],
    quiz: [
      q(
        'Which term describes machines learning patterns from data without being explicitly programmed?',
        ['Artificial Intelligence', 'Machine Learning', 'Data Warehousing', 'Business Intelligence'],
        1,
        'Machine Learning is the field of AI focused on building systems that learn and improve from data experience.',
      ),
    ],
  },
  {
    slug: 'bedrock_basics',
    name: 'Amazon Bedrock Basics',
    description:
      'Access foundation models through a unified API for text generation, image creation, and embeddings.',
    level: 'BEGINNER',
    tier: 'Fundamentals',
    xpPoints: 50,
    orderIndex: 1,
    slides: [
      {
        title: 'Foundation Models with Bedrock',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Amazon Bedrock provides a fully managed service to access foundation models from AI21 Labs, Anthropic, Cohere, Meta, and Amazon.',
          'You can access models via a single API without managing infrastructure or model deployment.',
          'Knowledge Bases for Bedrock enables Retrieval-Augmented Generation (RAG) with your own data.',
        ],
      },
    ],
    quiz: [
      q(
        'What does Amazon Bedrock allow you to do?',
        [
          'Train foundation models from scratch',
          'Access and use foundation models from multiple providers via a single API',
          'Deploy only Amazon Titan models',
          'Run models only on SageMaker instances',
        ],
        1,
        'Bedrock provides a unified API to access foundation models from multiple providers, making it easy to compare and integrate different models.',
      ),
    ],
  },

  // ── INTERMEDIATE (orderIndex 2-3) ─────────────────────────────
  {
    slug: 'sagemaker_basics',
    name: 'Amazon SageMaker Basics',
    description:
      'Build, train, and deploy machine learning models at scale with a fully managed platform.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 2,
    slides: [
      {
        title: 'End-to-End ML with SageMaker',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'SageMaker Studio provides an integrated development environment for building, training, and deploying ML models.',
          'SageMaker Autopilot automatically explores your data, selects algorithms, and tunes hyperparameters.',
          'SageMaker Endpoints host trained models for real-time inference with auto-scaling capabilities.',
        ],
      },
    ],
    quiz: [
      q(
        'Which SageMaker feature automatically selects the best algorithm and tunes hyperparameters?',
        ['SageMaker Canvas', 'SageMaker Autopilot', 'SageMaker JumpStart', 'SageMaker Clarify'],
        1,
        'SageMaker Autopilot explores multiple algorithms and hyperparameter combinations, automatically building the best model for your dataset.',
      ),
    ],
  },
  {
    slug: 'ai_services',
    name: 'AWS AI Services',
    description:
      'Leverage pre-trained AI services for vision, language, search, and personalization without ML expertise.',
    level: 'INTERMEDIATE',
    tier: 'Associate',
    xpPoints: 75,
    orderIndex: 3,
    slides: [
      {
        title: 'Pre-built AI Services',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Amazon Rekognition analyzes images and video for objects, faces, text, and inappropriate content.',
          'Amazon Comprehend extracts sentiment, entities, and key phrases from natural language text.',
          'Amazon Lex powers chatbots and voice assistants with automatic speech recognition and natural language understanding.',
        ],
      },
    ],
    quiz: [
      q(
        'Which AWS service detects sentiment and key phrases from text without building custom ML models?',
        ['Rekognition', 'Comprehend', 'Polly', 'Transcribe'],
        1,
        'Amazon Comprehend uses pre-trained NLP models to analyze text and extract sentiment, entities, key phrases, and language.',
      ),
    ],
  },

  // ── ADVANCED (orderIndex 4-5) ─────────────────────────────────
  {
    slug: 'generative_ai_advanced',
    name: 'Generative AI Advanced',
    description:
      'Build production generative AI applications with agents, fine-tuning, and responsible AI practices.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 4,
    slides: [
      {
        title: 'Production Generative AI',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'Bedrock Agents orchestrate multi-step tasks by connecting foundation models to APIs and data sources.',
          'Fine-tuning adapts foundation models to your domain-specific data for improved accuracy.',
          'Guardrails for Bedrock filter harmful content and enforce safety policies on model outputs.',
        ],
      },
    ],
    quiz: [
      q(
        'What is the purpose of Bedrock Guardrails?',
        [
          'To train new foundation models',
          'To filter harmful content and enforce safety policies on model outputs',
          'To deploy models to edge devices',
          'To manage IAM permissions for Bedrock',
        ],
        1,
        'Bedrock Guardrails apply content filters, denied topics, and word filters to ensure foundation model outputs are safe and aligned with your policies.',
      ),
    ],
  },
  {
    slug: 'ml_ops',
    name: 'MLOps on AWS',
    description:
      'Automate the ML lifecycle with CI/CD pipelines, model monitoring, and version-controlled experimentation.',
    level: 'ADVANCED',
    tier: 'Professional',
    xpPoints: 100,
    orderIndex: 5,
    slides: [
      {
        title: 'MLOps and Model Governance',
        layoutType: 'TEXT_ONLY',
        imageUrl: null,
        bullets: [
          'SageMaker Model Registry tracks model versions, approval status, and lineage for governance.',
          'SageMaker Pipelines orchestrates end-to-end ML workflows with automatic caching and retry logic.',
          'Model Monitor detects data drift and model quality degradation in production, triggering retraining alerts.',
        ],
      },
    ],
    quiz: [
      q(
        'Which SageMaker feature tracks model versions and approval workflows for governance?',
        ['Model Monitor', 'Model Registry', 'Feature Store', 'Clarify'],
        1,
        'SageMaker Model Registry provides a centralized repository to manage model versions, associations, and approval workflows throughout the ML lifecycle.',
      ),
    ],
  },
];
