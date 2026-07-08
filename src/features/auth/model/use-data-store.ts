"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

import type { BiometricEntry } from "@/entities/biometrics";
import type { Medication, MedicationLog } from "@/entities/medication";
import { storageKeys, loadFromStorage, saveToStorage } from "@/shared/lib/storage";
import { generateId, getTodayString } from "@/shared/lib/constants";

export function useDataStore(user: User | null) {
  const [biometrics, setBiometrics] = useState<BiometricEntry[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // ── Загрузка данных ──
  useEffect(() => {
    if (!user) {
      setBiometrics(loadFromStorage<BiometricEntry[]>(storageKeys.biometrics, []));
      setMedications(loadFromStorage<Medication[]>(storageKeys.medications, []));
      setMedicationLogs(loadFromStorage<MedicationLog[]>(storageKeys.medicationLogs, []));
      setLoading(false);
      return;
    }

    const loadFromSupabase = async () => {
      const [bioRes, medRes, logRes] = await Promise.all([
        supabase.from("biometric_entries").select("*").eq("user_id", user.id),
        supabase.from("medications").select("*").eq("user_id", user.id),
        supabase.from("medication_logs").select("*").eq("user_id", user.id),
      ]);

      const mapBio = (e: Record<string, unknown>): BiometricEntry => ({
        id: e.id as string,
        date: e.date as string,
        timeOfDay: e.time_of_day as BiometricEntry["timeOfDay"],
        timestamp: e.created_at as string,
        bloodPressure:
          e.systolic != null && e.diastolic != null
            ? { systolic: e.systolic as number, diastolic: e.diastolic as number }
            : undefined,
        pulse: (e.pulse as number) ?? undefined,
        bloodSugar: (e.blood_sugar as number) ?? undefined,
        notes: (e.notes as string) ?? undefined,
      });

      const mapMed = (m: Record<string, unknown>): Medication => ({
        id: m.id as string,
        name: m.name as string,
        activeIngredient: (m.active_ingredient as string) ?? undefined,
        dosage: m.dosage as string,
        purpose: (m.purpose as string) ?? undefined,
        stopRule: (m.stop_rule as string) ?? undefined,
        isConditional: (m.is_conditional as boolean) ?? false,
        conditionText: (m.condition_text as string) ?? undefined,
        isFromHospital: (m.is_from_hospital as boolean) ?? false,
        prescriptionType: (m.prescription_type as Medication["prescriptionType"]) ?? "unknown",
        frequency: m.frequency as Medication["frequency"],
        notes: (m.notes as string) ?? undefined,
        isActive: m.is_active as boolean,
        createdAt: m.created_at as string,
      });

      const mapLog = (l: Record<string, unknown>): MedicationLog => ({
        id: l.id as string,
        medicationId: l.medication_id as string,
        scheduledTime: l.scheduled_time as MedicationLog["scheduledTime"],
        isTaken: l.is_taken as boolean,
        takenAt: (l.taken_at as string) ?? undefined,
        date: l.date as string,
      });

      setBiometrics((bioRes.data ?? []).map(mapBio));
      setMedications((medRes.data ?? []).map(mapMed));
      setMedicationLogs((logRes.data ?? []).map(mapLog));
      setLoading(false);
    };

    loadFromSupabase();
  }, [user, supabase]);

  // ── Миграция localStorage → Supabase ──
  const migrateLocalStorage = useCallback(async () => {
    if (!user) return;

    const localBio = loadFromStorage<BiometricEntry[]>(storageKeys.biometrics, []);
    const localMeds = loadFromStorage<Medication[]>(storageKeys.medications, []);
    const localLogs = loadFromStorage<MedicationLog[]>(storageKeys.medicationLogs, []);

    if (localBio.length === 0 && localMeds.length === 0 && localLogs.length === 0) return;

    if (localBio.length > 0) {
      await supabase.from("biometric_entries").insert(
        localBio.map((e) => ({
          id: e.id,
          user_id: user.id,
          date: e.date,
          time_of_day: e.timeOfDay,
          systolic: e.bloodPressure?.systolic,
          diastolic: e.bloodPressure?.diastolic,
          pulse: e.pulse,
          blood_sugar: e.bloodSugar,
          notes: e.notes,
        })),
      );
    }

    if (localMeds.length > 0) {
      await supabase.from("medications").insert(
        localMeds.map((m) => ({
          id: m.id,
          user_id: user.id,
          name: m.name,
          active_ingredient: m.activeIngredient,
          dosage: m.dosage,
          purpose: m.purpose,
          stop_rule: m.stopRule,
          is_conditional: m.isConditional,
          condition_text: m.conditionText,
          is_from_hospital: m.isFromHospital,
          prescription_type: m.prescriptionType,
          frequency: m.frequency,
          notes: m.notes,
          is_active: m.isActive,
        })),
      );
    }

    if (localLogs.length > 0) {
      await supabase.from("medication_logs").insert(
        localLogs.map((l) => ({
          id: l.id,
          user_id: user.id,
          medication_id: l.medicationId,
          scheduled_time: l.scheduledTime,
          is_taken: l.isTaken,
          taken_at: l.takenAt,
          date: l.date,
        })),
      );
    }

    localStorage.removeItem(storageKeys.biometrics);
    localStorage.removeItem(storageKeys.medications);
    localStorage.removeItem(storageKeys.medicationLogs);
  }, [user, supabase]);

  // ── CRUD: Биометрия ──
  const addBiometric = useCallback(
    async (entry: Omit<BiometricEntry, "id" | "timestamp">) => {
      const newEntry: BiometricEntry = {
        ...entry,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };

      if (user) {
        await supabase.from("biometric_entries").insert({
          id: newEntry.id,
          user_id: user.id,
          date: newEntry.date,
          time_of_day: newEntry.timeOfDay,
          systolic: newEntry.bloodPressure?.systolic,
          diastolic: newEntry.bloodPressure?.diastolic,
          pulse: newEntry.pulse,
          blood_sugar: newEntry.bloodSugar,
          notes: newEntry.notes,
        });
      } else {
        saveToStorage(storageKeys.biometrics, [...biometrics, newEntry]);
      }

      setBiometrics((prev) => [...prev, newEntry]);
      return newEntry;
    },
    [user, biometrics, supabase],
  );

  const updateBiometric = useCallback(
    async (id: string, updates: Partial<BiometricEntry>) => {
      if (user) {
        await supabase
          .from("biometric_entries")
          .update({
            date: updates.date,
            time_of_day: updates.timeOfDay,
            systolic: updates.bloodPressure?.systolic,
            diastolic: updates.bloodPressure?.diastolic,
            pulse: updates.pulse,
            blood_sugar: updates.bloodSugar,
            notes: updates.notes,
          })
          .eq("id", id);
      } else {
        const updated = biometrics.map((e) => (e.id === id ? { ...e, ...updates } : e));
        saveToStorage(storageKeys.biometrics, updated);
      }

      setBiometrics((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    },
    [user, biometrics, supabase],
  );

  const deleteBiometric = useCallback(
    async (id: string) => {
      if (user) {
        await supabase.from("biometric_entries").delete().eq("id", id);
      } else {
        saveToStorage(
          storageKeys.biometrics,
          biometrics.filter((e) => e.id !== id),
        );
      }

      setBiometrics((prev) => prev.filter((e) => e.id !== id));
    },
    [user, biometrics, supabase],
  );

  // ── CRUD: Лекарства ──
  const addMedication = useCallback(
    async (med: Omit<Medication, "id" | "createdAt">) => {
      const newMed: Medication = {
        ...med,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };

      if (user) {
        await supabase.from("medications").insert({
          id: newMed.id,
          user_id: user.id,
          name: newMed.name,
          active_ingredient: newMed.activeIngredient,
          dosage: newMed.dosage,
          purpose: newMed.purpose,
          stop_rule: newMed.stopRule,
          is_conditional: newMed.isConditional,
          condition_text: newMed.conditionText,
          is_from_hospital: newMed.isFromHospital,
          prescription_type: newMed.prescriptionType,
          frequency: newMed.frequency,
          notes: newMed.notes,
          is_active: newMed.isActive,
        });
      } else {
        saveToStorage(storageKeys.medications, [...medications, newMed]);
      }

      setMedications((prev) => [...prev, newMed]);
      return newMed;
    },
    [user, medications, supabase],
  );

  const updateMedication = useCallback(
    async (id: string, updates: Partial<Medication>) => {
      if (user) {
        await supabase
          .from("medications")
          .update({
            name: updates.name,
            active_ingredient: updates.activeIngredient,
            dosage: updates.dosage,
            purpose: updates.purpose,
            stop_rule: updates.stopRule,
            is_conditional: updates.isConditional,
            condition_text: updates.conditionText,
            is_from_hospital: updates.isFromHospital,
            prescription_type: updates.prescriptionType,
            frequency: updates.frequency,
            notes: updates.notes,
            is_active: updates.isActive,
          })
          .eq("id", id);
      } else {
        const updated = medications.map((m) => (m.id === id ? { ...m, ...updates } : m));
        saveToStorage(storageKeys.medications, updated);
      }

      setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    },
    [user, medications, supabase],
  );

  const deleteMedication = useCallback(
    async (id: string) => {
      if (user) {
        await supabase.from("medications").delete().eq("id", id);
      } else {
        saveToStorage(
          storageKeys.medications,
          medications.filter((m) => m.id !== id),
        );
      }

      setMedications((prev) => prev.filter((m) => m.id !== id));
    },
    [user, medications, supabase],
  );

  // ── CRUD: Логи приёма ──
  const toggleMedLog = useCallback(
    async (medicationId: string, scheduledTime: string, date?: string) => {
      const logDate = date ?? getTodayString();
      const existing = medicationLogs.find(
        (l) =>
          l.medicationId === medicationId && l.scheduledTime === scheduledTime && l.date === logDate,
      );

      if (existing) {
        const newIsTaken = !existing.isTaken;
        if (user) {
          await supabase
            .from("medication_logs")
            .update({
              is_taken: newIsTaken,
              taken_at: newIsTaken ? new Date().toISOString() : null,
            })
            .eq("id", existing.id);
        } else {
          const updated = medicationLogs.map((l) =>
            l.id === existing.id
              ? {
                  ...l,
                  isTaken: newIsTaken,
                  takenAt: newIsTaken ? new Date().toISOString() : undefined,
                }
              : l,
          );
          saveToStorage(storageKeys.medicationLogs, updated);
        }

        setMedicationLogs((prev) =>
          prev.map((l) =>
            l.id === existing.id
              ? {
                  ...l,
                  isTaken: newIsTaken,
                  takenAt: newIsTaken ? new Date().toISOString() : undefined,
                }
              : l,
          ),
        );
      } else {
        const newLog: MedicationLog = {
          id: generateId(),
          medicationId,
          scheduledTime: scheduledTime as MedicationLog["scheduledTime"],
          isTaken: true,
          takenAt: new Date().toISOString(),
          date: logDate,
        };

        if (user) {
          await supabase.from("medication_logs").insert({
            id: newLog.id,
            user_id: user.id,
            medication_id: newLog.medicationId,
            scheduled_time: newLog.scheduledTime,
            is_taken: true,
            taken_at: newLog.takenAt,
            date: newLog.date,
          });
        } else {
          saveToStorage(storageKeys.medicationLogs, [...medicationLogs, newLog]);
        }

        setMedicationLogs((prev) => [...prev, newLog]);
      }
    },
    [user, medicationLogs, supabase],
  );

  return {
    biometrics,
    medications,
    medicationLogs,
    loading,
    addBiometric,
    updateBiometric,
    deleteBiometric,
    addMedication,
    updateMedication,
    deleteMedication,
    toggleMedLog,
    migrateLocalStorage,
  };
}
