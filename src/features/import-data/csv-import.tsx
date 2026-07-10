"use client";

import { useState, useRef } from "react";
import type { BiometricEntry } from "@/entities/biometrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

import styles from "./csv-import.module.css";

interface CsvImportProps {
  onImport: (entries: Omit<BiometricEntry, "id" | "timestamp">[]) => Promise<void>;
}

export function CsvImport({ onImport }: CsvImportProps) {
  const [preview, setPreview] = useState<Omit<BiometricEntry, "id" | "timestamp">[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Omit<BiometricEntry, "id" | "timestamp">[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) throw new Error("Файл пуст или не содержит данных");

    const header = lines[0].toLowerCase();
    const entries: Omit<BiometricEntry, "id" | "timestamp">[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 3) continue;

      const [date, timeOfDay, systolic, diastolic, pulse, bloodSugar, notes] = cols;

      if (!date || !timeOfDay) continue;

      entries.push({
        date,
        timeOfDay: (timeOfDay === "вечер" || timeOfDay === "evening" ? "evening" : "morning") as "morning" | "evening",
        bloodPressure: systolic && diastolic
          ? { systolic: parseInt(systolic), diastolic: parseInt(diastolic) }
          : undefined,
        pulse: pulse ? parseInt(pulse) : undefined,
        bloodSugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
        notes: notes || undefined,
      });
    }

    return entries;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDone(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const entries = parseCSV(text);
        if (entries.length === 0) {
          setError("Не удалось распознать записи. Проверьте формат файла.");
          return;
        }
        setPreview(entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка чтения файла");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    try {
      await onImport(preview);
      setDone(true);
      setPreview([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка импорта");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Импорт данных из CSV</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.container}>
          <p className={styles.hint}>
            Формат: дата, время (утро/вечер), систолическое, диастолическое, пульс, сахар, заметки
          </p>
          <p className={styles.hint}>
            Пример: 2026-07-10,утро,120,80,72,5.5,После еды
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className={styles.fileInput}
          />

          {preview.length > 0 && (
            <div className={styles.preview}>
              <div className={styles.previewHeader}>
                <span>Найдено записей: {preview.length}</span>
              </div>
              <div className={styles.previewList}>
                {preview.slice(0, 5).map((entry, i) => (
                  <div key={i} className={styles.previewItem}>
                    {entry.date} — {entry.timeOfDay === "morning" ? "Утро" : "Вечер"}
                    {entry.bloodPressure && ` | ${entry.bloodPressure.systolic}/${entry.bloodPressure.diastolic}`}
                    {entry.pulse && ` | Пульс: ${entry.pulse}`}
                  </div>
                ))}
                {preview.length > 5 && (
                  <div className={styles.previewMore}>...и ещё {preview.length - 5}</div>
                )}
              </div>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? "Импорт..." : `Импортировать ${preview.length} записей`}
              </Button>
            </div>
          )}

          {done && <div className={styles.success}>Данные успешно импортированы!</div>}
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
