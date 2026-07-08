"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Activity, Pill, FileText, Download } from "lucide-react";

import styles from "./bottom-nav.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", hash: "", label: "Обзор", icon: LayoutDashboard },
  { href: "/dashboard#log", hash: "log", label: "Измерения", icon: Activity },
  { href: "/dashboard#medications", hash: "medications", label: "Лекарства", icon: Pill },
  { href: "/dashboard#report", hash: "report", label: "Отчёт", icon: FileText },
  { href: "/dashboard#export", hash: "export", label: "Экспорт", icon: Download },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash.replace("#", ""));
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isDashboard = pathname === "/dashboard";
        const isActive = isDashboard && currentHash === item.hash;
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
