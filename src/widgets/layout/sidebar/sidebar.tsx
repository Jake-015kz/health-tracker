"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Activity,
  Pill,
  Calendar,
  ClipboardList,
  FileText,
  Download,
  LogOut,
  Heart,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/shared/lib/theme-context";
import { useOnlineStatus } from "@/shared/lib/use-online-status";

import styles from "./sidebar.module.css";

const NAV_ITEMS = [
  { hash: "", label: "Обзор", icon: LayoutDashboard },
  { hash: "log", label: "Измерения", icon: Activity },
  { hash: "medications", label: "Лекарства", icon: Pill },
  { hash: "schedule", label: "Расписание", icon: Calendar },
  { path: "/dashboard/prescription", label: "Назначения", icon: ClipboardList },
  { hash: "report", label: "Отчёт", icon: FileText },
  { hash: "export", label: "Экспорт", icon: Download },
  { hash: "profile", label: "Профиль", icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [currentHash, setCurrentHash] = useState("");
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();

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
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Heart className={styles.logoIcon} />
        <span className={styles.logoText}>Health Tracker</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          if ("path" in item) {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          }
          const isDashboard = pathname === "/dashboard";
          const isActive = isDashboard && currentHash === item.hash;
          return (
            <a
              key={item.hash}
              href={`/dashboard${item.hash ? `#${item.hash}` : ""}`}
              onClick={(e) => handleNavClick(e, item.hash!)}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </a>
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
              <span className={styles.onlineDot} data-online={isOnline} />
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
