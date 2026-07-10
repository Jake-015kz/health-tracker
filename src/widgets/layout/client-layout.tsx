"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/shared/lib/theme-context";
import { ServiceWorkerRegistration } from "@/shared/ui/service-worker-registration";

import { Layout } from "./layout";

const NO_LAYOUT_ROUTES = ["/", "/login", "/signup"];

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const showLayout = !NO_LAYOUT_ROUTES.includes(pathname);

  return (
    <ThemeProvider>
      <ServiceWorkerRegistration />
      {showLayout ? <Layout>{children}</Layout> : children}
    </ThemeProvider>
  );
}
