-- Migration: Add sort_order and overrides columns to medications
-- Run this in Supabase SQL Editor

ALTER TABLE medications ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS overrides JSONB DEFAULT '{}'::jsonb;
