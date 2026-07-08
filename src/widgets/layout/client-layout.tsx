"use client";

import { Layout } from "./layout";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return <Layout>{children}</Layout>;
}
