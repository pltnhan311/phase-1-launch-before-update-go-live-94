-- Drop profiles table (data is in catechists and students)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Update handle_new_user function to insert into catechists with admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert into catechists (for users added via Cloud UI - default admin)
  INSERT INTO public.catechists (user_id, name, email, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    true
  );
  
  -- Insert into user_roles with role = admin (default for Cloud UI)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

-- Update RLS policies that referenced profiles to use catechists instead
-- Catechists table policies already exist and are correct

-- Update user_roles policies (they are already correct)

-- Staff can manage GLV/Admin in catechists (replaces old profiles policy)
DROP POLICY IF EXISTS "Staff can manage GLV profiles" ON public.catechists;
CREATE POLICY "Staff can manage GLV catechists"
ON public.catechists
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (
    is_staff(auth.uid()) AND 
    EXISTS (
      SELECT 1
      FROM user_roles
      WHERE user_roles.user_id = catechists.user_id
        AND user_roles.role IN ('glv', 'admin')
    )
  )
);

-- Users can update their own catechist record
DROP POLICY IF EXISTS "Users can update own catechist" ON public.catechists;
CREATE POLICY "Users can update own catechist"
ON public.catechists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure catechists.user_id has proper constraint
ALTER TABLE public.catechists
DROP CONSTRAINT IF EXISTS catechists_user_id_key;

ALTER TABLE public.catechists
ADD CONSTRAINT catechists_user_id_key UNIQUE (user_id);