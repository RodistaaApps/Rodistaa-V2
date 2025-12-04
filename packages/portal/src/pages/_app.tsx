/**
 * App Entry Point - With Theme Support
 */

import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Ant Design Theme Config
const antdTheme = {
  token: {
    colorPrimary: '#C90D0D',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Times New Roman', Times, serif",
  },
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={antdTheme}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default MyApp;
