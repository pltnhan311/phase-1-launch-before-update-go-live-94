-- Create storage bucket for learning materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-materials', 'learning-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'learning-materials');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own materials"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'learning-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow everyone to view materials (public bucket)
CREATE POLICY "Anyone can view materials"
ON storage.objects
FOR SELECT
USING (bucket_id = 'learning-materials');

-- Allow staff to delete materials
CREATE POLICY "Staff can delete materials"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'learning-materials' AND is_staff(auth.uid()));