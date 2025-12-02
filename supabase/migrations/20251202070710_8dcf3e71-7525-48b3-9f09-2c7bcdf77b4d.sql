-- Add RLS policies for attendance_sessions table
CREATE POLICY "Staff can view all attendance sessions"
ON public.attendance_sessions
FOR SELECT
TO authenticated
USING (is_staff(auth.uid()));

CREATE POLICY "Staff can create attendance sessions"
ON public.attendance_sessions
FOR INSERT
TO authenticated
WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update attendance sessions"
ON public.attendance_sessions
FOR UPDATE
TO authenticated
USING (is_staff(auth.uid()));

CREATE POLICY "Staff can delete attendance sessions"
ON public.attendance_sessions
FOR DELETE
TO authenticated
USING (is_staff(auth.uid()));