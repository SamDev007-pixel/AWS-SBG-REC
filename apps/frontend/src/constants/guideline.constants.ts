import { GuidelineIcon, GuidelineThemeColor } from '../types/guideline.types';

export const GUIDELINE_ICONS_LIST: { value: GuidelineIcon; label: string; description: string }[] = [
  { value: 'STEP_FUNCTIONS', label: 'Step Functions', description: 'Sequencing & Workflows' },
  { value: 'S3', label: 'Simple Storage Service (S3)', description: 'Storage & Retrieval' },
  { value: 'IAM', label: 'Identity & Access Management (IAM)', description: 'Permissions & Access' },
  { value: 'CONFIG', label: 'AWS Config', description: 'Policies & Configuration Rules' },
  { value: 'CLOUDWATCH', label: 'CloudWatch', description: 'Monitoring & Metrics' },
  { value: 'QUICKSIGHT', label: 'QuickSight', description: 'Analytics & Visualization' },
  { value: 'COST_EXPLORER', label: 'Cost Explorer', description: 'Billing & Point Tracking' },
  { value: 'APPLICATION_COMPOSER', label: 'Application Composer', description: 'Architecture & Pathways' },
  { value: 'LIGHTBULB', label: 'Lightbulb', description: 'Progression guidelines' },
  { value: 'NONE', label: 'None (Hide)', description: 'Hide header icon' },
];

export const GUIDELINE_COLORS_LIST: { value: GuidelineThemeColor; label: string; hex: string }[] = [
  { value: 'SKY', label: 'Sky Blue', hex: '#0ea5e9' },
  { value: 'EMERALD', label: 'Emerald Green', hex: '#10b981' },
  { value: 'AMBER', label: 'Amber Orange', hex: '#f59e0b' },
  { value: 'INDIGO', label: 'Indigo Purple', hex: '#6366f1' },
  { value: 'ROSE', label: 'Rose Red', hex: '#f43f5e' },
  { value: 'VIOLET', label: 'Violet Purple', hex: '#8b5cf6' },
  { value: 'SLATE', label: 'Slate Gray', hex: '#64748b' },
];
