"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";

import type { BiometricEntry } from "@/entities/biometrics";
import { getTodayString } from "@/shared/lib/constants";

import styles from "./quick-log.module.css";

type TimeOfDay = BiometricEntry["timeOfDay"];

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: "Утро",
  evening: "Вечер",
};

interface QuickLogProps {
  onAdd: (entry: Omit<BiometricEntry, "id" | "timestamp">) => Promise<BiometricEntry>;
}

export function QuickLog({ onAdd }: QuickLogProps) {
  const [open, setOpen] = useState(false);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getDefaultTimeOfDay());
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValid =
    systolic.trim() !== "" &&
    diastolic.trim() !== "" &&
    !isNaN(Number(systolic)) &&
    !isNaN(Number(diastolic));

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      await onAdd({
        date: getTodayString(),
        timeOfDay,
        bloodPressure: {
          systolic: Number(systolic),
          diastolic: Number(diastolic),
        },
        pulse: pulse.trim() ? Number(pulse) : undefined,
        bloodSugar: bloodSugar.trim() ? Number(bloodSugar) : undefined,
      });

      setSystolic("");
      setDiastolic("");
      setPulse("");
      setBloodSugar("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      // error handled upstream
    } finally {
      setSubmitting(false);
    }
  }, [isValid, submitting, onAdd, timeOfDay, systolic, diastolic, pulse, bloodSugar]);

  const resetAndClose = () => {
    setOpen(false);
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setBloodSugar("");
    setSuccess(false);
  };

  return (
    <>
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ""}`}
        onClick={() => setOpen(true)}
        title="Быстрое измерение"
      >
        <Plus className={styles.fabIcon} />
      </button>

      {open && (
        <div className={styles.overlay} onClick={resetAndClose}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.handle} />
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>Быстрое измерение</span>
              <button className={styles.closeBtn} onClick={resetAndClose}>
                ✕
              </button>
            </div>

            <div className={styles.sheetBody}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>Верхнее (систолическое)</label>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Нижнее (диастолическое)</label>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}>Пульс</label>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="72"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Сахар (глюкоза), ммоль/л</label>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="5.5"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    inputMode="decimal"
                    step="0.1"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Время измерения</label>
                <div className={styles.timeGroup}>
                  {(Object.entries(TIME_LABELS) as [TimeOfDay, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      className={`${styles.timeChip} ${timeOfDay === key ? styles.timeChipActive : ""}`}
                      onClick={() => setTimeOfDay(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {success && <div className={styles.successMsg}>✓ Сохранено!</div>}
            </div>

            <div className={styles.sheetFooter}>
              <button className={`${styles.footerBtn} ${styles.cancelBtn}`} onClick={resetAndClose}>
                Отмена
              </button>
              <button
                className={`${styles.footerBtn} ${styles.submitBtn}`}
                onClick={handleSubmit}
                disabled={!isValid || submitting}
              >
                {submitting ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getDefaultTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 14) return "morning";
  return "evening";
}
