"use client";

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
}

export function DoctorReport({
  biometrics: entries,
  medications = [],
  loading,
}: DoctorReportProps) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const handlePrint = () => {
    window.print();
  };

  const buildReportHtml = () => `
    <html><head><meta charset="utf-8"><style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
      h1 { color: #061f12; border-bottom: 2px solid #33cb78; padding-bottom: 8px; }
      h2 { color: #061f12; margin-top: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; font-size: 14px; }
      th { background: #f5f5f5; font-weight: 600; }
      .critical { color: #e53935; font-weight: 600; }
      .med-item { padding: 4px 0; border-bottom: 1px solid #eee; }
      .footer { margin-top: 32px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
    </style></head><body>
      <h1>Отчёт для врача</h1>
      <p>Дата: ${new Date().toLocaleDateString("ru-RU")}</p>
      <h2>Измерения (${sortedEntries.length} записей)</h2>
      <table>
        <tr><th>Дата</th><th>Время</th><th>Давление</th><th>Пульс</th><th>Сахар</th><th>Заметки</th></tr>
        ${sortedEntries.map((e) => {
          const bp = e.bloodPressure;
          const bpStr = bp ? `${bp.systolic}/${bp.diastolic}` : "—";
          const bpClass = isCriticalBloodPressure(bp?.systolic, bp?.diastolic) ? ' class="critical"' : "";
          const sugarClass = isCriticalBloodSugar(e.bloodSugar) ? ' class="critical"' : "";
          return `<tr>
            <td>${e.date}</td>
            <td>${e.timeOfDay === "morning" ? "Утро" : "Вечер"}</td>
            <td${bpClass}>${bpStr}</td>
            <td>${e.pulse ?? "—"}</td>
            <td${sugarClass}>${e.bloodSugar ?? "—"}</td>
            <td>${e.notes ?? ""}</td>
          </tr>`;
        }).join("")}
      </table>
      ${medications.length > 0 ? `
        <h2>Лекарства</h2>
        ${medications.map((m) => `<div class="med-item">${m.name} — ${m.dosage} (${m.frequency.map((f) => TIME_LABELS[f] || f).join(", ")})</div>`).join("")}
      ` : ""}
      <div class="footer">Сформировано Health Tracker — ${new Date().toLocaleDateString("ru-RU")}</div>
    </body></html>
  `;

  const handleSendEmail = async () => {
    const email = prompt("Введите email врача:");
    if (!email) return;

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: `Отчёт для врача — ${new Date().toLocaleDateString("ru-RU")}`,
          body: buildReportHtml(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Отчёт отправлен!");
      } else {
        alert("Ошибка: " + (data.error || "Неизвестная ошибка"));
      }
    } catch {
      alert("Ошибка отправки. Попробуйте позже.");
    }
  };

  const handleDownload = () => {
    const html = buildReportHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `отчёт_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <Button variant="secondary" onClick={handleDownload}>⬇ Скачать</Button>
          <Button variant="secondary" onClick={handlePrint}>🖨 Печать</Button>
          <Button variant="secondary" onClick={handleSendEmail}>📧 По email</Button>
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
            {/* Таблица — десктоп */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Давление</th>
                    <th>Пульс</th>
                    <th>Сахар</th>
                    <th>Заметки</th>
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
                          {entry.bloodPressure
                            ? `${entry.bloodPressure.systolic}/${entry.bloodPressure.diastolic}`
                            : "—"}
                        </td>
                        <td>{entry.pulse ?? "—"}</td>
                        <td className={sugarCritical ? styles.criticalValue : ""}>
                          {entry.bloodSugar ?? "—"}
                        </td>
                        <td>{entry.notes ?? ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Карточки — мобилка */}
            <div className={styles.mobileCards}>
              {sortedEntries.map((entry) => {
                const bpCritical = isCriticalBloodPressure(
                  entry.bloodPressure?.systolic,
                  entry.bloodPressure?.diastolic,
                );
                const sugarCritical = isCriticalBloodSugar(entry.bloodSugar);

                return (
                  <div key={entry.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardDate}>
                      {entry.date} — {TIME_LABELS[entry.timeOfDay]}
                    </div>
                    <div className={styles.mobileCardValues}>
                      {entry.bloodPressure && (
                        <span className={bpCritical ? styles.criticalValue : ""}>
                          Давление: {entry.bloodPressure.systolic}/{entry.bloodPressure.diastolic}
                        </span>
                      )}
                      {entry.pulse && <span>Пульс: {entry.pulse}</span>}
                      {entry.bloodSugar !== undefined && (
                        <span className={sugarCritical ? styles.criticalValue : ""}>
                          Сахар: {entry.bloodSugar}
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <div className={styles.mobileCardNote}>{entry.notes}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
