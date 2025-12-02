/**
 * Next.js App Component
 * Configured with Ant Design and Rodistaa theme
 */

import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rodistaaTheme } from '../theme/rodistaa';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={rodistaaTheme}>
        <Component {...pageProps} />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

