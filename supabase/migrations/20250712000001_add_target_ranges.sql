-- Migration: Create patient_profiles table (if not exists) and add target ranges

CREATE TABLE IF NOT EXISTS patient_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  birth_date TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  blood_type TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  doctor_name TEXT DEFAULT '',
  doctor_phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS target_systolic INTEGER DEFAULT 130;
ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS target_diastolic INTEGER DEFAULT 80;
ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS target_pulse_low INTEGER DEFAULT 60;
ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS target_pulse_high INTEGER DEFAULT 75;
ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS target_sugar_low NUMERIC(4,1) DEFAULT 7.0;
ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS target_sugar_high NUMERIC(4,1) DEFAULT 11.0;
