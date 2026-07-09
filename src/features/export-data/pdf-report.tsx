"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import type { BiometricEntry } from "@/entities/biometrics";
import type { Medication } from "@/entities/medication";
import { TIME_LABELS } from "@/shared/lib/constants";
import { Button } from "@/shared/ui/button";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#061f12",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#33cb78",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#33cb78",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableCell: {
    fontSize: 9,
  },
  cellDate: { width: 70 },
  cellTime: { width: 50 },
  cellSystolic: { width: 55 },
  cellDiastolic: { width: 55 },
  cellPulse: { width: 45 },
  cellSugar: { width: 45 },
  cellNotes: { flex: 1 },
  criticalValue: {
    color: "#e53935",
    fontWeight: "bold",
  },
  medItem: {
    flexDirection: "row",
    padding: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  medName: { width: 120, fontWeight: "bold" },
  medDosage: { width: 80 },
  medPurpose: { flex: 1, fontSize: 8, color: "#6b7280" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

interface PDFReportProps {
  biometrics: BiometricEntry[];
  medications: Medication[];
}

function PDFDocument({ biometrics, medications }: PDFReportProps) {
  const sorted = [...biometrics].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Отчёт для врача</Text>
          <Text style={pdfStyles.subtitle}>Сформировано: {today}</Text>
        </View>

        {medications.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Препараты</Text>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellDate]}>Название</Text>
              <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellTime]}>Дозировка</Text>
              <Text style={[pdfStyles.tableHeaderText, { flex: 1 }]}>Назначение</Text>
            </View>
            {medications.map((med) => (
              <View key={med.id} style={pdfStyles.medItem}>
                <Text style={pdfStyles.medName}>{med.name}</Text>
                <Text style={pdfStyles.medDosage}>{med.dosage}</Text>
                <Text style={pdfStyles.medPurpose}>{med.purpose || "—"}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Измерения</Text>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellDate]}>Дата</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellTime]}>Время</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellSystolic]}>Сист.</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellDiastolic]}>Диаст.</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellPulse]}>Пульс</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellSugar]}>Сахар</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.cellNotes]}>Заметки</Text>
          </View>
          {sorted.map((entry) => {
            const sysCrit = (entry.bloodPressure?.systolic ?? 0) >= 140;
            const diaCrit = (entry.bloodPressure?.diastolic ?? 0) >= 90;
            const sugarCrit = (entry.bloodSugar ?? 0) >= 7.0;

            const sysStyle = sysCrit
              ? [pdfStyles.tableCell, pdfStyles.cellSystolic, pdfStyles.criticalValue]
              : [pdfStyles.tableCell, pdfStyles.cellSystolic];
            const diaStyle = diaCrit
              ? [pdfStyles.tableCell, pdfStyles.cellDiastolic, pdfStyles.criticalValue]
              : [pdfStyles.tableCell, pdfStyles.cellDiastolic];
            const sugarStyle = sugarCrit
              ? [pdfStyles.tableCell, pdfStyles.cellSugar, pdfStyles.criticalValue]
              : [pdfStyles.tableCell, pdfStyles.cellSugar];

            return (
              <View key={entry.id} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.cellDate]}>{entry.date}</Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.cellTime]}>
                  {TIME_LABELS[entry.timeOfDay]}
                </Text>
                <Text style={sysStyle}>
                  {entry.bloodPressure?.systolic ?? "—"}
                </Text>
                <Text style={diaStyle}>
                  {entry.bloodPressure?.diastolic ?? "—"}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.cellPulse]}>
                  {entry.pulse ?? "—"}
                </Text>
                <Text style={sugarStyle}>
                  {entry.bloodSugar ?? "—"}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.cellNotes]}>{entry.notes ?? ""}</Text>
              </View>
            );
          })}
        </View>

        <Text style={pdfStyles.footer}>
          Health Tracker — Мониторинг здоровья после инсульта
        </Text>
      </Page>
    </Document>
  );
}

interface PDFReportButtonProps {
  biometrics: BiometricEntry[];
  medications: Medication[];
}

export function PDFReportButton({ biometrics, medications }: PDFReportButtonProps) {
  return (
    <PDFDownloadLink
      document={<PDFDocument biometrics={biometrics} medications={medications} />}
      fileName={`health-report-${new Date().toISOString().split("T")[0]}.pdf`}
    >
      {({ loading }) => (
        <Button disabled={loading}>
          {loading ? "Генерация PDF..." : "Скачать PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
