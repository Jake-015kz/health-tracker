export type MedicationTime = "morning" | "afternoon" | "evening";

export interface MedicationOverride {
  skip?: boolean;
  added?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  activeIngredient?: string;
  dosage: string;
  purpose?: string;
  stopRule?: string;
  isConditional?: boolean;
  conditionText?: string;
  isFromHospital?: boolean;
  prescriptionType?: "rx" | "otc" | "unknown";
  frequency: MedicationTime[];
  notes?: string;
  isActive: boolean;
  groupId?: string;
  sortOrder?: number;
  overrides?: Record<string, MedicationOverride>;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: MedicationTime;
  takenAt?: string;
  isTaken: boolean;
  date: string;
}

export interface AdHocMedication {
  id: string;
  name: string;
  dosage: string;
  time: MedicationTime;
  date: string;
  isTaken: boolean;
  takenAt?: string;
  createdAt: string;
}

export const TIME_LABELS: Record<MedicationTime, string> = {
  morning: "Утро",
  afternoon: "День",
  evening: "Вечер",
};

export const TIME_ICONS: Record<MedicationTime, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
};
