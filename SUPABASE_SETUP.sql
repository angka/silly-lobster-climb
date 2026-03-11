-- 1. Create Custom Types
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- 2. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role public.user_role DEFAULT 'user'::public.user_role,
  is_banned BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 3. Create Patients Table
CREATE TABLE public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  medical_record_number TEXT NOT NULL,
  hospital TEXT,
  diagnosis TEXT,
  date_of_birth DATE,
  gender TEXT,
  contact_number TEXT,
  doctor_name TEXT,
  address TEXT,
  lens_category TEXT,
  notes TEXT,
  date_of_visit DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Sessions Table
CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  lens_type TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email IN ('admin@example.com', 'angka@gmail.com') THEN 'admin'::public.user_role 
      ELSE 'user'::public.user_role 
    END
  );
  RETURN new;
END;
$$;

-- 7. Create Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Create RLS Policies

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Profiles are viewable by admins" ON public.profiles
FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE TO authenticated USING (is_admin());

-- Patients Policies
CREATE POLICY "Users can view their own patients or admins can view all" ON public.patients
FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can insert their own patients or admins can insert for all" ON public.patients
FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can update their own patients or admins can update all" ON public.patients
FOR UPDATE TO authenticated USING ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can delete their own patients or admins can delete all" ON public.patients
FOR DELETE TO authenticated USING ((auth.uid() = user_id) OR is_admin());

-- Sessions Policies
CREATE POLICY "Users can view their own sessions or admins can view all" ON public.sessions
FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can insert their own sessions or admins can insert for all" ON public.sessions
FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can update their own sessions or admins can update all" ON public.sessions
FOR UPDATE TO authenticated USING ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can delete their own sessions or admins can delete all" ON public.sessions
FOR DELETE TO authenticated USING ((auth.uid() = user_id) OR is_admin());