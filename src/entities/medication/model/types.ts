export type MedicationTime = "morning" | "afternoon" | "evening";

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

export const TIME_LABELS: Record<MedicationTime, string> = {
  morning: "Утро",
  afternoon: "День",
  evening: "Вечер",
};
