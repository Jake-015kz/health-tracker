"use client";

import { DataStoreProvider } from "@/features/auth/data-store-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DataStoreProvider>{children}</DataStoreProvider>;
}
