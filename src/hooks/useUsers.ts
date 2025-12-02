import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRole = 'admin' | 'glv' | 'student';

export interface UserWithRole {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: AppRole;
  created_at: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: (userRole?.role as AppRole) || 'student',
          created_at: profile.created_at,
        };
      });

      return usersWithRoles;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // Get current role to check if we need to sync catechists
      const { data: currentRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Sync with catechists table
      if (newRole === 'glv' || newRole === 'admin') {
        // If new role is glv/admin, ensure catechist record exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profile) {
          const { error: catechistError } = await supabase
            .from('catechists')
            .upsert({
              user_id: userId,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              address: profile.address,
              baptism_name: profile.baptism_name,
              is_active: true
            }, {
              onConflict: 'user_id'
            });

          if (catechistError) console.error('Error syncing catechist:', catechistError);
        }
      } else if (currentRole?.role === 'glv' || currentRole?.role === 'admin') {
        // If changing from glv/admin to student, deactivate catechist
        const { error: deactivateError } = await supabase
          .from('catechists')
          .update({ is_active: false })
          .eq('user_id', userId);

        if (deactivateError) console.error('Error deactivating catechist:', deactivateError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['catechists'] });
      toast.success('Cập nhật vai trò thành công!');
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast.error('Không thể cập nhật vai trò');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Note: This will only work if you have admin privileges
      // In production, you'd call an edge function to delete the user
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Xóa người dùng thành công!');
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Không thể xóa người dùng');
    },
  });
}
