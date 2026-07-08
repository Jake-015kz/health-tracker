"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/button";

import styles from "./page.module.css";

export default function HomePage() {
  const { user, loading, signOut } = useAuth();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Health Tracker</h1>
        <p className={styles.subtitle}>
          Мониторинг здоровья после инсульта — контроль давления, пульса, сахара и приёма лекарств
        </p>

        <div className={styles.authSection}>
          {loading ? (
            <span className={styles.authLoading}>Загрузка...</span>
          ) : user ? (
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Выйти
              </Button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link href="/login">
                <Button variant="secondary" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Регистрация</Button>
              </Link>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.navLink} ${styles.navLinkActive}`}>
            Дашборд
          </Link>
        </nav>
      </header>
    </main>
  );
}
