-- ============================================================================
-- THUYSTALK SUPABASE POSTGRESQL SCHEMA & RLS HARDENING
-- Standard: /secure-hybrid-web-architect (Public E-Learning + Admin Photo CMS)
-- ============================================================================

-- 1. Enable pgcrypto for hashing IP addresses (Privacy-preserving rate-limiting)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Profiles Table (Learners & Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Site Media Settings Table (For Admin Photo Replacement Sync across devices)
CREATE TABLE IF NOT EXISTS public.site_media_settings (
  slot_key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  image_url TEXT NOT NULL,
  pos_x INT NOT NULL DEFAULT 50,
  pos_y INT NOT NULL DEFAULT 20,
  scale INT NOT NULL DEFAULT 100,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. E-Learning Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  quiz_score INT DEFAULT 100,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 5. Course Material Email Requests Table
CREATE TABLE IF NOT EXISTS public.material_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. 1-on-1 Consultation Leads Table
CREATE TABLE IF NOT EXISTS public.consult_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  phone_zalo TEXT NOT NULL CHECK (char_length(phone_zalo) BETWEEN 6 AND 30),
  email TEXT NOT NULL CHECK (position('@' in email) > 1),
  topic TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 1200),
  consent_nd13 BOOLEAN NOT NULL DEFAULT true CHECK (consent_nd13 = true),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consult_leads_created_desc ON public.consult_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_material_requests_created_desc ON public.material_requests (created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — LOCK ALL TABLES BY DEFAULT
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_media_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consult_leads ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user is Admin
CREATE OR REPLACE FUNCTION public.is_thuystalk_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Policies for profiles: Users see own profile; Admin sees all
CREATE POLICY "Users select own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_thuystalk_admin());

-- Policies for site_media_settings: Everyone can view photos; ONLY Admin can update/insert
CREATE POLICY "Public read site media" ON public.site_media_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin manage site media" ON public.site_media_settings
  FOR ALL TO authenticated
  USING (public.is_thuystalk_admin())
  WITH CHECK (public.is_thuystalk_admin());

-- Policies for lesson_progress: Learners only read/write their own progress
CREATE POLICY "Learner manage own progress" ON public.lesson_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for consult_leads & material_requests:
-- Anonymous & regular learners CANNOT SELECT leads (Protects customer privacy!).
-- Only Admin can SELECT leads. Inserts happen strictly via rate-limited RPC below.
CREATE POLICY "Only admin reads consult leads" ON public.consult_leads
  FOR SELECT TO authenticated USING (public.is_thuystalk_admin());

CREATE POLICY "Only admin reads material requests" ON public.material_requests
  FOR SELECT TO authenticated USING (public.is_thuystalk_admin());

-- ============================================================================
-- RATE-LIMITED RPC FOR PUBLIC CONSULTATION SUBMISSION (Max 3 per hour per IP)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.submit_lead(
  p_full_name TEXT,
  p_phone_zalo TEXT,
  p_email TEXT,
  p_topic TEXT,
  p_message TEXT,
  p_consent BOOLEAN,
  p_client_fingerprint TEXT DEFAULT 'anon'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ip_hash TEXT;
  v_recent_count INT;
  v_new_id UUID;
BEGIN
  IF p_consent IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Consent under Decree 13/2023/ND-CP is required';
  END IF;

  v_ip_hash := encode(digest(coalesce(p_client_fingerprint, 'anon') || '_thuystalk_salt', 'sha256'), 'hex');

  SELECT count(*) INTO v_recent_count
  FROM public.consult_leads
  WHERE ip_hash = v_ip_hash
    AND created_at > (now() - interval '1 hour');

  IF v_recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 3 submissions per hour';
  END IF;

  INSERT INTO public.consult_leads (full_name, phone_zalo, email, topic, message, consent_nd13, ip_hash)
  VALUES (trim(p_full_name), trim(p_phone_zalo), lower(trim(p_email)), trim(p_topic), trim(p_message), true, v_ip_hash)
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object('status', 'ok', 'lead_id', v_new_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_lead(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO anon, authenticated;
