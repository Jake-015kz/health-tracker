"use client";

import { ThemeProvider } from "@/shared/lib/theme-context";
import { ServiceWorkerRegistration } from "@/shared/ui/service-worker-registration";

import { Layout } from "./layout";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider>
      <ServiceWorkerRegistration />
      <Layout>{children}</Layout>
    </ThemeProvider>
  );
}
