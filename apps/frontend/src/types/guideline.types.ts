export type GuidelineIcon =
  | 'STEP_FUNCTIONS'
  | 'S3'
  | 'IAM'
  | 'CONFIG'
  | 'CLOUDWATCH'
  | 'QUICKSIGHT'
  | 'COST_EXPLORER'
  | 'APPLICATION_COMPOSER'
  | 'LIGHTBULB'
  | 'NONE';

export type GuidelineThemeColor =
  | 'SKY'
  | 'EMERALD'
  | 'AMBER'
  | 'INDIGO'
  | 'ROSE'
  | 'VIOLET'
  | 'SLATE';

export interface LearningGuideline {
  id: string;
  title: string;
  description: string | null;
  icon: GuidelineIcon;
  prominent: boolean;
  prominentColor: GuidelineThemeColor | null;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuidelineDto {
  title: string;
  description?: string;
  icon: GuidelineIcon;
  prominent?: boolean;
  prominentColor?: GuidelineThemeColor;
  isActive?: boolean;
}

export interface UpdateGuidelineDto {
  title?: string;
  description?: string;
  icon?: GuidelineIcon;
  prominent?: boolean;
  prominentColor?: GuidelineThemeColor;
  isActive?: boolean;
}

export interface ReorderGuidelinesDto {
  ids: string[];
}

export interface GuidelineSettings {
  id: string;
  headerIcon: GuidelineIcon;
  headerTitle: string;
  headerDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGuidelineSettingsDto {
  headerIcon?: GuidelineIcon;
  headerTitle?: string;
  headerDescription?: string;
}
