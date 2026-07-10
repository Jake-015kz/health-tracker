export const CRITICAL_THRESHOLDS = {
  systolic: 140,
  diastolic: 90,
  bloodSugar: 7.0,
  pulseHigh: 100,
  pulseLow: 50,
} as const;

export const TIME_LABELS: Record<string, string> = {
  morning: "Утро",
  evening: "Вечер",
};

export const MEDICATION_TIME_LABELS: Record<string, string> = {
  morning: "Утро",
  afternoon: "День",
  evening: "Вечер",
};

export const DAY_NAMES = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export function isCriticalBloodPressure(systolic?: number, diastolic?: number): boolean {
  return (
    (systolic !== undefined && systolic >= CRITICAL_THRESHOLDS.systolic) ||
    (diastolic !== undefined && diastolic >= CRITICAL_THRESHOLDS.diastolic)
  );
}

export function isCriticalBloodSugar(sugar?: number): boolean {
  return sugar !== undefined && sugar >= CRITICAL_THRESHOLDS.bloodSugar;
}

export function isCriticalPulse(pulse?: number): boolean {
  return (
    pulse !== undefined &&
    (pulse >= CRITICAL_THRESHOLDS.pulseHigh || pulse <= CRITICAL_THRESHOLDS.pulseLow)
  );
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function generateId(): string {
  return crypto.randomUUID();
}
