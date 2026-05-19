
-- ROLES
CREATE TYPE public.app_role AS ENUM ('student', 'supervisor', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  department TEXT,
  registration_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PROJECTS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_title TEXT NOT NULL,
  supervisor_name TEXT,
  abstract TEXT,
  file_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  submission_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- GRADES
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  problem_definition_score INT NOT NULL DEFAULT 0,
  literature_review_score INT NOT NULL DEFAULT 0,
  methodology_score INT NOT NULL DEFAULT 0,
  system_design_score INT NOT NULL DEFAULT 0,
  implementation_score INT NOT NULL DEFAULT 0,
  documentation_score INT NOT NULL DEFAULT 0,
  presentation_score INT NOT NULL DEFAULT 0,
  problem_definition_remarks TEXT,
  literature_review_remarks TEXT,
  methodology_remarks TEXT,
  system_design_remarks TEXT,
  implementation_remarks TEXT,
  documentation_remarks TEXT,
  presentation_remarks TEXT,
  total_score NUMERIC NOT NULL DEFAULT 0,
  grade TEXT,
  supervisor_feedback TEXT,
  recommendation TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- profiles
CREATE POLICY "Profiles: self select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor'));
CREATE POLICY "Profiles: self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles: admin all" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "Roles: self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Roles: admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- projects
CREATE POLICY "Projects: student own" ON public.projects FOR SELECT TO authenticated USING (student_id = auth.uid() OR supervisor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Projects: student create" ON public.projects FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND public.has_role(auth.uid(),'student'));
CREATE POLICY "Projects: student update own" ON public.projects FOR UPDATE TO authenticated USING (student_id = auth.uid() OR supervisor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Projects: admin delete" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- grades
CREATE POLICY "Grades: read related" ON public.grades FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin')
  OR EXISTS(SELECT 1 FROM public.projects p WHERE p.id = project_id AND (p.student_id = auth.uid() OR p.supervisor_id = auth.uid()))
);
CREATE POLICY "Grades: supervisor write" ON public.grades FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(),'supervisor') OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "Grades: supervisor update" ON public.grades FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(),'supervisor') OR public.has_role(auth.uid(),'admin')
);

-- notifications
CREATE POLICY "Notif: self read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notif: self update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notif: admin create" ON public.notifications FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'supervisor') OR user_id = auth.uid()
);

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- handle_new_user: create profile + default role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  selected_role app_role;
BEGIN
  selected_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student');
  INSERT INTO public.profiles (id, full_name, email, department, registration_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NEW.email,
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'registration_number'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, selected_role);
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-compute total + grade
CREATE OR REPLACE FUNCTION public.compute_grade()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  total NUMERIC;
BEGIN
  total := (NEW.problem_definition_score + NEW.literature_review_score + NEW.methodology_score +
            NEW.system_design_score + NEW.implementation_score + NEW.documentation_score +
            NEW.presentation_score) / 7.0;
  NEW.total_score := ROUND(total, 2);
  NEW.grade := CASE
    WHEN total >= 80 THEN 'A'
    WHEN total >= 70 THEN 'B'
    WHEN total >= 60 THEN 'C'
    WHEN total >= 50 THEN 'D'
    ELSE 'F'
  END;
  RETURN NEW;
END $$;

CREATE TRIGGER grades_compute BEFORE INSERT OR UPDATE ON public.grades
FOR EACH ROW EXECUTE FUNCTION public.compute_grade();

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files','project-files', false);

CREATE POLICY "Project files: owner read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-files' AND (
  auth.uid()::text = (storage.foldername(name))[1]
  OR public.has_role(auth.uid(),'supervisor')
  OR public.has_role(auth.uid(),'admin')
));
CREATE POLICY "Project files: student upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Project files: owner update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Project files: owner delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-files' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin')));
