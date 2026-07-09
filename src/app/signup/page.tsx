"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Heart, Mail, Lock, User } from "lucide-react";

import styles from "./page.module.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: "https://health-tracker-seven-navy.vercel.app/dashboard",
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const localBio = JSON.parse(localStorage.getItem("health-tracker:biometrics") || "[]");
      const localMeds = JSON.parse(localStorage.getItem("health-tracker:medications") || "[]");
      const localLogs = JSON.parse(
        localStorage.getItem("health-tracker:medication-logs") || "[]",
      );

      if (localBio.length > 0) {
        await supabase.from("biometric_entries").insert(
          localBio.map((e: Record<string, unknown>) => ({
            id: e.id,
            user_id: data.user!.id,
            date: e.date,
            time_of_day: e.timeOfDay,
            systolic: (e.bloodPressure as Record<string, unknown>)?.systolic,
            diastolic: (e.bloodPressure as Record<string, unknown>)?.diastolic,
            pulse: e.pulse,
            blood_sugar: e.bloodSugar,
            notes: e.notes,
          })),
        );
      }

      if (localMeds.length > 0) {
        await supabase.from("medications").insert(
          localMeds.map((m: Record<string, unknown>) => ({
            id: m.id,
            user_id: data.user!.id,
            name: m.name,
            active_ingredient: m.activeIngredient,
            dosage: m.dosage,
            purpose: m.purpose,
            stop_rule: m.stopRule,
            is_conditional: m.isConditional,
            condition_text: m.conditionText,
            is_from_hospital: m.isFromHospital,
            prescription_type: m.prescriptionType,
            frequency: m.frequency,
            notes: m.notes,
            is_active: m.isActive,
          })),
        );
      }

      if (localLogs.length > 0) {
        await supabase.from("medication_logs").insert(
          localLogs.map((l: Record<string, unknown>) => ({
            id: l.id,
            user_id: data.user!.id,
            medication_id: l.medicationId,
            scheduled_time: l.scheduledTime,
            is_taken: l.isTaken,
            taken_at: l.takenAt,
            date: l.date,
          })),
        );
      }

      localStorage.removeItem("health-tracker:biometrics");
      localStorage.removeItem("health-tracker:medications");
      localStorage.removeItem("health-tracker:medication-logs");
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
