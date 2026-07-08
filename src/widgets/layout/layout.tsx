"use client";

import { Sidebar } from "./sidebar/sidebar";
import { BottomNav } from "./bottom-nav/bottom-nav";

import styles from "./layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <BottomNav />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
