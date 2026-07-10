"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Mail, Lock, User } from "lucide-react";

import styles from "./page.module.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Ошибка регистрации");
      setLoading(false);
      return;
    }

    setEmailSent(true);
  };

  return (
    <main className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        {emailSent ? (
          <>
            <div className={styles.header}>
              <Mail className={styles.logoIcon} />
              <h1 className={styles.title}>Письмо отправлено</h1>
              <p className={styles.subtitle}>
                Мы отправили ссылку для подтверждения на <strong>{email}</strong>.
                Проверьте почту и перейдите по ссылке для входа.
              </p>
            </div>
            <div className={styles.links}>
              <Link href="/login" className={styles.link}>
                Перейти ко входу
              </Link>
              <Link href="/" className={styles.linkMuted}>
                На главную
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <Heart className={styles.logoIcon} />
              <h1 className={styles.title}>Регистрация</h1>
              <p className={styles.subtitle}>Создайте аккаунт для синхронизации данных</p>
            </div>

            <form className={styles.form} onSubmit={handleSignup}>
              <div className={styles.inputGroup}>
                <User className={styles.inputIcon} />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Имя"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <Mail className={styles.inputIcon} />
                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <Lock className={styles.inputIcon} />
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Пароль (минимум 6 символов)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Регистрация..." : "Зарегистрироваться"}
              </button>
            </form>

            <div className={styles.links}>
              <Link href="/login" className={styles.link}>
                Уже есть аккаунт? Войти
              </Link>
              <Link href="/dashboard" className={styles.linkMuted}>
                Продолжить без регистрации
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
