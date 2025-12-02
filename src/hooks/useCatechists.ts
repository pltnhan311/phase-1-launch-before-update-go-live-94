import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Catechist {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  baptism_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: string;
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
      // Fetch GLV users from profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner (role)
        `)
        .eq('is_active', true)
        .in('user_roles.role', ['glv', 'admin'])
        .order('name');

      if (profilesError) throw profilesError;

      // Fetch class assignments via catechists table
      const { data: catechists, error: catechistsError } = await supabase
        .from('catechists')
        .select(`
          user_id,
          class_catechists (
            id,
            is_primary,
            classes (
              id,
              name
            )
          )
        `)
        .eq('is_active', true);

      if (catechistsError) throw catechistsError;

      // Map class assignments to profiles
      const catechistsMap = new Map(
        catechists?.map(c => [c.user_id, c.class_catechists]) || []
      );

      return (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        baptism_name: profile.baptism_name,
        avatar_url: profile.avatar_url,
        is_active: profile.is_active,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        role: Array.isArray(profile.user_roles) ? profile.user_roles[0]?.role : undefined,
        class_catechists: catechistsMap.get(profile.user_id) || []
      })) as Catechist[];
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
    mutationFn: async (data: { user_id: string; name: string; email?: string; phone?: string; address?: string; baptism_name?: string }) => {
      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: data.user_id,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          baptism_name: data.baptism_name || null,
          is_active: true
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Create catechist entry for class mapping
      const { error: catechistError } = await supabase
        .from('catechists')
        .upsert({
          user_id: data.user_id,
          name: data.name,
          is_active: true
        }, {
          onConflict: 'user_id'
        });

      if (catechistError) throw catechistError;

      return { success: true };
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
    mutationFn: async ({ user_id, ...updates }: Partial<Catechist> & { user_id: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          baptism_name: updates.baptism_name,
        })
        .eq('user_id', user_id);

      if (error) throw error;

      return { success: true };
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
    mutationFn: async (user_id: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', user_id);

      if (error) throw error;
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
