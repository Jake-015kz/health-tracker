import { z } from "zod";

export const medicationSchema = z.object({
  name: z
    .string({ message: "Название лекарства обязательно" })
    .min(1, { message: "Введите название лекарства" })
    .max(200, { message: "Максимум 200 символов" }),
  dosage: z
    .string({ message: "Дозировка обязательна" })
    .min(1, { message: "Введите дозировку" })
    .max(100, { message: "Максимум 100 символов" }),
  frequency: z
    .array(z.enum(["morning", "afternoon", "evening"]))
    .min(1, { message: "Выберите хотя бы одно время приёма" }),
  notes: z.string().max(500).optional(),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;
