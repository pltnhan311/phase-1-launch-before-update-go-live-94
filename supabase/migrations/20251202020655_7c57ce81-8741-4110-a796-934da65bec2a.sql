-- Step 1: Add new columns to profiles for GLV info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS baptism_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Migrate existing catechist data to profiles (if any catechists exist without profiles)
INSERT INTO profiles (user_id, name, email, phone, baptism_name, address, avatar_url, is_active)
SELECT 
  c.user_id,
  c.name,
  c.email,
  c.phone,
  c.baptism_name,
  c.address,
  c.avatar_url,
  c.is_active
FROM catechists c
WHERE c.user_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = c.user_id
  );

-- Step 3: Update class_catechists to reference profiles via user_id
-- Keep the catechists table as mapping table for backward compatibility
-- But ensure catechists.user_id links properly

-- Step 4: Update RLS policies for profiles to allow staff to manage GLV profiles
DROP POLICY IF EXISTS "Staff can manage GLV profiles" ON profiles;
CREATE POLICY "Staff can manage GLV profiles"
ON profiles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (is_staff(auth.uid()) AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = profiles.user_id AND role IN ('glv', 'admin')
  ))
);

-- Step 5: Ensure students table has proper user_id linking for auth
-- (already exists, just verify the structure is correct)