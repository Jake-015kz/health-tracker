"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/features/auth";
import { useDataStoreContext } from "@/features/auth/data-store-context";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TIME_LABELS, TIME_ICONS } from "@/entities/medication";
import { createClient } from "@/lib/supabase/client";

import styles from "./page.module.css";

export default function PrescriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const store = useDataStoreContext();
  const supabase = createClient();
  const [targets, setTargets] = useState<{
    systolic?: number;
    diastolic?: number;
    pulseLow?: number;
    pulseHigh?: number;
    sugarLow?: number;
    sugarHigh?: number;
  }>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("patient_profiles")
        .select("target_systolic, target_diastolic, target_pulse_low, target_pulse_high, target_sugar_low, target_sugar_high")
        .eq("user_id", user.id)
        .single();
      if (data) {
        const d = data as unknown as Record<string, number | null>;
        setTargets({
          systolic: d.target_systolic ?? undefined,
          diastolic: d.target_diastolic ?? undefined,
          pulseLow: d.target_pulse_low ?? undefined,
          pulseHigh: d.target_pulse_high ?? undefined,
          sugarLow: d.target_sugar_low ?? undefined,
          sugarHigh: d.target_sugar_high ?? undefined,
        });
      }
    })();
  }, [user, supabase]);

  const medicationRows = store.medications
    .filter((m) => !m.groupId)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const timeOrder = ["morning", "afternoon", "evening"];
  const timeGrouped = timeOrder.map((time) => ({
    time,
    meds: medicationRows.filter((m) => m.frequency.includes(time as "morning" | "afternoon" | "evening")),
  }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft size={18} />
          <span>Назад</span>
        </Button>
        <h1 className={styles.title}>Лист назначений и контроля лекарств</h1>
      </div>

      <Card>
        <CardContent>
          <div className={styles.targetSection}>
            <h3 className={styles.sectionTitle}>Целевые показатели</h3>
            <div className={styles.targetGrid}>
              <div className={styles.targetCard}>
                <span className={styles.targetIcon}>❤️</span>
                <span className={styles.targetLabel}>АД</span>
                <span className={styles.targetValue}>
                  {targets.systolic && targets.diastolic
                    ? `${targets.systolic}–${targets.diastolic} мм рт.ст.`
                    : "___/___"}
                </span>
              </div>
              <div className={styles.targetCard}>
                <span className={styles.targetIcon}>💗</span>
                <span className={styles.targetLabel}>Пульс</span>
                <span className={styles.targetValue}>
                  {targets.pulseLow && targets.pulseHigh
                    ? `${targets.pulseLow}–${targets.pulseHigh} уд/мин`
                    : "___"}
                </span>
              </div>
              <div className={styles.targetCard}>
                <span className={styles.targetIcon}>🩸</span>
                <span className={styles.targetLabel}>Сахар</span>
                <span className={styles.targetValue}>
                  {targets.sugarLow && targets.sugarHigh
                    ? `${targets.sugarLow}–${targets.sugarHigh} ммоль/л`
                    : "___"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>График приёма лекарств</CardTitle>
        </CardHeader>
        <CardContent>
          {store.medications.length === 0 && (
            <div className={styles.empty}>Нет назначенных лекарств</div>
          )}
          {timeGrouped.map(({ time, meds }) => (
            <div key={time} className={styles.timeBlock}>
              <div className={styles.timeHeader}>
                <span>{TIME_ICONS[time as keyof typeof TIME_ICONS]}</span>
                <span>{TIME_LABELS[time as keyof typeof TIME_LABELS]}</span>
              </div>
              {meds.length === 0 && (
                <div className={styles.noMeds}>Нет лекарств</div>
              )}
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <span className={styles.colTime}>Время</span>
                  <span className={styles.colMed}>Препарат</span>
                  <span className={styles.colDose}>Доза</span>
                  <span className={styles.colPurpose}>Зачем</span>
                  <span className={styles.colStop}>Правило «Стоп»</span>
                </div>
                {meds.map((med) => {
                  const times = med.frequency;
                  const timeIndex = times.indexOf(time as "morning" | "afternoon" | "evening");
                  const displayTime = timeIndex === 0 ? "08:00" : timeIndex === 1 ? "14:00" : "19:00";
                  return (
                    <div key={`${med.id}-${time}`} className={styles.tableRow}>
                      <span className={styles.colTime}>{displayTime}</span>
                      <span className={styles.colMed}>
                        {med.name}
                        {med.activeIngredient && (
                          <span className={styles.activeIngredient}>({med.activeIngredient})</span>
                        )}
                      </span>
                      <span className={styles.colDose}>{med.dosage}</span>
                      <span className={styles.colPurpose}>{med.purpose ?? "—"}</span>
                      <span className={styles.colStop}>{med.stopRule ?? "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Шаблон замеров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.measurementTemplate}>
            <div className={styles.measBlock}>
              <span className={styles.measLabel}>УТРО</span>
              <span className={styles.measField}>АД: ___/___</span>
              <span className={styles.measField}>Пульс: ___</span>
              <span className={styles.measField}>Сахар: ___</span>
            </div>
            <div className={styles.measBlock}>
              <span className={styles.measLabel}>ВЕЧЕР</span>
              <span className={styles.measField}>АД: ___/___</span>
              <span className={styles.measField}>Пульс: ___</span>
              <span className={styles.measField}>Сахар: ___</span>
            </div>
          </div>
          <p className={styles.measNote}>
            Заполните результаты замеров на странице «Измерения» или через кнопку быстрого ввода.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
