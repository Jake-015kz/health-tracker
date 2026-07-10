"use client";

import { useState, useEffect } from "react";

import { useAuth, useDataStore } from "@/features/auth";
import { LogMetrics } from "@/features/log-metrics";
import { MedicationChecklist } from "@/features/medication-checklist";
import { ExportData } from "@/features/export-data";
import { Dashboard } from "@/widgets/dashboard";
import { DoctorReport } from "@/widgets/doctor-report";
import {
  requestNotificationPermission,
  scheduleMedicationReminders,
} from "@/shared/lib/notifications";

import styles from "./page.module.css";

type TabId = "overview" | "log" | "medications" | "schedule" | "report" | "export";

const HASH_TO_TAB: Record<string, TabId> = {
  "": "overview",
  log: "log",
  medications: "medications",
  schedule: "schedule",
  report: "report",
  export: "export",
};

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "log", label: "Новое измерение" },
  { id: "medications", label: "Лекарства" },
  { id: "schedule", label: "Расписание" },
  { id: "report", label: "Отчёт для врача" },
  { id: "export", label: "Экспорт" },
];

function getTabFromHash(): TabId {
  if (typeof window === "undefined") return "overview";
  const hash = window.location.hash.replace("#", "");
  return HASH_TO_TAB[hash] ?? "overview";
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { user } = useAuth();
  const store = useDataStore(user);

  useEffect(() => {
    setActiveTab(getTabFromHash());

    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (store.medications.length > 0 && !store.loading) {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          scheduleMedicationReminders(store.medications);
        }
      });
    }
  }, [store.medications, store.loading]);

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    if (tabId === "overview") {
      window.history.replaceState(null, "", "/dashboard");
    } else {
      window.history.replaceState(null, "", `/dashboard#${tabId}`);
    }
  };

  return (
    <main className={styles.page}>
      <select
        className={styles.tabsMobile}
        value={activeTab}
        onChange={(e) => handleTabClick(e.target.value as TabId)}
      >
        {TABS.map((tab) => (
          <option key={tab.id} value={tab.id}>
            {tab.label}
          </option>
        ))}
      </select>

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
            mode="checklist"
            medications={store.medications}
            medicationLogs={store.medicationLogs}
            adHocMedications={store.adHocMedications}
            onAddMedication={store.addMedication}
            onUpdateMedication={store.updateMedication}
            onDeleteMedication={store.deleteMedication}
            onToggleLog={store.toggleMedLog}
            onAddAdHoc={store.addAdHocMedication}
            onToggleAdHoc={store.toggleAdHocMedication}
            onDeleteAdHoc={store.deleteAdHocMedication}
          />
        )}
        {activeTab === "schedule" && (
          <MedicationChecklist
            mode="schedule"
            medications={store.medications}
            medicationLogs={store.medicationLogs}
            adHocMedications={store.adHocMedications}
            onAddMedication={store.addMedication}
            onUpdateMedication={store.updateMedication}
            onDeleteMedication={store.deleteMedication}
            onToggleLog={store.toggleMedLog}
            onAddAdHoc={store.addAdHocMedication}
            onToggleAdHoc={store.toggleAdHocMedication}
            onDeleteAdHoc={store.deleteAdHocMedication}
          />
        )}
        {activeTab === "report" && (
          <DoctorReport
            biometrics={store.biometrics}
            medications={store.medications}
            loading={store.loading}
          />
        )}
        {activeTab === "export" && (
          <ExportData biometrics={store.biometrics} loading={store.loading} />
        )}
      </div>
    </main>
  );
}
