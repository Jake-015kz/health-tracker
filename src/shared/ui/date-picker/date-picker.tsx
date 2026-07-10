"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { ru } from "date-fns/locale";
import { format, startOfWeek, endOfWeek, subWeeks, subDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import "react-day-picker/style.css";

import styles from "./date-picker.module.css";

interface DatePickerProps {
  mode: "single" | "range";
  value?: Date | { from: Date; to: Date } | null;
  onChange: (date: Date | { from: Date; to: Date } | null) => void;
  placeholder?: string;
}

export function DatePicker({ mode, value, onChange, placeholder }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const formatValue = useCallback(() => {
    if (!value) return placeholder ?? "Выберите дату";
    if (mode === "single") {
      return format(value as Date, "d MMM", { locale: ru });
    }
    const range = value as { from: Date; to: Date };
    if (!range.from) return placeholder ?? "Выберите период";
    if (!range.to) return `с ${format(range.from, "d MMM", { locale: ru })}`;
    return `${format(range.from, "d MMM", { locale: ru })} — ${format(range.to, "d MMM", { locale: ru })}`;
  }, [value, mode, placeholder]);

  const handleSelectToday = () => {
    if (mode === "single") {
      onChange(new Date());
    } else {
      const today = new Date();
      onChange({ from: today, to: today });
    }
    setOpen(false);
  };

  const handleSelectWeek = (offset: number) => {
    const today = new Date();
    let base = today;
    if (offset !== 0) {
      base = subWeeks(today, Math.abs(offset));
    }
    const from = startOfWeek(base, { weekStartsOn: 1 });
    const to = endOfWeek(base, { weekStartsOn: 1 });
    onChange({ from, to });
    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.toggle} onClick={() => setOpen(!open)}>
        <CalendarIcon className={styles.toggleIcon} />
        {formatValue()}
      </button>

      {open && (
        <div className={styles.popover}>
          {mode === "range" && (
            <div className={styles.rangeWrapper}>
              <div className={styles.rangePresets}>
                <button className={styles.presetBtn} onClick={handleSelectToday}>
                  Сегодня
                </button>
                <button className={styles.presetBtn} onClick={() => handleSelectWeek(1)}>
                  Эта неделя
                </button>
                <button className={styles.presetBtn} onClick={() => handleSelectWeek(2)}>
                  Прошлая неделя
                </button>
                <button
                  className={styles.presetBtn}
                  onClick={() => onChange({ from: subDays(new Date(), 7), to: new Date() })}
                >
                  7 дней
                </button>
                <button
                  className={styles.presetBtn}
                  onClick={() => onChange({ from: subDays(new Date(), 30), to: new Date() })}
                >
                  30 дней
                </button>
              </div>
            </div>
          )}

          <div className={styles.calendarNav}>
            <button
              className={styles.navBtn}
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            <span className={styles.calendarMonth}>
              {format(month, "LLLL yyyy", { locale: ru })}
            </span>
            <button
              className={styles.navBtn}
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {mode === "single" ? (
            <DayPicker
              locale={ru}
              month={month}
              onMonthChange={setMonth}
              mode="single"
              selected={value as Date | undefined}
              onSelect={(v) => {
                onChange((v ?? null) as Date | { from: Date; to: Date } | null);
                setOpen(false);
              }}
              weekStartsOn={1}
              showOutsideDays
            />
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <DayPicker
              locale={ru}
              month={month}
              onMonthChange={setMonth}
              mode="range"
              selected={value as any}
              onSelect={(v) => {
                onChange((v ?? null) as Date | { from: Date; to: Date } | null);
              }}
              weekStartsOn={1}
              showOutsideDays
            />
          )}
        </div>
      )}
    </div>
  );
}
