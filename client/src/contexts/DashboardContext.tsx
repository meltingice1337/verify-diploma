import { createContext } from 'react';

export type DashboardContextType = 'issuer' | 'recipient';

interface DashboardContextValue {
    setContext: (context: DashboardContextType) => void;
    context: DashboardContextType;
}

const DashboardContext = createContext<DashboardContextValue>({ setContext: (): void => { void 0; }, context: 'issuer' });

export const DashboardProvider = DashboardContext.Provider;
export const DashboardConsumer = DashboardContext.Consumer;
export default DashboardContext;