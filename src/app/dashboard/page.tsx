"use client";

import { useState } from "react";

import { useAuth, useDataStore } from "@/features/auth";
import { LogMetrics } from "@/features/log-metrics";
import { MedicationChecklist } from "@/features/medication-checklist";
import { ExportData } from "@/features/export-data";
import { Dashboard } from "@/widgets/dashboard";
import { DoctorReport } from "@/widgets/doctor-report";

import styles from "./page.module.css";

type TabId = "overview" | "log" | "medications" | "report" | "export";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "log", label: "Новое измерение" },
  { id: "medications", label: "Лекарства" },
  { id: "report", label: "Отчёт для врача" },
  { id: "export", label: "Экспорт" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { user } = useAuth();
  const store = useDataStore(user);

  return (
    <main className={styles.page}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === "overview" && (
          <Dashboard biometrics={store.biometrics} loading={store.loading} />
        )}
        {activeTab === "log" && (
          <LogMetrics
            biometrics={store.biometrics}
            onAdd={store.addBiometric}
            onUpdate={store.updateBiometric}
            onDelete={store.deleteBiometric}
          />
        )}
        {activeTab === "medications" && (
          <MedicationChecklist
            medications={store.medications}
            medicationLogs={store.medicationLogs}
            onAddMedication={store.addMedication}
            onUpdateMedication={store.updateMedication}
            onDeleteMedication={store.deleteMedication}
            onToggleLog={store.toggleMedLog}
          />
        )}
        {activeTab === "report" && (
          <DoctorReport biometrics={store.biometrics} loading={store.loading} />
        )}
        {activeTab === "export" && (
          <ExportData biometrics={store.biometrics} loading={store.loading} />
        )}
      </div>
    </main>
  );
}
