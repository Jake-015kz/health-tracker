"use client";

import { useCallback } from "react";

import type { BiometricEntry } from "@/entities/biometrics";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import styles from "./export-data.module.css";

interface ExportDataProps {
  biometrics: BiometricEntry[];
  loading: boolean;
}

export function ExportData({ biometrics: entries, loading }: ExportDataProps) {
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const exportCSV = useCallback(() => {
    const headers = ["Дата", "Время суток", "Давление (сист.)", "Давление (диаст.)", "Пульс", "Сахар", "Заметки"];
    const rows = entries.map((e) => [
      e.date,
      e.timeOfDay === "morning" ? "Утро" : "Вечер",
      e.bloodPressure?.systolic?.toString() ?? "",
      e.bloodPressure?.diastolic?.toString() ?? "",
      e.pulse?.toString() ?? "",
      e.bloodSugar?.toString() ?? "",
      e.notes ?? "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-tracker-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const totalEntries = entries.length;
  const uniqueDates = new Set(entries.map((e) => e.date)).size;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p>Загрузка данных...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Экспорт данных</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.container}>
          <p className={styles.info}>
            Выгрузите историю измерений для передачи лечащему врачу. Данные экспортируются в формате
            JSON или CSV.
          </p>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{totalEntries}</span>
              <span className={styles.statLabel}>Измерений</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{uniqueDates}</span>
              <span className={styles.statLabel}>Дней</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {entries.length > 0
                  ? Math.round(
                      entries.reduce((sum, e) => sum + (e.bloodPressure?.systolic ?? 0), 0) /
                        entries.filter((e) => e.bloodPressure).length,
                    ) || "—"
                  : "—"}
              </span>
              <span className={styles.statLabel}>Ср. систолическое</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="secondary" onClick={exportCSV} disabled={entries.length === 0}>
              Скачать CSV
            </Button>
            <Button onClick={exportJSON} disabled={entries.length === 0}>
              Скачать JSON
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
