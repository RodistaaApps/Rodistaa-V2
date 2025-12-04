/**
 * App Entry Point - With Global Theme Support
 */

import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import "../styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemedApp({ Component, pageProps }: AppProps) {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Ant Design theme based on current theme
  const antdTheme = {
    token: {
      colorPrimary: "#C90D0D",
      borderRadius: 8,
      fontSize: 14,
      fontFamily: "'Times New Roman', Times, serif",
      ...(theme === "dark"
        ? {
            colorBgContainer: "#151922",
            colorBgElevated: "#1E2430",
            colorBorder: "#2D3748",
            colorText: "#FFFFFF",
            colorTextSecondary: "#B4B9C5",
          }
        : {
            colorBgContainer: "#FFFFFF",
            colorBgElevated: "#FFFFFF",
            colorBorder: "#E5E7EB",
            colorText: "#0A0E14",
            colorTextSecondary: "#6B7280",
          }),
    },
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}

function MyApp(props: AppProps) {
  return (
    <ThemeProvider>
      <ThemedApp {...props} />
    </ThemeProvider>
  );
}

export default MyApp;
