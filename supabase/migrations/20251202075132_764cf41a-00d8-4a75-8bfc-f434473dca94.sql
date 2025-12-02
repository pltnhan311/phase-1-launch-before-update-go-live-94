-- Clean up student accounts incorrectly created in catechists table
-- Delete catechist records where email ends with @student.local
DELETE FROM public.catechists 
WHERE email LIKE '%@student.local';