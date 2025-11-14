import { useContext } from 'react';
import { OutcomePageDataContext } from '@/contexts/OutcomePageDataContext';
import type { OutcomePageDataContextType } from '@/contexts/OutcomePageDataContext';

export const useOutcomePageData = (): NonNullable<OutcomePageDataContextType> => {
  const context = useContext(OutcomePageDataContext);
  if (!context) {
    throw new Error('useOutcomePageData must be used within an OutcomePageDataProvider');
  }
  return context;
};