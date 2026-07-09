import type { Metadata, Viewport } from "next";

import { ClientLayout } from "@/widgets/layout/client-layout";

import "./globals.css";

export const metadata: Metadata = {
  title: "Health Tracker — Мониторинг здоровья после инсульта",
  description:
    "Приложение для контроля давления, пульса, уровня сахара и приёма лекарств после инсульта",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Health Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#33cb78",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
