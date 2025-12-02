-- Add unique constraint on catechists.user_id to prevent duplicates
-- This allows ON CONFLICT (user_id) to work in upserts
ALTER TABLE public.catechists
ADD CONSTRAINT catechists_user_id_key UNIQUE (user_id);