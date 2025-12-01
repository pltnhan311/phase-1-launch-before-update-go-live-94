import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        throw error;
      }

      return data as AcademicYear[];
    },
  });
}

export function useActiveAcademicYear() {
  return useQuery({
    queryKey: ['academic-year', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as AcademicYear | null;
    },
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (academicYear: { name: string; start_date: string; end_date: string; is_active?: boolean }) => {
      // If setting as active, deactivate all other years first
      if (academicYear.is_active) {
        await supabase
          .from('academic_years')
          .update({ is_active: false })
          .eq('is_active', true);
      }

      const { data, error } = await supabase
        .from('academic_years')
        .insert(academicYear)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Đã tạo năm học thành công');
    },
    onError: (error) => {
      console.error('Error creating academic year:', error);
      toast.error('Không thể tạo năm học');
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AcademicYear> & { id: string }) => {
      // If setting as active, deactivate all other years first
      if (updates.is_active) {
        await supabase
          .from('academic_years')
          .update({ is_active: false })
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('academic_years')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Đã cập nhật năm học thành công');
    },
    onError: (error) => {
      console.error('Error updating academic year:', error);
      toast.error('Không thể cập nhật năm học');
    },
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast.success('Đã xóa năm học thành công');
    },
    onError: (error) => {
      console.error('Error deleting academic year:', error);
      toast.error('Không thể xóa năm học');
    },
  });
}
