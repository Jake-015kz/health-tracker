"use client";

import { useState } from "react";

import type { Medication, MedicationLog, MedicationTime } from "@/entities/medication";
import { TIME_LABELS, MEDICATION_PRESETS, type MedicationPreset } from "@/entities/medication";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { getTodayString } from "@/shared/lib/constants";

import styles from "./medication-checklist.module.css";

interface MedicationChecklistProps {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  onAddMedication: (medication: Omit<Medication, "id" | "createdAt">) => Promise<Medication>;
  onUpdateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  onDeleteMedication: (id: string) => Promise<void>;
  onToggleLog: (medicationId: string, time: MedicationTime) => Promise<void>;
}

export function MedicationChecklist({
  medications,
  medicationLogs,
  onAddMedication,
  onUpdateMedication: _onUpdateMedication,
  onDeleteMedication,
  onToggleLog,
}: MedicationChecklistProps) {
  const today = getTodayString();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState<MedicationTime[]>([]);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const todayLogs = medicationLogs.filter((l) => l.date === today);

  const isTaken = (medicationId: string, time: MedicationTime) => {
    return todayLogs.some(
      (l) => l.medicationId === medicationId && l.scheduledTime === time && l.isTaken,
    );
  };

  const toggleFrequency = (time: MedicationTime) => {
    setNewFrequency((prev) =>
      prev.includes(time) ? prev.filter((f) => f !== time) : [...prev, time],
    );
  };

  const addMedication = async () => {
    if (!newName.trim() || !newDosage.trim() || newFrequency.length === 0) return;
    await onAddMedication({
      name: newName.trim(),
      dosage: newDosage.trim(),
      frequency: newFrequency,
      isActive: true,
    });
    setNewName("");
    setNewDosage("");
    setNewFrequency([]);
    setShowForm(false);
  };

  const addPreset = async (preset: MedicationPreset) => {
    const frequency = preset.frequency as MedicationTime[];
    await onAddMedication({
      name: preset.name,
      dosage: preset.dosage,
      frequency,
      isActive: true,
      activeIngredient: preset.activeIngredient,
      purpose: preset.purpose,
      stopRule: preset.stopRule,
      isConditional: preset.isConditional,
      conditionText: preset.conditionText,
      isFromHospital: preset.isFromHospital,
      prescriptionType: preset.prescriptionType,
    });
    setShowPresets(false);
  };

  const startEdit = (med: Medication) => {
    setEditingMed(med);
    setNewName(med.name);
    setNewDosage(med.dosage);
    setNewFrequency([...med.frequency]);
    setShowForm(true);
  };

  const saveEdit = async () => {
    if (!editingMed || !newName.trim() || !newDosage.trim() || newFrequency.length === 0) return;
    await _onUpdateMedication(editingMed.id, {
      name: newName.trim(),
      dosage: newDosage.trim(),
      frequency: newFrequency,
    });
    setEditingMed(null);
    setNewName("");
    setNewDosage("");
    setNewFrequency([]);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await onDeleteMedication(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const lookupAIDescription = async (medName: string) => {
    setAiLoading(true);
    setAiDescription(null);
    try {
      const res = await fetch("/api/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: medName }),
      });
      const data = await res.json();
      if (data.purpose) {
        setAiDescription(data.purpose);
      } else if (data.error) {
        setAiDescription("Не удалось получить описание: " + data.error);
      } else {
        setAiDescription("Не удалось получить описание.");
      }
    } catch {
      setAiDescription("Ошибка при запросе к AI.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Лекарства на сегодня</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.container}>
          {medications.length === 0 && !showForm && !showPresets && (
            <div className={styles.emptyState}>
              Нет добавленных лекарств. Нажмите «Добавить», чтобы начать.
            </div>
          )}

          <div className={styles.list}>
            {medications.map((med) => (
              <div key={med.id} className={styles.medicationItem}>
                <div className={styles.medicationInfo}>
                  <div className={styles.medicationName}>{med.name}</div>
                  <div className={styles.medicationDosage}>{med.dosage}</div>
                  {med.isFromHospital && (
                    <span className={styles.hospitalBadge}>Из стационара</span>
                  )}
                </div>
                <div className={styles.medicationTimes}>
                  {med.frequency.map((time) => (
                    <label key={time} className={styles.timeTag}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isTaken(med.id, time)}
                        onChange={() => onToggleLog(med.id, time)}
                      />
                      {TIME_LABELS[time]}
                    </label>
                  ))}
                </div>
                <div className={styles.actions}>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(med)}>
                    ✏️
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => lookupAIDescription(med.name)}
                    title="AI описание"
                  >
                    🤖
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${styles.deleteBtn} ${deleteConfirm === med.id ? styles.deleteConfirm : ""}`}
                    onClick={() => handleDelete(med.id)}
                  >
                    {deleteConfirm === med.id ? "Да" : "✕"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {aiLoading && <div className={styles.aiStatus}>Загрузка описания...</div>}
          {aiDescription && (
            <div className={styles.aiDescription}>
              <strong>AI-описание:</strong>
              <p>{aiDescription}</p>
              <Button variant="ghost" size="sm" onClick={() => setAiDescription(null)}>
                Закрыть
              </Button>
            </div>
          )}

          {showPresets && (
            <div className={styles.form}>
              <h3>Быстрое добавление из каталога</h3>
              <div className={styles.presetList}>
                {MEDICATION_PRESETS.map((preset, i) => (
                  <div key={i} className={styles.presetItem}>
                    <div className={styles.presetInfo}>
                      <span className={styles.presetName}>{preset.name}</span>
                      <span className={styles.presetDosage}>{preset.dosage}</span>
                    </div>
                    <Button size="sm" onClick={() => addPreset(preset)}>
                      + Добавить
                    </Button>
                  </div>
                ))}
              </div>
              <div className={styles.formActions}>
                <Button variant="ghost" onClick={() => setShowPresets(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          )}

          {showForm && (
            <div className={styles.form}>
              <h3>{editingMed ? "Редактировать лекарство" : "Новое лекарство"}</h3>
              <Input
                label="Название лекарства"
                placeholder="Аспирин"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className={styles.formRow}>
                <Input
                  label="Дозировка"
                  placeholder="100 мг"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                />
                <div>
                  <label className={styles.label}>Время приёма</label>
                  <div className={styles.checkboxGroup}>
                    {Object.entries(TIME_LABELS).map(([key, label]) => (
                      <label key={key} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={newFrequency.includes(key as MedicationTime)}
                          onChange={() => toggleFrequency(key as MedicationTime)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.formActions}>
                <Button variant="ghost" onClick={() => { setShowForm(false); setEditingMed(null); }}>
                  Отмена
                </Button>
                <Button onClick={editingMed ? saveEdit : addMedication}>
                  {editingMed ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </div>
          )}

          {!showForm && !showPresets && (
            <div className={styles.buttonRow}>
              <Button variant="secondary" onClick={() => { setShowForm(true); setEditingMed(null); }}>
                + Добавить лекарство
              </Button>
              <Button variant="secondary" onClick={() => setShowPresets(true)}>
                📋 Из каталога
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
