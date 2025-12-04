/**
 * App Entry Point - With Global Theme Support
 */

import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('rodistaa-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('rodistaa-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Pass theme and toggleTheme to all pages via pageProps
  const enhancedPageProps = {
    ...pageProps,
    theme,
    toggleTheme,
  };

  // Ant Design theme based on current theme
  const antdTheme = {
    token: {
      colorPrimary: '#C90D0D',
      borderRadius: 8,
      fontSize: 14,
      fontFamily: "'Times New Roman', Times, serif",
      ...(theme === 'dark' ? {
        colorBgContainer: '#151922',
        colorBgElevated: '#1E2430',
        colorBorder: '#2D3748',
        colorText: '#FFFFFF',
        colorTextSecondary: '#B4B9C5',
      } : {
        colorBgContainer: '#FFFFFF',
        colorBgElevated: '#FFFFFF',
        colorBorder: '#E5E7EB',
        colorText: '#0A0E14',
        colorTextSecondary: '#6B7280',
      }),
    },
  };

  if (!mounted) {
    return null;
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <QueryClientProvider client={queryClient}>
        <Component {...enhancedPageProps} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default MyApp;
