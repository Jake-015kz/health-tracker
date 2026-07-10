"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "./model/use-auth";
import { useDataStore } from "./model/use-data-store";
import type { BiometricEntry } from "@/entities/biometrics";
import type { Medication, MedicationLog, MedicationTime, MedicationOverride, AdHocMedication } from "@/entities/medication";

interface DataStoreContextValue {
  biometrics: BiometricEntry[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  adHocMedications: AdHocMedication[];
  loading: boolean;
  addBiometric: (entry: Omit<BiometricEntry, "id" | "timestamp">) => Promise<BiometricEntry>;
  updateBiometric: (id: string, updates: Partial<BiometricEntry>) => Promise<void>;
  deleteBiometric: (id: string) => Promise<void>;
  addMedication: (med: Omit<Medication, "id" | "createdAt">) => Promise<Medication>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  removeMedicationTime: (id: string, time: MedicationTime) => Promise<void>;
  setOverride: (medicationId: string, date: string, override: MedicationOverride | null) => Promise<void>;
  skipMedicationForDay: (medicationId: string, date: string) => Promise<void>;
  unskipMedicationForDay: (medicationId: string, date: string) => Promise<void>;
  toggleMedLog: (medicationId: string, scheduledTime: string, date?: string) => Promise<void>;
  addAdHocMedication: (med: Omit<AdHocMedication, "id" | "createdAt" | "isTaken">) => Promise<AdHocMedication>;
  toggleAdHocMedication: (id: string) => Promise<void>;
  deleteAdHocMedication: (id: string) => Promise<void>;
  migrateLocalStorage: () => Promise<void>;
}

const DataStoreContext = createContext<DataStoreContextValue | null>(null);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const store = useDataStore(user);

  return (
    <DataStoreContext.Provider value={store}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStoreContext() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error("useDataStoreContext must be used within DataStoreProvider");
  return ctx;
}
