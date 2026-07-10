-- Только новая часть: group_id + ad_hoc_medications
-- Выполните этот файл в Supabase SQL Editor

-- 1. Добавить group_id к таблице medications
ALTER TABLE medications ADD COLUMN IF NOT EXISTS group_id TEXT;

-- 2. Создать таблицу ad_hoc_medications
CREATE TABLE IF NOT EXISTS ad_hoc_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  time_of_day TEXT NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_taken BOOLEAN DEFAULT FALSE,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Включить RLS
ALTER TABLE ad_hoc_medications ENABLE ROW LEVEL SECURITY;

-- 4. Создать политику
DO $$ BEGIN
  CREATE POLICY "Users can manage own ad-hoc meds" ON ad_hoc_medications
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 5. Индекс для быстрых запросов по дате
CREATE INDEX IF NOT EXISTS idx_ad_hoc_medications_date ON ad_hoc_medications(user_id, date);
