import { createContext } from 'react';
import { useFetchOutcomePageData } from '@/hooks/useFetchOutcomePageData';

export type OutcomePageDataContextType = ReturnType<typeof useFetchOutcomePageData> | null;

export const OutcomePageDataContext = createContext<OutcomePageDataContextType>(null);
