"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Pill,
  FileText,
  Download,
  LogOut,
  Heart,
} from "lucide-react";
import { useAuth } from "@/features/auth";

import styles from "./sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/dashboard#log", label: "Измерения", icon: Activity },
  { href: "/dashboard#medications", label: "Лекарства", icon: Pill },
  { href: "/dashboard#report", label: "Отчёт", icon: FileText },
  { href: "/dashboard#export", label: "Экспорт", icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Heart className={styles.logoIcon} />
        <span className={styles.logoText}>Health Tracker</span>
      </div>

      <nav className={styles.nav}>
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

      <div className={styles.footer}>
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
