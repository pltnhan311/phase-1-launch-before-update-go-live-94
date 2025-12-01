import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Catechist {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  baptism_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  class_catechists?: {
    id: string;
    is_primary: boolean;
    classes: {
      id: string;
      name: string;
    };
  }[];
}

export function useCatechists() {
  return useQuery({
    queryKey: ['catechists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catechists')
        .select(`
          *,
          class_catechists (
            id,
            is_primary,
            classes (
              id,
              name
            )
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      return data as Catechist[];
    },
  });
}

export function useCatechist(id: string) {
  return useQuery({
    queryKey: ['catechist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catechists')
        .select(`
          *,
          class_catechists (
            id,
            is_primary,
            classes (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as Catechist | null;
    },
    enabled: !!id,
  });
}

export function useCreateCatechist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (catechist: { name: string; email?: string; phone?: string; address?: string; baptism_name?: string }) => {
      const { data, error } = await supabase
        .from('catechists')
        .insert(catechist)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catechists'] });
      toast.success('Đã thêm giáo lý viên thành công');
    },
    onError: (error) => {
      console.error('Error creating catechist:', error);
      toast.error('Không thể thêm giáo lý viên');
    },
  });
}

export function useUpdateCatechist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Catechist> & { id: string }) => {
      const { data, error } = await supabase
        .from('catechists')
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
      queryClient.invalidateQueries({ queryKey: ['catechists'] });
      toast.success('Đã cập nhật giáo lý viên thành công');
    },
    onError: (error) => {
      console.error('Error updating catechist:', error);
      toast.error('Không thể cập nhật giáo lý viên');
    },
  });
}

export function useDeleteCatechist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catechists')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catechists'] });
      toast.success('Đã xóa giáo lý viên thành công');
    },
    onError: (error) => {
      console.error('Error deleting catechist:', error);
      toast.error('Không thể xóa giáo lý viên');
    },
  });
}
