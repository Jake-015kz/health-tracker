import { z } from "zod";

export const bloodPressureSchema = z.object({
  systolic: z
    .number({ message: "Систолическое давление должно быть числом" })
    .min(60, { message: "Минимальное значение: 60" })
    .max(250, { message: "Максимальное значение: 250" }),
  diastolic: z
    .number({ message: "Диастолическое давление должно быть числом" })
    .min(30, { message: "Минимальное значение: 30" })
    .max(160, { message: "Максимальное значение: 160" }),
});

export const biometricEntrySchema = z.object({
  date: z.string().min(1, { message: "Дата обязательна" }),
  timeOfDay: z.enum(["morning", "evening"], {
    message: "Выберите время суток",
  }),
  systolic: z
    .number({ message: "Систолическое давление должно быть числом" })
    .min(60, { message: "Мин: 60" })
    .max(250, { message: "Макс: 250" })
    .optional()
    .or(z.nan()),
  diastolic: z
    .number({ message: "Диастолическое давление должно быть числом" })
    .min(30, { message: "Мин: 30" })
    .max(160, { message: "Макс: 160" })
    .optional()
    .or(z.nan()),
  pulse: z
    .number({ message: "Пульс должен быть числом" })
    .min(30, { message: "Мин: 30" })
    .max(220, { message: "Макс: 220" })
    .optional()
    .or(z.nan()),
  bloodSugar: z
    .number({ message: "Сахар должен быть числом" })
    .min(1, { message: "Мин: 1" })
    .max(35, { message: "Макс: 35" })
    .optional()
    .or(z.nan()),
  notes: z.string().max(500).optional(),
});

export type BiometricEntryFormData = z.infer<typeof biometricEntrySchema>;
