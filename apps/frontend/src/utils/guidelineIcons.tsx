import React from 'react';
import { Lightbulb } from 'lucide-react';
import {
  StepFunctionsIcon,
  S3Icon,
  IAMIcon,
  ConfigIcon,
  CloudWatchIcon,
  QuickSightIcon,
  CostExplorerIcon,
  ApplicationComposerIcon,
} from '@/components/Learn/AWSServiceIcons';
import { GuidelineIcon } from '../types/guideline.types';

export const GUIDELINE_ICONS_MAP: Record<GuidelineIcon, React.FC<{ size?: number; className?: string }>> = {
  STEP_FUNCTIONS: StepFunctionsIcon,
  S3: S3Icon,
  IAM: IAMIcon,
  CONFIG: ConfigIcon,
  CLOUDWATCH: CloudWatchIcon,
  QUICKSIGHT: QuickSightIcon,
  COST_EXPLORER: CostExplorerIcon,
  APPLICATION_COMPOSER: ApplicationComposerIcon,
  LIGHTBULB: ({ size = 18, className }) => <Lightbulb size={size} className={className} />,
  NONE: () => null,
};

export function renderGuidelineIcon(icon: GuidelineIcon, size = 18, className?: string) {
  const IconComponent = GUIDELINE_ICONS_MAP[icon];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
}
