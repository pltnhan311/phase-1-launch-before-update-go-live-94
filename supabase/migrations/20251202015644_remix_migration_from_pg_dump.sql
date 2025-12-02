CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'glv',
    'student'
);


--
-- Name: attendance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'excused'
);


--
-- Name: gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender AS ENUM (
    'male',
    'female'
);


--
-- Name: score_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.score_type AS ENUM (
    'presentation',
    'semester1',
    'semester2'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email
  );
  
  -- Default role is 'glv' for new signups (can be changed by admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'glv');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_staff(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'glv')
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_years (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    date date NOT NULL,
    status public.attendance_status DEFAULT 'present'::public.attendance_status NOT NULL,
    note text,
    recorded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: attendance_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    check_in_code character varying(6) NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: catechists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catechists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    baptism_name text,
    avatar_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: class_catechists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_catechists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    catechist_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    academic_year_id uuid NOT NULL,
    description text,
    schedule text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: learning_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    file_url text,
    file_type text DEFAULT 'pdf'::text NOT NULL,
    week integer,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mass_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mass_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    date date NOT NULL,
    attended boolean DEFAULT false NOT NULL,
    note text,
    recorded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    type public.score_type NOT NULL,
    score numeric(4,1) NOT NULL,
    max_score numeric(4,1) DEFAULT 10 NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    note text,
    graded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT scores_score_check CHECK (((score >= (0)::numeric) AND (score <= (10)::numeric)))
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    student_id text NOT NULL,
    name text NOT NULL,
    birth_date date NOT NULL,
    gender public.gender NOT NULL,
    phone text,
    parent_phone text,
    address text,
    baptism_name text,
    avatar_url text,
    class_id uuid,
    enrollment_date date DEFAULT CURRENT_DATE NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'student'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: academic_years academic_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_student_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_student_id_date_key UNIQUE (student_id, date);


--
-- Name: attendance_sessions attendance_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT attendance_sessions_pkey PRIMARY KEY (id);


--
-- Name: catechists catechists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catechists
    ADD CONSTRAINT catechists_pkey PRIMARY KEY (id);


--
-- Name: class_catechists class_catechists_class_id_catechist_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_catechists
    ADD CONSTRAINT class_catechists_class_id_catechist_id_key UNIQUE (class_id, catechist_id);


--
-- Name: class_catechists class_catechists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_catechists
    ADD CONSTRAINT class_catechists_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: learning_materials learning_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_materials
    ADD CONSTRAINT learning_materials_pkey PRIMARY KEY (id);


--
-- Name: mass_attendance mass_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mass_attendance
    ADD CONSTRAINT mass_attendance_pkey PRIMARY KEY (id);


--
-- Name: mass_attendance mass_attendance_student_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mass_attendance
    ADD CONSTRAINT mass_attendance_student_id_date_key UNIQUE (student_id, date);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: scores scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_student_id_key UNIQUE (student_id);


--
-- Name: attendance_sessions unique_session; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT unique_session UNIQUE (class_id, date, check_in_code);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: academic_years update_academic_years_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendance_records update_attendance_records_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: catechists update_catechists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_catechists_updated_at BEFORE UPDATE ON public.catechists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: classes update_classes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: learning_materials update_learning_materials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_learning_materials_updated_at BEFORE UPDATE ON public.learning_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: scores update_scores_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: students update_students_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendance_records attendance_records_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: attendance_records attendance_records_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: attendance_sessions attendance_sessions_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT attendance_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: catechists catechists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catechists
    ADD CONSTRAINT catechists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: class_catechists class_catechists_catechist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_catechists
    ADD CONSTRAINT class_catechists_catechist_id_fkey FOREIGN KEY (catechist_id) REFERENCES public.catechists(id) ON DELETE CASCADE;


--
-- Name: class_catechists class_catechists_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_catechists
    ADD CONSTRAINT class_catechists_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: classes classes_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE CASCADE;


--
-- Name: learning_materials learning_materials_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_materials
    ADD CONSTRAINT learning_materials_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: learning_materials learning_materials_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_materials
    ADD CONSTRAINT learning_materials_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: mass_attendance mass_attendance_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mass_attendance
    ADD CONSTRAINT mass_attendance_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: mass_attendance mass_attendance_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mass_attendance
    ADD CONSTRAINT mass_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: scores scores_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: scores scores_graded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: scores scores_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: students students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: academic_years Admins can manage academic years; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage academic years" ON public.academic_years TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: catechists Admins can manage catechists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage catechists" ON public.catechists TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: class_catechists Admins can manage class catechists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage class catechists" ON public.class_catechists TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: classes Admins can manage classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage classes" ON public.classes TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: learning_materials Admins can manage materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage materials" ON public.learning_materials TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: students Admins can manage students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage students" ON public.students TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: academic_years Everyone can view academic years; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view academic years" ON public.academic_years FOR SELECT TO authenticated USING (true);


--
-- Name: catechists Everyone can view catechists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view catechists" ON public.catechists FOR SELECT TO authenticated USING (true);


--
-- Name: class_catechists Everyone can view class catechists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view class catechists" ON public.class_catechists FOR SELECT TO authenticated USING (true);


--
-- Name: classes Everyone can view classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view classes" ON public.classes FOR SELECT TO authenticated USING (true);


--
-- Name: learning_materials Everyone can view materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view materials" ON public.learning_materials FOR SELECT TO authenticated USING (true);


--
-- Name: learning_materials GLV can manage materials for their classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "GLV can manage materials for their classes" ON public.learning_materials TO authenticated USING ((public.has_role(auth.uid(), 'glv'::public.app_role) AND (EXISTS ( SELECT 1
   FROM (public.class_catechists cc
     JOIN public.catechists c ON ((cc.catechist_id = c.id)))
  WHERE ((cc.class_id = learning_materials.class_id) AND (c.user_id = auth.uid()))))));


--
-- Name: students GLV can manage students in their classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "GLV can manage students in their classes" ON public.students TO authenticated USING ((public.has_role(auth.uid(), 'glv'::public.app_role) AND (EXISTS ( SELECT 1
   FROM (public.class_catechists cc
     JOIN public.catechists c ON ((cc.catechist_id = c.id)))
  WHERE ((cc.class_id = students.class_id) AND (c.user_id = auth.uid()))))));


--
-- Name: attendance_records Staff can manage attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage attendance" ON public.attendance_records TO authenticated USING (public.is_staff(auth.uid()));


--
-- Name: mass_attendance Staff can manage mass attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage mass attendance" ON public.mass_attendance TO authenticated USING (public.is_staff(auth.uid()));


--
-- Name: scores Staff can manage scores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage scores" ON public.scores TO authenticated USING (public.is_staff(auth.uid()));


--
-- Name: attendance_records Staff can view all attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all attendance" ON public.attendance_records FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));


--
-- Name: mass_attendance Staff can view all mass attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all mass attendance" ON public.mass_attendance FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));


--
-- Name: profiles Staff can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));


--
-- Name: scores Staff can view all scores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all scores" ON public.scores FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));


--
-- Name: students Staff can view all students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all students" ON public.students FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));


--
-- Name: attendance_records Students can view own attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view own attendance" ON public.attendance_records FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = attendance_records.student_id) AND (s.user_id = auth.uid())))));


--
-- Name: mass_attendance Students can view own mass attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view own mass attendance" ON public.mass_attendance FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = mass_attendance.student_id) AND (s.user_id = auth.uid())))));


--
-- Name: scores Students can view own scores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view own scores" ON public.scores FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.students s
  WHERE ((s.id = scores.student_id) AND (s.user_id = auth.uid())))));


--
-- Name: students Students can view themselves; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view themselves" ON public.students FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: academic_years; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

--
-- Name: attendance_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

--
-- Name: attendance_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: catechists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.catechists ENABLE ROW LEVEL SECURITY;

--
-- Name: class_catechists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.class_catechists ENABLE ROW LEVEL SECURITY;

--
-- Name: classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_materials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;

--
-- Name: mass_attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mass_attendance ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: scores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

--
-- Name: students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


