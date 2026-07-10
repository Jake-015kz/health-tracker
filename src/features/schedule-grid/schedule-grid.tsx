"use client";

import { useMemo } from "react";

import type { Medication, MedicationTime } from "@/entities/medication";
import { TIME_LABELS, TIME_ICONS } from "@/entities/medication";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import styles from "./schedule-grid.module.css";

const TIME_ORDER: MedicationTime[] = ["morning", "afternoon", "evening"];

interface ScheduleGridProps {
  medications: Medication[];
  onUpdateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
}

export function ScheduleGrid({ medications, onUpdateMedication }: ScheduleGridProps) {
  const grouped = useMemo(() => {
    const groups: Record<MedicationTime, Medication[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    const sorted = [...medications].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    for (const med of sorted) {
      if (med.groupId) continue;
      for (const time of med.frequency) {
        groups[time].push(med);
      }
    }
    return groups;
  }, [medications]);

  const moveToTime = async (med: Medication, targetTime: MedicationTime) => {
    const current = med.frequency;
    if (current.includes(targetTime)) return;
    const newFreq = targetTime === "morning"
      ? [targetTime, ...current.filter(t => t !== "morning" && t !== "afternoon" && t !== "evening")]
      : [...current.filter(t => t !== "morning" && t !== "afternoon" && t !== "evening"), targetTime];
    await onUpdateMedication(med.id, { frequency: newFreq as MedicationTime[] });
  };

  const removeFromTime = async (med: Medication, time: MedicationTime) => {
    const newFreq = med.frequency.filter(t => t !== time);
    if (newFreq.length === 0) return;
    await onUpdateMedication(med.id, { frequency: newFreq as MedicationTime[] });
  };

  const otherTimes = (med: Medication): MedicationTime[] =>
    TIME_ORDER.filter(t => !med.frequency.includes(t));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактор расписания</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.grid}>
          {TIME_ORDER.map((time) => (
            <div key={time} className={styles.column}>
              <div className={styles.columnHeader}>
                <span>{TIME_ICONS[time]}</span>
                <span>{TIME_LABELS[time]}</span>
                <span className={styles.columnCount}>{grouped[time].length}</span>
              </div>
              <div className={styles.columnBody}>
                {grouped[time].length === 0 && (
                  <div className={styles.emptyColumn}>Нет лекарств</div>
                )}
                {grouped[time].map((med) => {
                  const others = otherTimes(med);
                  return (
                    <div key={`${med.id}-${time}`} className={styles.medCard}>
                      <div className={styles.medInfo}>
                        <span className={styles.medName}>{med.name}</span>
                        <span className={styles.medDosage}>{med.dosage}</span>
                        {med.purpose && (
                          <span className={styles.medPurpose}>{med.purpose}</span>
                        )}
                      </div>
                      <div className={styles.medActions}>
                        {others.map((t) => (
                          <button
                            key={t}
                            className={styles.moveBtn}
                            onClick={() => moveToTime(med, t)}
                            title={`Перенести в ${TIME_LABELS[t].toLowerCase()}`}
                          >
                            ← {TIME_ICONS[t]}
                          </button>
                        ))}
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeFromTime(med, time)}
                          title={`Убрать из ${TIME_LABELS[time].toLowerCase()}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
