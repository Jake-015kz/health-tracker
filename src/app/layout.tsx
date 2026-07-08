import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Health Tracker — Мониторинг здоровья после инсульта",
  description:
    "Приложение для контроля давления, пульса, уровня сахара и приёма лекарств после инсульта",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
