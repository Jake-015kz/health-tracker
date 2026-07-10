-- Migration: Add ad-hoc medications table and group_id to medications
-- Run this in Supabase SQL Editor

-- 1. Add group_id to medications table
ALTER TABLE medications ADD COLUMN IF NOT EXISTS group_id TEXT;

-- 2. Create ad_hoc_medications table
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

-- 3. Enable RLS
ALTER TABLE ad_hoc_medications ENABLE ROW LEVEL SECURITY;

-- 4. Create policy
CREATE POLICY "Users can manage own ad-hoc meds" ON ad_hoc_medications
  FOR ALL USING (auth.uid() = user_id);

-- 5. Add index for date queries
CREATE INDEX IF NOT EXISTS idx_ad_hoc_medications_date ON ad_hoc_medications(user_id, date);
