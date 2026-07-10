"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Heart,
  Droplets,
  Activity,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";

import type { BiometricEntry } from "@/entities/biometrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CRITICAL_THRESHOLDS } from "@/shared/lib/constants";

import styles from "./dashboard.module.css";

const PERIODS = [
  { days: 3, label: "3 дн." },
  { days: 7, label: "7 дн." },
  { days: 30, label: "30 дн." },
  { days: 90, label: "90 дн." },
  { days: 180, label: "180 дн." },
  { days: 365, label: "1 год" },
  { days: Infinity, label: "Всё время" },
] as const;

interface ChartDataPoint {
  date: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  bloodSugar?: number;
  timeOfDay: string;
}

interface DashboardProps {
  biometrics: BiometricEntry[];
  loading: boolean;
}

function getStatusColor(
  value: number,
  threshold: number,
): "normal" | "warning" | "danger" {
  if (value >= threshold + 20) return "danger";
  if (value >= threshold) return "warning";
  return "normal";
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  status?: "normal" | "warning" | "danger";
  delay: number;
}) {
  return (
    <div
      className={`${styles.statCard} ${styles[`stat${status ?? "Normal"}`]}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={styles.statIcon}>
        <Icon size={20} />
      </div>
      <div className={styles.statContent}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>
          {value}
          <span className={styles.statUnit}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ biometrics: entries, loading }: DashboardProps) {
  const [periodDays, setPeriodDays] = useState<number>(7);

  const filteredEntries = useMemo(() => {
    if (periodDays === Infinity) return entries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    return entries.filter((e) => new Date(e.date) >= cutoff);
  }, [entries, periodDays]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    return entries
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-14)
      .map((e) => ({
        date: `${e.date} ${e.timeOfDay === "morning" ? "У" : "В"}`,
        systolic: e.bloodPressure?.systolic,
        diastolic: e.bloodPressure?.diastolic,
        pulse: e.pulse,
        bloodSugar: e.bloodSugar,
        timeOfDay: e.timeOfDay,
      }));
  }, [entries]);

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  const avgBP = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    const withBP = filteredEntries.filter((e) => e.bloodPressure);
    if (withBP.length === 0) return null;
    const sys = withBP.reduce((s, e) => s + (e.bloodPressure?.systolic ?? 0), 0) / withBP.length;
    const dia = withBP.reduce((s, e) => s + (e.bloodPressure?.diastolic ?? 0), 0) / withBP.length;
    return { systolic: Math.round(sys), diastolic: Math.round(dia) };
  }, [filteredEntries]);

  const avgPulse = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    const withPulse = filteredEntries.filter((e) => e.pulse);
    if (withPulse.length === 0) return null;
    return Math.round(withPulse.reduce((s, e) => s + (e.pulse ?? 0), 0) / withPulse.length);
  }, [filteredEntries]);

  const avgSugar = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    const withSugar = filteredEntries.filter((e) => e.bloodSugar !== undefined);
    if (withSugar.length === 0) return null;
    return (
      Math.round(
        (withSugar.reduce((s, e) => s + (e.bloodSugar ?? 0), 0) / withSugar.length) * 10,
      ) / 10
    );
  }, [filteredEntries]);

  const periodLabel = PERIODS.find((p) => p.days === periodDays)?.label ?? "Всё время";

  // Тренд давления за 3 дня
  const bpTrend = useMemo(() => {
    const recent = entries
      .filter((e) => e.bloodPressure)
      .slice(-6)
      .map((e) => e.bloodPressure!.systolic);
    if (recent.length < 4) return null;
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const diff = avgSecond - avgFirst;
    if (diff > 5) return "rising" as const;
    if (diff < -5) return "falling" as const;
    return "stable" as const;
  }, [entries]);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>
          <Activity className={styles.loadingIcon} size={32} />
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.emptyState}>
          <BarChart3 className={styles.emptyIcon} size={48} />
          <h3>Добро пожаловать!</h3>
          <p>Добавьте первое измерение, чтобы увидеть графики динамики здоровья.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.summaryGrid}>
        {latestEntry?.bloodPressure && (
          <StatCard
            icon={Heart}
            label="Давление"
            value={`${latestEntry.bloodPressure.systolic}/${latestEntry.bloodPressure.diastolic}`}
            unit=" мм рт. ст."
            status={getStatusColor(
              latestEntry.bloodPressure.systolic,
              CRITICAL_THRESHOLDS.systolic,
            )}
            delay={0}
          />
        )}
        {latestEntry?.pulse && (
          <StatCard
            icon={Activity}
            label="Пульс"
            value={latestEntry.pulse}
            unit=" уд/мин"
            status={
              latestEntry.pulse > CRITICAL_THRESHOLDS.pulseHigh ||
              latestEntry.pulse < CRITICAL_THRESHOLDS.pulseLow
                ? "warning"
                : "normal"
            }
            delay={0.1}
          />
        )}
        {latestEntry?.bloodSugar !== undefined && (
          <StatCard
            icon={Droplets}
            label="Сахар"
            value={latestEntry.bloodSugar}
            unit=" ммоль/л"
            status={
              latestEntry.bloodSugar >= CRITICAL_THRESHOLDS.bloodSugar
                ? "danger"
                : "normal"
            }
            delay={0.2}
          />
        )}
        <StatCard
          icon={Calendar}
          label="Записей"
          value={entries.length}
          unit={` за ${new Set(entries.map((e) => e.date)).size} дн.`}
          delay={0.3}
        />
      </div>

      <div className={styles.periodSelector}>
        {PERIODS.map((p) => (
          <button
            key={p.days}
            className={`${styles.periodBtn} ${periodDays === p.days ? styles.periodBtnActive : ""}`}
            onClick={() => setPeriodDays(p.days)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {bpTrend === "rising" && (
        <div className={styles.trendAlert}>
          <TrendingUp size={16} />
          <span>Давление повышается в последние дни — обратите внимание</span>
        </div>
      )}
      {bpTrend === "falling" && (
        <div className={styles.trendGood}>
          <TrendingUp size={16} style={{ transform: "rotate(180deg)" }} />
          <span>Давление стабильно снижается</span>
        </div>
      )}

      {(avgBP || avgPulse || avgSugar) && (
        <div className={styles.avgRow}>
          <div className={styles.avgLabel}>
            <TrendingUp size={14} />
            Среднее за {periodLabel}:
          </div>
          <div className={styles.avgValues}>
            {avgBP && (
              <div className={styles.avgItem}>
                <Heart size={14} />
                <span>
                  Давление: <strong>{avgBP.systolic}/{avgBP.diastolic}</strong>
                </span>
              </div>
            )}
            {avgPulse && (
              <div className={styles.avgItem}>
                <Activity size={14} />
                <span>
                  Пульс: <strong>{avgPulse}</strong> уд/мин
                </span>
              </div>
            )}
            {avgSugar && (
              <div className={styles.avgItem}>
                <Droplets size={14} />
                <span>
                  Сахар: <strong>{avgSugar}</strong> ммоль/л
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <>
          <Card className={styles.chartCard}>
            <CardHeader>
              <CardTitle>
                <Activity size={18} />
                Давление и пульс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.95)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <ReferenceLine
                      y={CRITICAL_THRESHOLDS.systolic}
                      stroke="#e53935"
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                    />
                    <ReferenceLine
                      y={CRITICAL_THRESHOLDS.diastolic}
                      stroke="#1066f9"
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#e53935"
                      strokeWidth={2.5}
                      name="Систолическое"
                      dot={{ r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#1066f9"
                      strokeWidth={2.5}
                      name="Диастолическое"
                      dot={{ r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pulse"
                      stroke="#33cb78"
                      strokeWidth={2}
                      name="Пульс"
                      dot={{ r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={styles.chartCard}>
            <CardHeader>
              <CardTitle>
                <Droplets size={18} />
                Уровень сахара
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.filter((d) => d.bloodSugar !== undefined)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
                      domain={[0, "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.95)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <ReferenceLine
                      y={CRITICAL_THRESHOLDS.bloodSugar}
                      stroke="#f9a825"
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="bloodSugar"
                      stroke="#f9a825"
                      strokeWidth={2.5}
                      name="Сахар (ммоль/л)"
                      dot={{ r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
