-- Train Tracker schema
-- Run this in your Supabase SQL editor after creating a project.

-- Store all user data as a single JSONB blob per user.
-- Simple, portable, and mirrors the original localStorage shape exactly.

CREATE TABLE IF NOT EXISTS user_data (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security: each user can only read/write their own row.
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_data" ON user_data
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on writes.
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Social: username profiles + friend discovery
-- Run this block after the initial schema above.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{3,20}$')
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can read profiles (needed for search)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only write their own profile
CREATE POLICY "profiles_own_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow reading another user's training data if they have a public profile
-- (i.e. they opted into social by setting a username)
CREATE POLICY "user_data_social_read" ON user_data
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.user_id = user_data.user_id
    )
  );
