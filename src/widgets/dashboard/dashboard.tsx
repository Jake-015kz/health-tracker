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
} from "recharts";

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

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p>Загрузка данных...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.grid}>
        <Card>
          <CardHeader>
            <CardTitle>Последнее измерение</CardTitle>
          </CardHeader>
          <CardContent>
            {latestEntry ? (
              <div>
                <div>
                  <strong>Дата:</strong> {latestEntry.date} (
                  {latestEntry.timeOfDay === "morning" ? "Утро" : "Вечер"})
                </div>
                {latestEntry.bloodPressure && (
                  <div>
                    <strong>Давление:</strong> {latestEntry.bloodPressure.systolic}/
                    {latestEntry.bloodPressure.diastolic} мм рт. ст.
                  </div>
                )}
                {latestEntry.pulse && (
                  <div>
                    <strong>Пульс:</strong> {latestEntry.pulse} уд/мин
                  </div>
                )}
                {latestEntry.bloodSugar !== undefined && (
                  <div>
                    <strong>Сахар:</strong> {latestEntry.bloodSugar} ммоль/л
                  </div>
                )}
              </div>
            ) : (
              <p>Нет данных. Добавьте первое измерение.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div>
                <strong>Всего измерений:</strong> {entries.length}
              </div>
              <div>
                <strong>Дней с записями:</strong>{" "}
                {new Set(entries.map((e) => e.date)).size}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Давление и пульс</h2>
          <Card className={styles.chartCard}>
            <CardContent>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#e53935"
                      strokeWidth={2}
                      name="Систолическое"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#1066f9"
                      strokeWidth={2}
                      name="Диастолическое"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pulse"
                      stroke="#33cb78"
                      strokeWidth={2}
                      name="Пульс"
                      dot={{ r: 3 }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const numValue = Number(value);
                        if (name === "Систолическое" && numValue >= CRITICAL_THRESHOLDS.systolic) {
                          return [`${numValue} ⚠️`, name];
                        }
                        if (name === "Диастолическое" && numValue >= CRITICAL_THRESHOLDS.diastolic) {
                          return [`${numValue} ⚠️`, name];
                        }
                        return [value, name];
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <h2 className={styles.sectionTitle}>Уровень сахара</h2>
          <Card className={styles.chartCard}>
            <CardContent>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.filter((d) => d.bloodSugar !== undefined)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bloodSugar"
                      stroke="#f9a825"
                      strokeWidth={2}
                      name="Сахар (ммоль/л)"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {chartData.length === 0 && (
        <Card>
          <CardContent>
            <p>Добавьте измерения, чтобы увидеть графики динамики.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
