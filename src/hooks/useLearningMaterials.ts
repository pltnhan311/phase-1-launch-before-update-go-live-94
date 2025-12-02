import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LearningMaterial {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string;
  week: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  classes?: {
    name: string;
  };
  uploader?: {
    name: string;
  };
}

export function useLearningMaterials(classId?: string) {
  return useQuery({
    queryKey: ['learning-materials', classId],
    queryFn: async () => {
      let query = supabase
        .from('learning_materials')
        .select(`
          *,
          classes(name)
        `)
        .order('created_at', { ascending: false });

      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch uploader names separately
      const uploaderIds = [...new Set(data?.map(m => m.uploaded_by).filter(Boolean))];
      let uploaderMap: Record<string, string> = {};
      
      if (uploaderIds.length > 0) {
        const { data: catechists } = await supabase
          .from('catechists')
          .select('user_id, name')
          .in('user_id', uploaderIds);
        
        uploaderMap = (catechists || []).reduce((acc, c) => {
          if (c.user_id) acc[c.user_id] = c.name;
          return acc;
        }, {} as Record<string, string>);
      }

      return (data || []).map(m => ({
        ...m,
        uploader: m.uploaded_by ? { name: uploaderMap[m.uploaded_by] || 'N/A' } : undefined
      })) as LearningMaterial[];
    },
  });
}

export function useUploadMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      classId,
      week,
    }: {
      file: File;
      title: string;
      description?: string;
      classId: string;
      week?: number;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('learning-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('learning-materials')
        .getPublicUrl(fileName);

      // Insert record into database
      const { data, error } = await supabase
        .from('learning_materials')
        .insert({
          title,
          description: description || null,
          class_id: classId,
          week: week || null,
          file_url: publicUrl,
          file_type: 'pdf',
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] });
      toast.success('Upload tài liệu thành công!');
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast.error('Lỗi upload: ' + error.message);
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: LearningMaterial) => {
      // Delete file from storage if exists
      if (material.file_url) {
        const urlParts = material.file_url.split('/learning-materials/');
        if (urlParts[1]) {
          await supabase.storage
            .from('learning-materials')
            .remove([urlParts[1]]);
        }
      }

      // Delete record from database
      const { error } = await supabase
        .from('learning_materials')
        .delete()
        .eq('id', material.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] });
      toast.success('Đã xóa tài liệu');
    },
    onError: (error: Error) => {
      toast.error('Lỗi xóa tài liệu: ' + error.message);
    },
  });
}
