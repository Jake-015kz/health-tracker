"use client";

import { useState, useMemo, useCallback } from "react";

import type { Medication, MedicationLog, MedicationTime, AdHocMedication } from "@/entities/medication";
import { TIME_LABELS, TIME_ICONS, MEDICATION_PRESETS, type MedicationPreset } from "@/entities/medication";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { getTodayString } from "@/shared/lib/constants";

import styles from "./medication-checklist.module.css";

const TIME_ORDER: MedicationTime[] = ["morning", "afternoon", "evening"];

interface MedicationChecklistProps {
  mode?: "checklist" | "schedule";
  medications: Medication[];
  medicationLogs: MedicationLog[];
  adHocMedications: AdHocMedication[];
  onAddMedication: (medication: Omit<Medication, "id" | "createdAt">) => Promise<Medication>;
  onUpdateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  onDeleteMedication: (id: string) => Promise<void>;
  onRemoveFromTime?: (id: string, time: MedicationTime) => Promise<void>;
  onToggleLog: (medicationId: string, time: MedicationTime) => Promise<void>;
  onAddAdHoc: (med: Omit<AdHocMedication, "id" | "createdAt" | "isTaken">) => Promise<AdHocMedication>;
  onToggleAdHoc: (id: string) => Promise<void>;
  onDeleteAdHoc: (id: string) => Promise<void>;
  onSkipMedication?: (id: string, date: string) => Promise<void>;
  onUnskipMedication?: (id: string, date: string) => Promise<void>;
}

