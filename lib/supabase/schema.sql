-- ============================================================
-- Malaaib — Database Schema (idempotent — safe to re-run)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('player', 'owner', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE language_pref AS ENUM ('ar', 'fr');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE pitch_type AS ENUM ('5v5', '6v6', '7v7', '11v11');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('pay_at_field', 'cmi', 'cashplus', 'wafacash', 'walk_in');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT UNIQUE,
  phone              TEXT NOT NULL,
  full_name          TEXT NOT NULL,
  role               user_role NOT NULL DEFAULT 'player',
  preferred_language language_pref NOT NULL DEFAULT 'ar',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- FIELDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fields (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL DEFAULT 'Casablanca',
  phone         TEXT NOT NULL,
  opening_hours JSONB NOT NULL DEFAULT '{"default": {"open": "08:00", "close": "24:00"}}',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fields_owner_id ON public.fields(owner_id);
CREATE INDEX IF NOT EXISTS idx_fields_city ON public.fields(city);
CREATE INDEX IF NOT EXISTS idx_fields_is_active ON public.fields(is_active);

ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active fields" ON public.fields;
CREATE POLICY "Anyone can view active fields" ON public.fields
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owners can manage own fields" ON public.fields;
CREATE POLICY "Owners can manage own fields" ON public.fields
  FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can manage all fields" ON public.fields;
CREATE POLICY "Admins can manage all fields" ON public.fields
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- PITCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pitches (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id              UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  type                  pitch_type NOT NULL,
  price_per_hour        DECIMAL(10,2) NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
  allow_pay_at_field    BOOLEAN NOT NULL DEFAULT true,
  allow_online_payment  BOOLEAN NOT NULL DEFAULT false,
  available_days        INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  is_active             BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_pitches_field_id ON public.pitches(field_id);

ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active pitches" ON public.pitches;
CREATE POLICY "Anyone can view active pitches" ON public.pitches
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owners can manage own pitches" ON public.pitches;
CREATE POLICY "Owners can manage own pitches" ON public.pitches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.fields WHERE id = field_id AND owner_id = auth.uid())
  );

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code        TEXT UNIQUE NOT NULL,
  player_id           UUID NOT NULL REFERENCES public.users(id),
  pitch_id            UUID NOT NULL REFERENCES public.pitches(id),
  date                DATE NOT NULL,
  start_time          TIME NOT NULL,
  end_time            TIME NOT NULL,
  status              booking_status NOT NULL DEFAULT 'pending',
  payment_method      payment_method NOT NULL,
  total_price         DECIMAL(10,2) NOT NULL,
  amount_paid         DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_due_at_field DECIMAL(10,2) NOT NULL DEFAULT 0,
  commission_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
  qr_code_hash        TEXT NOT NULL,
  is_walk_in          BOOLEAN NOT NULL DEFAULT false,
  owner_notes         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_player_id ON public.bookings(player_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pitch_id ON public.bookings(pitch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

DO $$ BEGIN
  CREATE UNIQUE INDEX idx_bookings_pitch_slot ON public.bookings(pitch_id, date, start_time)
    WHERE status NOT IN ('cancelled');
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can view own bookings" ON public.bookings;
CREATE POLICY "Players can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Players can create bookings" ON public.bookings;
CREATE POLICY "Players can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Owners can view bookings for their pitches" ON public.bookings;
CREATE POLICY "Owners can view bookings for their pitches" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      JOIN public.fields f ON f.id = p.field_id
      WHERE p.id = pitch_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can update bookings for their pitches" ON public.bookings;
CREATE POLICY "Owners can update bookings for their pitches" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      JOIN public.fields f ON f.id = p.field_id
      WHERE p.id = pitch_id AND f.owner_id = auth.uid()
    )
  );

-- ============================================================
-- SLOT LOCKS (temporary 10-minute holds)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.slot_locks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id   UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  start_time TIME NOT NULL,
  locked_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pitch_id, date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_slot_locks_expires ON public.slot_locks(expires_at);

ALTER TABLE public.slot_locks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see all locks" ON public.slot_locks;
CREATE POLICY "Users can see all locks" ON public.slot_locks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own locks" ON public.slot_locks;
CREATE POLICY "Users can create own locks" ON public.slot_locks
  FOR INSERT WITH CHECK (auth.uid() = locked_by);

DROP POLICY IF EXISTS "Users can delete own locks" ON public.slot_locks;
CREATE POLICY "Users can delete own locks" ON public.slot_locks
  FOR DELETE USING (auth.uid() = locked_by);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  field_id   UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, field_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can manage own favorites" ON public.favorites;
CREATE POLICY "Players can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = player_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  field_id   UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_field_id ON public.reviews(field_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can create own reviews" ON public.reviews;
CREATE POLICY "Players can create own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- ============================================================
-- FIELD_PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.field_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id    UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  is_cover    BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.field_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view field photos" ON public.field_photos;
CREATE POLICY "Anyone can view field photos" ON public.field_photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage own field photos" ON public.field_photos;
CREATE POLICY "Owners can manage own field photos" ON public.field_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.fields WHERE id = field_id AND owner_id = auth.uid())
  );

-- ============================================================
-- STORAGE BUCKETS
-- Create this manually in Supabase dashboard → Storage → New bucket
-- Name: field-photos, Public: true
-- ============================================================

-- ============================================================
-- HELPER: Auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name, role, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'player'),
    COALESCE((NEW.raw_user_meta_data->>'preferred_language')::language_pref, 'ar')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
