import type { Metadata } from "next";

import { ClientLayout } from "@/widgets/layout/client-layout";

import "./globals.css";

export const metadata: Metadata = {
  title: "Health Tracker — Мониторинг здоровья после инсульта",
  description:
    "Приложение для контроля давления, пульса, уровня сахара и приёма лекарств после инсульта",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
