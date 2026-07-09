"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Activity,
  Pill,
  FileText,
  Download,
  LogOut,
  Heart,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/shared/lib/theme-context";

import styles from "./sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", hash: "", label: "Обзор", icon: LayoutDashboard },
  { href: "/dashboard#log", hash: "log", label: "Измерения", icon: Activity },
  { href: "/dashboard#medications", hash: "medications", label: "Лекарства", icon: Pill },
  { href: "/dashboard#report", hash: "report", label: "Отчёт", icon: FileText },
  { href: "/dashboard#export", hash: "export", label: "Экспорт", icon: Download },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Heart className={styles.logoIcon} />
        <span className={styles.logoText}>Health Tracker</span>
      </div>

      <nav className={styles.nav}>
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

      <div className={styles.footer}>
        <button className={styles.themeToggle} onClick={toggleTheme} title="Сменить тему">
          {theme === "light" ? (
            <Moon className={styles.themeIcon} />
          ) : (
            <Sun className={styles.themeIcon} />
          )}
        </button>

        {user ? (
          <>
            <div className={styles.user}>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            <button className={styles.logoutBtn} onClick={signOut}>
              <LogOut className={styles.logoutIcon} />
              <span>Выйти</span>
            </button>
          </>
        ) : (
          <div className={styles.authLinks}>
            <Link href="/login" className={styles.authLink}>
              Войти
            </Link>
            <Link href="/signup" className={`${styles.authLink} ${styles.authLinkPrimary}`}>
              Регистрация
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
