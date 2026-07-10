"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { BiometricEntry } from "@/entities/biometrics";
import { biometricEntrySchema, type BiometricEntryFormData } from "@/entities/biometrics/lib/validators";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  getTodayString,
  isCriticalBloodPressure,
  isCriticalBloodSugar,
} from "@/shared/lib/constants";

import styles from "./log-metrics.module.css";

interface LogMetricsProps {
  biometrics: BiometricEntry[];
  onAdd: (entry: Omit<BiometricEntry, "id" | "timestamp">) => Promise<BiometricEntry>;
  onUpdate: (id: string, updates: Partial<BiometricEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function LogMetrics({
  biometrics,
  onAdd,
  onUpdate,
  onDelete,
}: LogMetricsProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const editingEntry = editingId ? biometrics.find((e) => e.id === editingId) ?? null : null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BiometricEntryFormData>({
    resolver: zodResolver(biometricEntrySchema),
    defaultValues: {
      date: editingEntry?.date ?? getTodayString(),
      timeOfDay: editingEntry?.timeOfDay ?? "morning",
      systolic: editingEntry?.bloodPressure?.systolic,
      diastolic: editingEntry?.bloodPressure?.diastolic,
      pulse: editingEntry?.pulse,
      bloodSugar: editingEntry?.bloodSugar,
      notes: editingEntry?.notes,
    },
  });

  const systolic = watch("systolic");
  const diastolic = watch("diastolic");
  const bloodSugar = watch("bloodSugar");

  const isBPCritical = isCriticalBloodPressure(
    typeof systolic === "number" && !isNaN(systolic) ? systolic : undefined,
    typeof diastolic === "number" && !isNaN(diastolic) ? diastolic : undefined,
  );

  const isSugarCritical = isCriticalBloodSugar(
    typeof bloodSugar === "number" && !isNaN(bloodSugar) ? bloodSugar : undefined,
  );

  const startEdit = (entry: BiometricEntry) => {
    setEditingId(entry.id);
    setSubmitError(null);
    setSuccessMessage(null);
    reset({
      date: entry.date,
      timeOfDay: entry.timeOfDay,
      systolic: entry.bloodPressure?.systolic,
      diastolic: entry.bloodPressure?.diastolic,
      pulse: entry.pulse,
      bloodSugar: entry.bloodSugar,
      notes: entry.notes,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ date: getTodayString(), timeOfDay: "morning" });
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await onDelete(id);
        setDeleteConfirm(null);
        if (editingId === id) cancelEdit();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Ошибка удаления");
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const onSubmit = useCallback(
    async (data: BiometricEntryFormData) => {
      const entryData = {
        date: data.date,
        timeOfDay: data.timeOfDay,
        bloodPressure:
          data.systolic && data.diastolic && !isNaN(data.systolic) && !isNaN(data.diastolic)
            ? { systolic: data.systolic, diastolic: data.diastolic }
            : undefined,
        pulse: data.pulse && !isNaN(data.pulse) ? data.pulse : undefined,
        bloodSugar: data.bloodSugar && !isNaN(data.bloodSugar) ? data.bloodSugar : undefined,
        notes: data.notes,
      };

      // Проверка дубликата
      if (!editingEntry) {
        const duplicate = biometrics.find(
          (e) => e.date === entryData.date && e.timeOfDay === entryData.timeOfDay,
        );
        if (duplicate) {
          setSubmitError(`Измерение на ${entryData.date} (${entryData.timeOfDay === "morning" ? "утро" : "вечер"}) уже существует. Отредактируйте его.`);
          return;
        }
      }

      try {
        if (editingEntry) {
          await onUpdate(editingEntry.id, entryData);
          setSuccessMessage("Измерение обновлено!");
          setEditingId(null);
        } else {
          await onAdd(entryData);
          setSuccessMessage("Измерение успешно сохранено!");
        }

        reset({ date: getTodayString(), timeOfDay: "morning" });
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
        setSuccessMessage(null);
        setSubmitError(msg);
        setTimeout(() => setSubmitError(null), 5000);
      }
    },
    [onAdd, onUpdate, editingEntry, biometrics, reset],
  );

  const sortedEntries = [...biometrics].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle>{editingEntry ? "Редактировать измерение" : "Новое измерение"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.row}>
              <Input
                label="Дата"
                type="date"
                {...register("date")}
                error={errors.date?.message}
              />
              <div>
                <label className={styles.label}>Время суток</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      value="morning"
                      className={styles.radioInput}
                      {...register("timeOfDay")}
                    />
                    <span className={styles.radioLabel}>Утро</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      value="evening"
                      className={styles.radioInput}
                      {...register("timeOfDay")}
                    />
                    <span className={styles.radioLabel}>Вечер</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <Input
                label="Давление (систолическое)"
                type="number"
                placeholder="120"
                {...register("systolic", { valueAsNumber: true })}
                error={errors.systolic?.message}
                className={isBPCritical ? styles.criticalField : ""}
              />
              <Input
                label="Давление (диастолическое)"
                type="number"
                placeholder="80"
                {...register("diastolic", { valueAsNumber: true })}
                error={errors.diastolic?.message}
                className={isBPCritical ? styles.criticalField : ""}
              />
            </div>

            <div className={styles.row}>
              <Input
                label="Пульс (уд/мин)"
                type="number"
                placeholder="72"
                {...register("pulse", { valueAsNumber: true })}
                error={errors.pulse?.message}
              />
              <Input
                label="Сахар (ммоль/л)"
                type="number"
                step="0.1"
                placeholder="5.5"
                {...register("bloodSugar", { valueAsNumber: true })}
                error={errors.bloodSugar?.message}
                className={isSugarCritical ? styles.criticalField : ""}
              />
            </div>

            <Input
              label="Заметки"
              placeholder="Примечания к измерению..."
              {...register("notes")}
            />

            {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
            {submitError && <div className={styles.errorMessage}>{submitError}</div>}

            <div className={styles.actions}>
              {editingEntry && (
                <Button type="button" variant="ghost" onClick={cancelEdit}>
                  Отмена
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => reset()}>
                Очистить
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {editingEntry ? "Обновить" : "Сохранить"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {sortedEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>История измерений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.historyList}>
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`${styles.historyItem} ${editingId === entry.id ? styles.historyItemActive : ""}`}
                >
                  <div className={styles.historyInfo}>
                    <div className={styles.historyDate}>
                      {entry.date} — {entry.timeOfDay === "morning" ? "Утро" : "Вечер"}
                    </div>
                    <div className={styles.historyValues}>
                      {entry.bloodPressure && (
                        <span>{entry.bloodPressure.systolic}/{entry.bloodPressure.diastolic}</span>
                      )}
                      {entry.pulse && <span>Пульс: {entry.pulse}</span>}
                      {entry.bloodSugar !== undefined && <span>Сахар: {entry.bloodSugar}</span>}
                    </div>
                    {entry.notes && <div className={styles.historyNotes}>{entry.notes}</div>}
                  </div>
                  <div className={styles.historyActions}>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(entry)}>
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={deleteConfirm === entry.id ? styles.deleteConfirm : ""}
                      onClick={() => handleDelete(entry.id)}
                    >
                      {deleteConfirm === entry.id ? "Да?" : "✕"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
