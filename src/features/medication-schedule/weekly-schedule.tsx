"use client";

import { useState, useMemo } from "react";

import type { Medication, MedicationTime } from "@/entities/medication";
import { TIME_LABELS, TIME_ICONS } from "@/entities/medication";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { getTodayString } from "@/shared/lib/constants";

import styles from "./weekly-schedule.module.css";

const TIME_ORDER: MedicationTime[] = ["morning", "afternoon", "evening"];

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getDateRange(): string[] {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

interface WeeklyScheduleProps {
  medications: Medication[];
  onUpdateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  onSkipMedication: (id: string, date: string) => Promise<void>;
  onUnskipMedication: (id: string, date: string) => Promise<void>;
}

export function WeeklySchedule({
  medications,
  onUpdateMedication,
  onSkipMedication,
}: WeeklyScheduleProps) {
  const weekDates = useMemo(() => getDateRange(), []);
  const [selectedCell, setSelectedCell] = useState<{ date: string; time: MedicationTime } | null>(null);

  const getMedsForCell = (date: string, time: MedicationTime) => {
    const result: { med: Medication; isSkipped: boolean; isAdded: boolean }[] = [];
    const override = (med: Medication) => med.overrides?.[date];

    for (const med of medications) {
      const ov = override(med);
      if (ov?.added) {
        result.push({ med, isSkipped: false, isAdded: true });
        continue;
      }
      if (ov?.skip) {
        result.push({ med, isSkipped: true, isAdded: false });
        continue;
      }
      if (med.frequency.includes(time)) {
        result.push({ med, isSkipped: false, isAdded: false });
      }
    }

    return result;
  };

  const handleAddToDay = async (date: string, time: MedicationTime, medId: string) => {
    const med = medications.find((m) => m.id === medId);
    if (!med) return;
    const ov = { ...med.overrides };
    ov[date] = { added: true };
    await onUpdateMedication(medId, { overrides: ov });
  };

  const handleRemoveFromDay = async (date: string, medId: string) => {
    const med = medications.find((m) => m.id === medId);
    if (!med || !med.overrides?.[date]) return;
    const ov = { ...med.overrides };
    delete ov[date];
    await onUpdateMedication(medId, { overrides: ov });
  };

  const availableMeds = medications.filter(
    (m) => !m.groupId,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Расписание на неделю</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.grid}>
          <div className={styles.headerCell}>Время</div>
          {weekDates.map((date) => (
            <div key={date} className={`${styles.headerCell} ${isToday(date) ? styles.headerToday : ""}`}>
              <span className={styles.dayName}>{getDayName(date)}</span>
              <span className={styles.dayDate}>{date.slice(5)}</span>
            </div>
          ))}

          {TIME_ORDER.map((time) => (
            <>
              <div key={`label-${time}`} className={styles.timeCell}>
                <span>{TIME_ICONS[time]}</span>
                <span>{TIME_LABELS[time]}</span>
              </div>
              {weekDates.map((date) => {
                const meds = getMedsForCell(date, time);
                const isSelected = selectedCell?.date === date && selectedCell?.time === time;
                return (
                  <div
                    key={`${date}-${time}`}
                    className={`${styles.cell} ${isToday(date) ? styles.cellToday : ""} ${isSelected ? styles.cellSelected : ""}`}
                    onClick={() => setSelectedCell(isSelected ? null : { date, time })}
                  >
                    {meds.length === 0 && !isSelected && (
                      <span className={styles.emptyCell}>—</span>
                    )}
                    {meds.map(({ med, isSkipped, isAdded }) => (
                      <div
                        key={med.id}
                        className={`${styles.cellMed} ${isSkipped ? styles.cellSkipped : ""} ${isAdded ? styles.cellAdded : ""}`}
                        title={`${med.name} ${med.dosage}${isSkipped ? " (пропущено)" : ""}${isAdded ? " (добавлено)" : ""}`}
                      >
                        <span className={styles.cellMedName}>{med.name}</span>
                      </div>
                    ))}
                    {isSelected && (
                      <div className={styles.cellActions}>
                        {availableMeds.map((med) => {
                          const inCell = getMedsForCell(date, time).some((m) => m.med.id === med.id && !m.isSkipped);
                          return !inCell ? (
                            <Button
                              key={med.id}
                              variant="ghost"
                              size="sm"
                              className={styles.cellActionBtn}
                              onClick={(e) => { e.stopPropagation(); handleAddToDay(date, time, med.id); }}
                            >
                              + {med.name}
                            </Button>
                          ) : (
                            <span key={med.id} className={styles.cellActionInfo}>
                              {med.name}
                              <button
                                className={styles.cellActionRemove}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const ov = med.overrides?.[date];
                                  if (ov?.added || ov?.skip) {
                                    handleRemoveFromDay(date, med.id);
                                  } else {
                                    onSkipMedication(med.id, date);
                                  }
                                }}
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={styles.cellActionBtn}
                          onClick={(e) => { e.stopPropagation(); setSelectedCell(null); }}
                        >
                          Закрыть
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
