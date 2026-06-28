import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache persists for 10 minutes after becoming stale
            gcTime: 10 * 60 * 1000,
            // Don't refetch on window focus (can be annoying)
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Retry failed requests once
            retry: 1,
            // Don't retry on 404s
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            // Don't retry mutations by default
            retry: false,
        },
    },
});
