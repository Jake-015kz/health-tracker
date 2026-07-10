"use client";

import { useState, useEffect } from "react";
import type { PatientProfile } from "@/entities/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

import styles from "./profile-form.module.css";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [profile, setProfile] = useState<Partial<PatientProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile({
          fullName: data.full_name ?? "",
          birthDate: data.birth_date ?? "",
          diagnosis: data.diagnosis ?? "",
          bloodType: data.blood_type ?? "",
          allergies: data.allergies ?? "",
          doctorName: data.doctor_name ?? "",
          doctorPhone: data.doctor_phone ?? "",
          notes: data.notes ?? "",
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, [user.id, supabase]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const { data: existing } = await supabase
      .from("patient_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const row = {
      user_id: user.id,
      full_name: profile.fullName ?? "",
      birth_date: profile.birthDate || null,
      diagnosis: profile.diagnosis || null,
      blood_type: profile.bloodType || null,
      allergies: profile.allergies || null,
      doctor_name: profile.doctorName || null,
      doctor_phone: profile.doctorPhone || null,
      notes: profile.notes || null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from("patient_profiles").update(row).eq("id", existing.id);
    } else {
      await supabase.from("patient_profiles").insert(row);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className={styles.loading}>Загрузка профиля...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль пациента</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.form}>
          <Input
            label="ФИО"
            placeholder="Иванов Иван Иванович"
            value={profile.fullName ?? ""}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
          />
          <Input
            label="Дата рождения"
            type="date"
            value={profile.birthDate ?? ""}
            onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
          />
          <Input
            label="Группа крови"
            placeholder="A(II)+"
            value={profile.bloodType ?? ""}
            onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
          />
          <Input
            label="Диагноз"
            placeholder="Инсульт ишемический, гипертония, сахарный диабет 2 типа"
            value={profile.diagnosis ?? ""}
            onChange={(e) => setProfile({ ...profile, diagnosis: e.target.value })}
          />
          <Input
            label="Аллергии"
            placeholder="Нет известных"
            value={profile.allergies ?? ""}
            onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
          />
          <Input
            label="Лечащий врач"
            placeholder="Петрова А.В."
            value={profile.doctorName ?? ""}
            onChange={(e) => setProfile({ ...profile, doctorName: e.target.value })}
          />
          <Input
            label="Телефон врача"
            placeholder="+7 (777) 123-45-67"
            value={profile.doctorPhone ?? ""}
            onChange={(e) => setProfile({ ...profile, doctorPhone: e.target.value })}
          />
          <Input
            label="Заметки"
            placeholder="Дополнительная информация..."
            value={profile.notes ?? ""}
            onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
          />

          <div className={styles.actions}>
            {saved && <span className={styles.saved}>Сохранено!</span>}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить профиль"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
