"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Activity,
  Pill,
  Calendar,
  FileText,
  Download,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/shared/lib/theme-context";

import styles from "./bottom-nav.module.css";

const NAV_ITEMS = [
  { hash: "", label: "Обзор", icon: LayoutDashboard },
  { hash: "log", label: "Измерения", icon: Activity },
  { hash: "medications", label: "Лекарства", icon: Pill },
  { hash: "schedule", label: "Расписание", icon: Calendar },
  { hash: "report", label: "Отчёт", icon: FileText },
  { hash: "export", label: "Экспорт", icon: Download },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentHash, setCurrentHash] = useState("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash.replace("#", ""));
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent, hash: string) => {
      e.preventDefault();
      if (pathname !== "/dashboard") {
        router.push(`/dashboard${hash ? `#${hash}` : ""}`);
      } else {
        const url = hash ? `/dashboard#${hash}` : "/dashboard";
        window.history.replaceState(null, "", url);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    },
    [pathname, router],
  );

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isDashboard = pathname === "/dashboard";
        const isActive = isDashboard && currentHash === item.hash;
        return (
          <a
            key={item.hash}
            href={`/dashboard${item.hash ? `#${item.hash}` : ""}`}
            onClick={(e) => handleNavClick(e, item.hash)}
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
          >
            <Icon className={styles.navIcon} />
            <span className={styles.navLabel}>{item.label}</span>
          </a>
        );
      })}
        <button
          className={styles.themeToggle}
          onClick={(e) => { e.preventDefault(); toggleTheme(); }}
          title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
        >
          {theme === "light" ? (
            <Moon className={styles.navIcon} />
          ) : (
            <Sun className={styles.navIcon} />
          )}
          <span className={styles.navLabel}>Тема</span>
        </button>
    </nav>
  );
}
