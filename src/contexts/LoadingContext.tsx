import { createContext } from 'react';

interface LoadingContextValue {
    setIsLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextValue>({ setIsLoading: () => { void 0; } });

export const LoadingProvider = LoadingContext.Provider;
export const LoadingConsumer = LoadingContext.Consumer;
export default LoadingContext;