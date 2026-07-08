"use client";

import Link from "next/link";
import { Activity, Pill, Heart, Shield, BarChart3, Stethoscope } from "lucide-react";

import styles from "./page.module.css";

const FEATURES = [
  {
    icon: Activity,
    title: "Давление и пульс",
    description: "Ежедневный мониторинг артериального давления и частоты сердечных сокращений",
  },
  {
    icon: Pill,
    title: "Приём лекарств",
    description: "Контроль назначенных препаратов с напоминаниями и статусом приёма",
  },
  {
    icon: BarChart3,
    title: "Графики и тренды",
    description: "Визуализация изменений показателей за неделю, месяц и квартал",
  },
  {
    icon: Stethoscope,
    title: "Отчёт для врача",
    description: "Автоматическая сводка для передачи лечащему врачу",
  },
  {
    icon: Shield,
    title: "Приватность",
    description: "Данные хранятся локально или в защищённом облаке Supabase",
  },
  {
    icon: Heart,
    title: "Для восстановления",
    description: "Специально разработано для людей после инсульта",
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={`${styles.heroBadge} animate-fade-in-down`}>
            <Heart className={styles.badgeIcon} />
            <span>Мониторинг здоровья</span>
          </div>

          <h1 className={`${styles.heroTitle} animate-fade-in-up`}>
            Здоровье
            <span className={styles.heroTitleAccent}> под контролем</span>
          </h1>

          <p className={`${styles.heroSubtitle} animate-fade-in-up stagger-2`}>
            Приложение для ежедневного мониторинга давления, пульса, сахара и приёма лекарств
            после инсульта. Простой и надёжный помощник для вашего восстановления.
          </p>

          <div className={`${styles.heroActions} animate-fade-in-up stagger-3`}>
            <Link href="/dashboard" className={styles.heroBtnPrimary}>
              Начать использовать
            </Link>
            <Link href="/login" className={styles.heroBtnSecondary}>
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={`${styles.featuresTitle} animate-fade-in-up`}>Возможности</h2>
        <div className={styles.featuresGrid}>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`${styles.featureCard} animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className={styles.featureIcon}>
                  <Icon className={styles.featureIconSvg} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Health Tracker — забота о здоровье после инсульта
        </p>
      </footer>
    </main>
  );
}
