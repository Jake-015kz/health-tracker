import type { Medication } from "./types";

export interface MedicationPreset {
  name: string;
  activeIngredient: string;
  dosage: string;
  purpose: string;
  stopRule: string;
  isConditional: boolean;
  conditionText: string;
  isFromHospital: boolean;
  prescriptionType: "rx" | "otc" | "unknown";
  frequency: Medication["frequency"];
}

export const MEDICATION_PRESETS: MedicationPreset[] = [
  {
    name: "Контролок",
    activeIngredient: "Пантопразол",
    dosage: "40 мг",
    purpose: "Защита желудка от действия аспирина",
    stopRule: "За 30 минут до еды, утром",
    isConditional: false,
    conditionText: "",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning"],
  },
  {
    name: "Ронноцит",
    activeIngredient: "Мельдоний",
    dosage: "500 мг",
    purpose: "Улучшение метаболизма миокарда",
    stopRule: "Утром, 1 таблетка",
    isConditional: false,
    conditionText: "",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning"],
  },
  {
    name: "Дапаглисан",
    activeIngredient: "Дапаглифлозин",
    dosage: "10 мг",
    purpose: "Защита сердца и почек при диабете",
    stopRule: "Утром, 1 таблетка",
    isConditional: false,
    conditionText: "",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning"],
  },
  {
    name: "Глюкованс",
    activeIngredient: "Глибенкламид + Метформин",
    dosage: "1 таблетка",
    purpose: "Снижение сахара в крови",
    isConditional: true,
    conditionText: "Принимать ТОЛЬКО если сахар утром > 7.0 ммоль/л",
    stopRule: "Зависит от уровня сахара",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning", "evening"],
  },
  {
    name: "Индап",
    activeIngredient: "Индапамид",
    dosage: "1.5 мг",
    purpose: "Мочегонное, снижение давления",
    isConditional: true,
    conditionText: "Принимать ТОЛЬКО если давление ≥ 140/90 мм рт. ст.",
    stopRule: "Зависит от давления",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning"],
  },
  {
    name: "Конкор",
    activeIngredient: "Бисопролол",
    dosage: "5 мг",
    purpose: "Снижение пульса и давления",
    isConditional: true,
    conditionText: "Принимать ТОЛЬКО если пульс > 75 уд/мин",
    stopRule: "Зависит от пульса",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning"],
  },
  {
    name: "Аспирин Кардио",
    activeIngredient: "Ацетилсалициловая кислота",
    dosage: "100 мг",
    purpose: "Разжижение крови, профилактика тромбов",
    stopRule: "После еды",
    isConditional: false,
    conditionText: "",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning"],
  },
  {
    name: "Фенибут",
    activeIngredient: "Фенибут",
    dosage: "250 мг",
    purpose: "Ноотропное, улучшение мозгового кровообращения",
    isConditional: true,
    conditionText: "Принимать 1-2 таблетки при стрессе или тревожности",
    stopRule: "При необходимости",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning", "afternoon", "evening"],
  },
  {
    name: "Берлиприл",
    activeIngredient: "Эналаприл",
    dosage: "5 мг",
    purpose: "Ингибитор АПФ, снижение давления",
    isConditional: true,
    conditionText: "Принимать ТОЛЬКО если давление ≥ 140/90 мм рт. ст.",
    stopRule: "Зависит от давления",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["morning"],
  },
  {
    name: "Росукар",
    activeIngredient: "Розувастатин",
    dosage: "10 мг",
    purpose: "Снижение холестерина",
    stopRule: "Вечер перед сном",
    isConditional: false,
    conditionText: "",
    isFromHospital: true,
    prescriptionType: "rx",
    frequency: ["evening"],
  },
];
