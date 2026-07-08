-- ============================================
-- Health Tracker — Supabase Schema
-- Выполните в Supabase SQL Editor
-- ============================================

-- 1. Профили (автосоздаётся при регистрации через триггер)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Лекарства
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  active_ingredient TEXT,
  dosage TEXT NOT NULL,
  purpose TEXT,
  stop_rule TEXT,
  is_conditional BOOLEAN DEFAULT false,
  condition_text TEXT,
  is_from_hospital BOOLEAN DEFAULT false,
  prescription_type TEXT CHECK (prescription_type IN ('rx', 'otc', 'unknown')),
  frequency TEXT[] NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Замеры биометрии
CREATE TABLE IF NOT EXISTS biometric_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'evening')) NOT NULL,
  systolic INT,
  diastolic INT,
  pulse INT,
  blood_sugar DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Логи приёма лекарств
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  scheduled_time TEXT NOT NULL,
  is_taken BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS (Row Level Security) — каждый видит только свои данные
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Политики для medications
CREATE POLICY "med_select" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "med_insert" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "med_update" ON medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "med_delete" ON medications FOR DELETE USING (auth.uid() = user_id);

-- Политики для biometric_entries
CREATE POLICY "bio_select" ON biometric_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bio_insert" ON biometric_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bio_update" ON biometric_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bio_delete" ON biometric_entries FOR DELETE USING (auth.uid() = user_id);

-- Политики для medication_logs
CREATE POLICY "log_select" ON medication_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "log_insert" ON medication_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "log_update" ON medication_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "log_delete" ON medication_logs FOR DELETE USING (auth.uid() = user_id);

-- 6. Триггер: автосоздание профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
