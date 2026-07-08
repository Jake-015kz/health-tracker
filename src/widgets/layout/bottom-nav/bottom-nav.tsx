"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, Pill, FileText, Download } from "lucide-react";

import styles from "./bottom-nav.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/dashboard#log", label: "Измерения", icon: Activity },
  { href: "/dashboard#medications", label: "Лекарства", icon: Pill },
  { href: "/dashboard#report", label: "Отчёт", icon: FileText },
  { href: "/dashboard#export", label: "Экспорт", icon: Download },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "?");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
          >
            <Icon className={styles.navIcon} />
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