export function MedicationChecklist({
  mode = "checklist",
  medications,
  medicationLogs,
  adHocMedications,
  onAddMedication,
  onUpdateMedication: _onUpdateMedication,
  onDeleteMedication,
  onRemoveFromTime,
  onToggleLog,
  onAddAdHoc,
  onToggleAdHoc,
  onDeleteAdHoc,
  onSkipMedication,
  onUnskipMedication,
}: MedicationChecklistProps) {
  const today = getTodayString();
  const [showForm, setShowForm] = useState(false);
  const [showAdHocForm, setShowAdHocForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState<MedicationTime[]>([]);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const todayLogs = medicationLogs.filter((l) => l.date === today);
  const todayAdHoc = adHocMedications.filter((m) => m.date === today);

  const isSkippedForDate = (med: Medication, dateStr: string) =>
    med.overrides?.[dateStr]?.skip === true;

  // Adherence Score за 7 дней
  const adherenceScore = useMemo(() => {
    if (medications.length === 0) return null;
    const days = 7;
    const now = new Date();
    let totalSlots = 0;
    let takenSlots = 0;
    const processedGroups = new Set<string>();
    for (const med of medications) {
      const freq =
        med.groupId && processedGroups.has(med.groupId)
          ? []
          : (med.groupId && processedGroups.add(med.groupId), med.frequency);
      for (let d = 0; d < days; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split("T")[0];
        if (isSkippedForDate(med, dateStr)) continue;
        for (const time of freq) {
          totalSlots++;
          if (
            medicationLogs.some(
              (l) =>
                l.medicationId === med.id &&
                l.scheduledTime === time &&
                l.date === dateStr &&
                l.isTaken,
            )
          ) {
            takenSlots++;
          }
        }
      }
    }
    return totalSlots > 0 ? Math.round((takenSlots / totalSlots) * 100) : 0;
  }, [medications, medicationLogs]);

  const isTaken = (medicationId: string, time: MedicationTime) => {
    return todayLogs.some(
      (l) => l.medicationId === medicationId && l.scheduledTime === time && l.isTaken,
    );
  };

  const isGroupTaken = (groupId: string, time: MedicationTime) => {
    return medications
      .filter((m) => m.groupId === groupId)
      .some((m) => isTaken(m.id, time));
  };

  const groupedMeds = useMemo(() => {
    const groups: Record<MedicationTime, (Medication | { isGroup: true; groupId: string; meds: Medication[] })[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    const processedGroups = new Set<string>();
    const sorted = [...medications].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    for (const med of sorted) {
      if (med.groupId) {
        if (processedGroups.has(med.groupId)) continue;
        processedGroups.add(med.groupId);
        const groupMeds = medications.filter((m) => m.groupId === med.groupId);
        for (const time of med.frequency) {
          groups[time].push({ isGroup: true, groupId: med.groupId, meds: groupMeds });
        }
      } else {
        for (const time of med.frequency) {
          groups[time].push(med);
        }
      }
    }

    return groups;
  }, [medications]);

  const totalSlots = useMemo(() => {
    let count = 0;
    const processedGroups = new Set<string>();
    for (const med of medications) {
      if (isSkippedForDate(med, today)) continue;
      if (med.groupId) {
        if (processedGroups.has(med.groupId)) continue;
        processedGroups.add(med.groupId);
        count += med.frequency.length;
      } else {
        count += med.frequency.length;
      }
    }
    return count;
  }, [medications, today]);

  const takenCount = useMemo(() => {
    let count = 0;
    const processedGroups = new Set<string>();
    for (const med of medications) {
      if (isSkippedForDate(med, today)) continue;
      if (med.groupId) {
        if (processedGroups.has(med.groupId)) continue;
        processedGroups.add(med.groupId);
        for (const time of med.frequency) {
          if (isGroupTaken(med.groupId, time)) count++;
        }
      } else {
        for (const time of med.frequency) {
          if (isTaken(med.id, time)) count++;
        }
      }
    }
    return count;
  }, [medications, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFrequency = (time: MedicationTime) => {
    setNewFrequency((prev) =>
      prev.includes(time) ? prev.filter((f) => f !== time) : [...prev, time],
    );
  };

  const addMedication = async () => {
    if (!newName.trim() || !newDosage.trim() || newFrequency.length === 0) return;
    try {
      await onAddMedication({
        name: newName.trim(),
        dosage: newDosage.trim(),
        frequency: newFrequency,
        isActive: true,
      });
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  };

  const addPreset = async (preset: MedicationPreset) => {
    try {
      await onAddMedication({
        name: preset.name,
        dosage: preset.dosage,
        frequency: preset.frequency as MedicationTime[],
        isActive: true,
        activeIngredient: preset.activeIngredient,
        purpose: preset.purpose,
        stopRule: preset.stopRule,
        isConditional: preset.isConditional,
        conditionText: preset.conditionText,
        isFromHospital: preset.isFromHospital,
        prescriptionType: preset.prescriptionType,
        groupId: preset.groupId,
      });
      setShowPresets(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка сохранения");
    }
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
    try {
      await _onUpdateMedication(editingMed.id, {
        name: newName.trim(),
        dosage: newDosage.trim(),
        frequency: newFrequency,
      });
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка обновления");
    }
  };

  const resetForm = () => {
    setEditingMed(null);
    setNewName("");
    setNewDosage("");
    setNewFrequency([]);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await onDeleteMedication(id);
        setDeleteConfirm(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Ошибка удаления");
      }
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleAddAdHoc = async () => {
    if (!newName.trim() || !newDosage.trim() || newFrequency.length === 0) return;
    try {
      await onAddAdHoc({
        name: newName.trim(),
      dosage: newDosage.trim(),
      time: newFrequency[0],
      date: today,
      });
      resetForm();
      setShowAdHocForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  };

  const handleDragStart = useCallback(
    (e: React.DragEvent, medId: string) => {
      setDraggedId(medId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", medId);
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, medId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverId(medId);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDraggedId(null);
      setDragOverId(null);

      const sourceId = draggedId;
      if (!sourceId || sourceId === targetId) return;

      const sourceIndex = medications.findIndex((m) => m.id === sourceId);
      const targetIndex = medications.findIndex((m) => m.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return;

      const reordered = [...medications];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      const updated = reordered.map((m, i) => ({ ...m, sortOrder: i }));
      for (const med of updated) {
        await _onUpdateMedication(med.id, { sortOrder: med.sortOrder });
      }
    },
    [draggedId, medications, _onUpdateMedication],
  );

  const renderMedItem = (
    item: Medication | { isGroup: true; groupId: string; meds: Medication[] },
    time: MedicationTime,
  ) => {
    if ("isGroup" in item && item.isGroup) {
      const groupMeds = item.meds;
      const taken = isGroupTaken(item.groupId, time);
      return (
        <div key={item.groupId} className={styles.medicationItem}>
          <div className={styles.medicationInfo}>
            <div className={styles.medicationName}>
              {groupMeds.map((m) => m.name).join(" / ")}
            </div>
            <div className={styles.medicationDosage}>
              {groupMeds[0].dosage} — любой из вариантов
            </div>
            {groupMeds[0].isConditional && groupMeds[0].conditionText && (
              <div className={styles.conditionBadge}>{groupMeds[0].conditionText}</div>
            )}
          </div>
          {mode === "checklist" ? (
            <label className={styles.timeTag}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={taken}
                onChange={() => onToggleLog(groupMeds[0].id, time)}
              />
              {taken ? "Принято" : "Отметить"}
            </label>
          ) : (
            <div className={styles.medicationActions}>
              <label className={styles.timeTag}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={taken}
                  onChange={() => onToggleLog(groupMeds[0].id, time)}
                />
                {taken ? "Принято" : "Отметить"}
              </label>
            </div>
          )}
        </div>
      );
    }

    const med = item as Medication;
    const taken = isTaken(med.id, time);
    const isSkipped = med.overrides?.[today]?.skip === true;
    const isDragging = draggedId === med.id;
    const isDragOver = dragOverId === med.id;
    return (
      <div
        key={med.id}
        className={`${styles.medicationItem} ${isSkipped ? styles.skipped : ""} ${isDragging ? styles.dragging : ""} ${isDragOver ? styles.dragOver : ""}`}
        draggable={mode === "schedule"}
        onDragStart={(e) => handleDragStart(e, med.id)}
        onDragOver={(e) => handleDragOver(e, med.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, med.id)}
      >
        {mode === "schedule" && (
          <span className={styles.dragHandle} title="Перетащить для изменения порядка">⠿</span>
        )}
        <div className={`${styles.medicationInfo} ${isSkipped ? styles.skippedText : ""}`}>
          <div className={styles.medicationName}>
            {isSkipped && <span className={styles.skippedBadge}>Пропущено</span>}
            {med.name}
          </div>
          <div className={styles.medicationDosage}>{med.dosage}</div>
          {med.isConditional && med.conditionText && (
            <div className={styles.conditionBadge}>{med.conditionText}</div>
          )}
        </div>
        <div className={styles.medicationActions}>
          <label className={styles.timeTag}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={taken}
              onChange={() => onToggleLog(med.id, time)}
              disabled={isSkipped}
            />
            {taken ? "Принято" : "Отметить"}
          </label>
          {mode === "checklist" && onSkipMedication && onUnskipMedication && (
            <Button
              variant="ghost"
              size="sm"
              className={isSkipped ? styles.unskipBtn : styles.skipBtn}
              onClick={() => isSkipped ? onUnskipMedication(med.id, today) : onSkipMedication(med.id, today)}
            >
              {isSkipped ? "Отменить" : "Пропустить"}
            </Button>
          )}
          {mode === "schedule" && (
            <div className={styles.actions}>
              {onRemoveFromTime && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.removeTimeBtn}
                  onClick={() => onRemoveFromTime(med.id, time)}
                  title={`Убрать из ${TIME_LABELS[time].toLowerCase()}`}
                >
                  ⊘
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => startEdit(med)}>
                ✏️
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
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "schedule" ? "Настройки расписания" : "Лекарства на сегодня"}
        </CardTitle>
        {mode === "schedule" && (
          <p className={styles.scheduleSubtitle}>
            Расписание повторяется каждый день. Изменения применяются ко всем дням.
            Чтобы изменить конкретный день — откройте недельный календарь.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className={styles.container}>
          {medications.length > 0 && mode === "checklist" && (
            <div className={styles.summary}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryTitle}>Принято сегодня</span>
                <span className={styles.summaryCount}>
                  {takenCount} из {totalSlots}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: totalSlots > 0
                      ? `${(takenCount / totalSlots) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          )}

          {adherenceScore !== null && mode === "checklist" && (
            <div className={styles.adherenceCard}>
              <div className={styles.adherenceHeader}>
                <span className={styles.adherenceTitle}>Приверженность за 7 дней</span>
                <span
                  className={`${styles.adherenceValue} ${
                    adherenceScore >= 80
                      ? styles.adherenceGood
                      : adherenceScore >= 50
                        ? styles.adherenceMid
                        : styles.adherenceLow
                  }`}
                >
                  {adherenceScore}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${
                    adherenceScore >= 80
                      ? ""
                      : adherenceScore >= 50
                        ? styles.progressMid
                        : styles.progressLow
                  }`}
                  style={{ width: `${adherenceScore}%` }}
                />
              </div>
            </div>
          )}

          {medications.length === 0 && !showForm && !showPresets && !showAdHocForm && (
            <div className={styles.emptyState}>
              {mode === "schedule"
                ? "Нет добавленных лекарств. Добавьте лекарства из каталога или создайте новое."
                : "Нет добавленных лекарств. Перейдите в «Расписание», чтобы настроить."
              }
            </div>
          )}

          {TIME_ORDER.map((time) => {
            const items = groupedMeds[time];
            if (items.length === 0) return null;
            return (
              <div key={time} className={styles.timeSection}>
                <div className={styles.timeSectionHeader}>
                  <span className={styles.timeIcon}>{TIME_ICONS[time]}</span>
                  <span className={styles.timeLabel}>{TIME_LABELS[time]}</span>
                  <span className={styles.timeCount}>{items.length}</span>
                </div>
                <div className={styles.list}>
                  {items.map((item) => renderMedItem(item, time))}
                </div>
              </div>
            );
          })}

          {todayAdHoc.length > 0 && (
            <div className={styles.timeSection}>
              <div className={styles.timeSectionHeader}>
                <span className={styles.timeIcon}>➕</span>
                <span className={styles.timeLabel}>Добавлено на сегодня</span>
              </div>
              <div className={styles.list}>
                {todayAdHoc.map((med) => (
                  <div key={med.id} className={styles.medicationItem}>
                    <div className={styles.medicationInfo}>
                      <div className={styles.medicationName}>{med.name}</div>
                      <div className={styles.medicationDosage}>{med.dosage}</div>
                    </div>
                    <div className={styles.medicationActions}>
                      <label className={styles.timeTag}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={med.isTaken}
                          onChange={() => onToggleAdHoc(med.id)}
                        />
                        {med.isTaken ? "Принято" : "Отметить"}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.deleteBtn}
                        onClick={() => onDeleteAdHoc(med.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAdHocForm && (
            <div className={styles.form}>
              <h3>Добавить на сегодня</h3>
              <Input
                label="Название лекарства"
                placeholder="Эналаприл"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                label="Дозировка"
                placeholder="5 мг"
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
              <div className={styles.formActions}>
                <Button variant="ghost" onClick={() => { setShowAdHocForm(false); resetForm(); }}>
                  Отмена
                </Button>
                <Button onClick={handleAddAdHoc}>
                  Добавить
                </Button>
              </div>
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
                      {preset.isConditional && (
                        <span className={styles.presetCondition}>{preset.conditionText}</span>
                      )}
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
                <Button variant="ghost" onClick={resetForm}>
                  Отмена
                </Button>
                <Button onClick={editingMed ? saveEdit : addMedication}>
                  {editingMed ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </div>
          )}

          {!showForm && !showPresets && !showAdHocForm && (
            <div className={styles.buttonRow}>
              {mode === "checklist" ? (
                <Button variant="secondary" onClick={() => setShowAdHocForm(true)}>
                  + Добавить на сегодня
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => { setShowForm(true); setEditingMed(null); }}>
                    + Добавить лекарство
                  </Button>
                  <Button variant="secondary" onClick={() => setShowPresets(true)}>
                    📋 Из каталога
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
