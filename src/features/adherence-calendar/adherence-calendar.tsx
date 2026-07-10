"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Medication, MedicationLog } from "@/entities/medication";
import { Card, CardContent } from "@/shared/ui/card";
import { getTodayString } from "@/shared/lib/constants";

import styles from "./adherence-calendar.module.css";

interface AdherenceCalendarProps {
  medications: Medication[];
  medicationLogs: MedicationLog[];
}

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function AdherenceCalendar({ medications, medicationLogs }: AdherenceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [detailsDay, setDetailsDay] = useState<string | null>(null);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const dayScores = useMemo(() => {
    const processedGroups = new Set<string>();
    const uniqueMeds = medications.filter((m) => {
      if (m.groupId) {
        if (processedGroups.has(m.groupId)) return false;
        processedGroups.add(m.groupId);
      }
      return true;
    });

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      let totalSlots = 0;
      let takenSlots = 0;

      for (const med of uniqueMeds) {
        for (const time of med.frequency) {
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

      const score = totalSlots > 0 ? takenSlots / totalSlots : 0;
      const todayStr = getTodayString();
      const inMonth = day.getMonth() === currentMonth.getMonth();

      return { date: day, dateStr, score, totalSlots, takenSlots, inMonth, isToday: dateStr === todayStr };
    });
  }, [days, medications, medicationLogs, currentMonth]);

  const dayDetails = detailsDay ? dayScores.find((d) => d.dateStr === detailsDay) : null;

  const getScoreClass = (score: number, total: number) => {
    if (total === 0) return styles.scoreNone;
    if (score >= 0.8) return styles.scoreGood;
    if (score >= 0.5) return styles.scoreMid;
    return styles.scoreLow;
  };

  return (
    <Card>
      <CardContent>
        <div className={styles.calendar}>
          <div className={styles.monthNav}>
            <button className={styles.navBtn} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthLabel}>
              {format(currentMonth, "LLLL yyyy", { locale: ru })}
            </span>
            <button className={styles.navBtn} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.dayLabels}>
            {DAY_LABELS.map((label) => (
              <div key={label} className={styles.dayLabel}>{label}</div>
            ))}
          </div>

          <div className={styles.grid}>
            {dayScores.map((d) => (
              <div
                key={d.dateStr}
                className={`${styles.cell} ${getScoreClass(d.score, d.totalSlots)} ${!d.inMonth ? styles.cellOutside : ""} ${d.isToday ? styles.cellToday : ""}`}
                onClick={() => setDetailsDay(detailsDay === d.dateStr ? null : d.dateStr)}
                title={`${format(d.date, "d MMM", { locale: ru })}: ${d.takenSlots}/${d.totalSlots} принято`}
              >
                <span className={styles.cellDay}>{format(d.date, "d")}</span>
              </div>
            ))}
          </div>

          {detailsDay && dayDetails && (
            <div className={styles.details}>
              <div className={styles.detailsDate}>
                {format(new Date(detailsDay + "T12:00:00"), "d MMMM yyyy, EEEE", { locale: ru })}
              </div>
              <div className={styles.detailsRow}>
                <span>Принято: {dayDetails.takenSlots} из {dayDetails.totalSlots}</span>
                <span className={styles.detailsPct}>
                  {dayDetails.totalSlots > 0
                    ? `${Math.round(dayDetails.score * 100)}%`
                    : "нет данных"}
                </span>
              </div>
            </div>
          )}

          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.scoreNone}`} /> Нет
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.scoreLow}`} /> &lt;50%
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.scoreMid}`} /> 50-79%
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.scoreGood}`} /> 80%+
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
