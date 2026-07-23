import { CreateGuidelineDto, UpdateGuidelineDto } from '../types/guideline.types';

export interface ValidationErrors {
  title?: string;
  description?: string;
  icon?: string;
  prominentColor?: string;
}

export function validateGuideline(data: Partial<CreateGuidelineDto | UpdateGuidelineDto>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (data.title !== undefined) {
    if (!data.title || !data.title.trim()) {
      errors.title = 'Title is required';
    } else if (data.title.length > 80) {
      errors.title = 'Title must be 80 characters or less';
    }
  }

  if (data.description !== undefined && data.description !== null) {
    if (data.description.length > 300) {
      errors.description = 'Description must be 300 characters or less';
    }
  }

  if (data.icon !== undefined) {
    if (!data.icon) {
      errors.icon = 'Icon is required';
    }
  }

  if (data.prominent === true) {
    if (!data.prominentColor) {
      errors.prominentColor = 'Prominent color is required when guideline is prominent';
    }
  }

  return errors;
}
