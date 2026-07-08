export type TimeOfDay = "morning" | "evening";

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export interface BiometricEntry {
  id: string;
  date: string;
  timeOfDay: TimeOfDay;
  timestamp: string;
  bloodPressure?: BloodPressure;
  pulse?: number;
  bloodSugar?: number;
  notes?: string;
}

export interface BiometricRange {
  label: string;
  min: number;
  max: number;
  unit: string;
}

export const BLOOD_PRESSURE_RANGES: Record<string, BiometricRange> = {
  normal: { label: "Норма", min: 0, max: 120, unit: "mmHg" },
  elevated: { label: "Повышенное", min: 120, max: 140, unit: "mmHg" },
  high: { label: "Высокое", min: 140, max: Infinity, unit: "mmHg" },
};

export const BLOOD_SUGAR_RANGES: Record<string, BiometricRange> = {
  normal: { label: "Норма", min: 0, max: 6.1, unit: "mmol/L" },
  elevated: { label: "Повышенный", min: 6.1, max: 7.0, unit: "mmol/L" },
  high: { label: "Высокий", min: 7.0, max: Infinity, unit: "mmol/L" },
};
