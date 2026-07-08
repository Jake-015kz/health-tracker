"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Heart, Mail, Lock } from "lucide-react";

import styles from "./page.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.header}>
          <Heart className={styles.logoIcon} />
          <h1 className={styles.title}>Вход</h1>
          <p className={styles.subtitle}>Войдите в свой аккаунт</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
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
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className={styles.links}>
          <Link href="/signup" className={styles.link}>
            Нет аккаунта? Зарегистрироваться
          </Link>
          <Link href="/dashboard" className={styles.linkMuted}>
            Продолжить без регистрации
          </Link>
        </div>
      </div>
    </main>
  );
}
