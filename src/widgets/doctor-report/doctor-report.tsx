"use client";

import { useState } from "react";

import type { BiometricEntry } from "@/entities/biometrics";
import type { Medication } from "@/entities/medication";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { PDFReportButton } from "@/features/export-data/pdf-report";
import { TIME_LABELS, isCriticalBloodPressure, isCriticalBloodSugar } from "@/shared/lib/constants";

import styles from "./doctor-report.module.css";

interface DoctorReportProps {
  biometrics: BiometricEntry[];
  medications?: Medication[];
  loading: boolean;
  onEdit?: (entry: BiometricEntry) => void;
  onDelete?: (id: string) => void;
}

export function DoctorReport({
  biometrics: entries,
  medications = [],
  loading,
  onEdit,
  onDelete,
}: DoctorReportProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete?.(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  if (loading) {
    return (
      <div className={styles.reportContainer}>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className={styles.reportContainer}>
      <div className={`${styles.header} ${styles.noPrint}`}>
        <div>
          <h2>Отчёт для врача</h2>
          <p className={styles.patientInfo}>
            Печатная форма с историей всех измерений
          </p>
        </div>
        <div className={styles.buttonRow}>
          <PDFReportButton biometrics={entries} medications={medications} />
          <Button variant="secondary" onClick={handlePrint}>Печать</Button>
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <Card>
          <CardContent>
            <p className={styles.emptyMessage}>
              Нет данных для отображения. Добавьте измерения в разделе «Новое измерение».
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Давление (сист.)</th>
                    <th>Давление (диаст.)</th>
                    <th>Пульс</th>
                    <th>Сахар</th>
                    <th>Заметки</th>
                    {(onEdit || onDelete) && <th className={styles.noPrint}>Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry) => {
                    const bpCritical = isCriticalBloodPressure(
                      entry.bloodPressure?.systolic,
                      entry.bloodPressure?.diastolic,
                    );
                    const sugarCritical = isCriticalBloodSugar(entry.bloodSugar);

                    return (
                      <tr key={entry.id}>
                        <td>{entry.date}</td>
                        <td>{TIME_LABELS[entry.timeOfDay]}</td>
                        <td className={bpCritical ? styles.criticalValue : ""}>
                          {entry.bloodPressure?.systolic ?? "—"}
                        </td>
                        <td className={bpCritical ? styles.criticalValue : ""}>
                          {entry.bloodPressure?.diastolic ?? "—"}
                        </td>
                        <td>{entry.pulse ?? "—"}</td>
                        <td className={sugarCritical ? styles.criticalValue : ""}>
                          {entry.bloodSugar ?? "—"}
                        </td>
                        <td>{entry.notes ?? ""}</td>
                        {(onEdit || onDelete) && (
                          <td className={styles.noPrint}>
                            <div className={styles.rowActions}>
                              {onEdit && (
                                <button
                                  className={styles.editBtn}
                                  onClick={() => onEdit(entry)}
                                >
                                  ✏️
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  className={`${styles.deleteBtn} ${deleteConfirm === entry.id ? styles.deleteConfirm : ""}`}
                                  onClick={() => handleDelete(entry.id)}
                                >
                                  {deleteConfirm === entry.id ? "Подтвердить" : "🗑"}
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
