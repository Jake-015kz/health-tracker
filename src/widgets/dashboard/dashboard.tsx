"use client";

import { useMemo } from "react";
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
    if (entries.length === 0) return null;
    const recent = entries.slice(-7);
    const sys = recent.reduce((s, e) => s + (e.bloodPressure?.systolic ?? 0), 0) / recent.length;
    const dia = recent.reduce((s, e) => s + (e.bloodPressure?.diastolic ?? 0), 0) / recent.length;
    return { systolic: Math.round(sys), diastolic: Math.round(dia) };
  }, [entries]);

  const avgPulse = useMemo(() => {
    if (entries.length === 0) return null;
    const recent = entries.filter((e) => e.pulse).slice(-7);
    if (recent.length === 0) return null;
    return Math.round(recent.reduce((s, e) => s + (e.pulse ?? 0), 0) / recent.length);
  }, [entries]);

  const avgSugar = useMemo(() => {
    if (entries.length === 0) return null;
    const recent = entries.filter((e) => e.bloodSugar !== undefined).slice(-7);
    if (recent.length === 0) return null;
    return (
      Math.round(
        (recent.reduce((s, e) => s + (e.bloodSugar ?? 0), 0) / recent.length) * 10,
      ) / 10
    );
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

      {avgBP && (
        <div className={styles.avgRow}>
          <div className={styles.avgItem}>
            <TrendingUp size={14} />
            <span>
              Среднее за 7 дней: <strong>{avgBP.systolic}/{avgBP.diastolic}</strong>
            </span>
          </div>
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
