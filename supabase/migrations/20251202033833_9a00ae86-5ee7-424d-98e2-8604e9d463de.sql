-- Step 1: Drop and recreate handle_new_user function to include catechists sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  default_role app_role := 'glv';
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, default_role);
  
  -- If role is glv or admin, also insert into catechists
  IF default_role IN ('glv', 'admin') THEN
    INSERT INTO public.catechists (user_id, name, email, is_active)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
      NEW.email,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 2: Create the missing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Sync existing auth users to profiles
INSERT INTO public.profiles (user_id, name, email)
SELECT 
  id, 
  COALESCE(raw_user_meta_data ->> 'name', email), 
  email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Step 4: Sync existing auth users to user_roles (avoiding duplicates)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'glv'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);

-- Step 5: Sync GLV/Admin users to catechists table
INSERT INTO public.catechists (user_id, name, email, is_active)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'name', u.email),
  u.email,
  true
FROM auth.users u
INNER JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role IN ('glv', 'admin')
  AND u.id NOT IN (SELECT user_id FROM public.catechists WHERE user_id IS NOT NULL);