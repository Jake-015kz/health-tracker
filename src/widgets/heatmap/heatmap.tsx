"use client";

import { useMemo } from "react";
import type { Medication, MedicationLog } from "@/entities/medication";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import styles from "./heatmap.module.css";

interface HeatmapProps {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  days?: number;
}

export function AdherenceHeatmap({ medications, medicationLogs, days = 30 }: HeatmapProps) {
  const heatmapData = useMemo(() => {
    if (medications.length === 0) return [];

    const result: { date: string; score: number; label: string }[] = [];
    const now = new Date();

    const processedGroups = new Set<string>();
    const uniqueMeds = medications.filter((m) => {
      if (m.groupId) {
        if (processedGroups.has(m.groupId)) return false;
        processedGroups.add(m.groupId);
      }
      return true;
    });

    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];

      let totalSlots = 0;
      let takenSlots = 0;

      for (const med of uniqueMeds) {
        for (const time of med.frequency) {
          totalSlots++;
          if (
            medicationLogs.some(
              (l) =>
                l.medicationId === med.id &&
                l.scheduledTime === time &&
                l.date === dateStr &&
                l.isTaken,
            )
          ) {
            takenSlots++;
          }
        }
      }

      const score = totalSlots > 0 ? takenSlots / totalSlots : 0;
      const dayName = date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

      result.push({ date: dateStr, score, label: dayName });
    }

    return result;
  }, [medications, medicationLogs, days]);

  if (medications.length === 0) return null;

  const getScoreClass = (score: number) => {
    if (score >= 0.8) return styles.scoreGood;
    if (score >= 0.5) return styles.scoreMid;
    if (score > 0) return styles.scoreLow;
    return styles.scoreNone;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Календарь приверженности</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.grid}>
          {heatmapData.map((day) => (
            <div
              key={day.date}
              className={`${styles.cell} ${getScoreClass(day.score)}`}
              title={`${day.label}: ${Math.round(day.score * 100)}%`}
            >
              <span className={styles.cellLabel}>{day.label.split(" ")[0]}</span>
            </div>
          ))}
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.scoreNone}`} /> Нет данных
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.scoreLow}`} /> &lt;50%
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.scoreMid}`} /> 50-79%
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.scoreGood}`} /> 80%+
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
