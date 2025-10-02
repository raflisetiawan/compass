import { z } from 'zod';
import type { Question } from '@/stores/questionnaireStore';

export const createQuestionSchema = (question: Question): z.ZodTypeAny => {
  switch (question.type) {
    case 'number': {
      let schema = z.coerce.number();

      if (question.validation?.min !== undefined) {
        schema = schema.min(question.validation.min, {
          message: `Value must be at least ${question.validation.min}.`,
        });
      }
      if (question.validation?.max !== undefined) {
        schema = schema.max(question.validation.max, {
          message: `Value must be no more than ${question.validation.max}.`,
        });
      }
      // If required, the value cannot be NaN, which is what coerce does on empty strings.
      if (question.required) {
        return schema.refine((val) => !isNaN(val), { message: 'This field is required.' });
      }

      return schema;
    }
    case 'select': {
      if (question.required) {
        return z.string().min(1, { message: 'Please select an option.' });
      }
      return z.string(); // Allow empty string if not required
    }
    default:
      return z.any();
  }
};
  