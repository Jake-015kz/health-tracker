"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useDataStoreContext } from "@/features/auth/data-store-context";
import { AdherenceCalendar } from "@/features/adherence-calendar/adherence-calendar";
import { ScheduleGrid } from "@/features/schedule-grid/schedule-grid";
import { WeeklySchedule } from "@/features/medication-schedule/weekly-schedule";
import { Button } from "@/shared/ui/button";

import styles from "./page.module.css";

export default function SchedulePage() {
  const router = useRouter();
  const store = useDataStoreContext();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft size={18} />
          <span>Назад</span>
        </Button>
        <h1 className={styles.title}>Расписание на неделю</h1>
      </div>

      <AdherenceCalendar
        medications={store.medications}
        medicationLogs={store.medicationLogs}
      />

      <ScheduleGrid
        medications={store.medications}
        onUpdateMedication={store.updateMedication}
      />

      <WeeklySchedule
        medications={store.medications}
        onUpdateMedication={store.updateMedication}
        onSkipMedication={store.skipMedicationForDay}
        onUnskipMedication={store.unskipMedicationForDay}
      />
    </div>
  );
}
