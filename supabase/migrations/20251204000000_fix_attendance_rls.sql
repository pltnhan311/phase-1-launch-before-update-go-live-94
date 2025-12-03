-- Allow students to insert their own attendance records
CREATE POLICY "Students can insert own attendance" ON public.attendance_records
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Allow students to update their own attendance records
CREATE POLICY "Students can update own attendance" ON public.attendance_records
    FOR UPDATE TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Allow students to delete their own attendance records
CREATE POLICY "Students can delete own attendance" ON public.attendance_records
    FOR DELETE TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Allow students to insert their own mass attendance records
CREATE POLICY "Students can insert own mass attendance" ON public.mass_attendance
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Allow students to update their own mass attendance records
CREATE POLICY "Students can update own mass attendance" ON public.mass_attendance
    FOR UPDATE TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- Allow students to delete their own mass attendance records
CREATE POLICY "Students can delete own mass attendance" ON public.mass_attendance
    FOR DELETE TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );
