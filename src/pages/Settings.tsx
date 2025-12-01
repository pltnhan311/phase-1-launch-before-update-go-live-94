import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsers, useUpdateUserRole, AppRole } from '@/hooks/useUsers';
import { Users, Shield, Pencil, Loader2, UserPlus, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Settings() {
  const { data: users, isLoading } = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const [editingUser, setEditingUser] = useState<{ userId: string; currentRole: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('glv');

  const handleEditRole = (userId: string, currentRole: AppRole) => {
    setEditingUser({ userId, currentRole });
    setNewRole(currentRole);
  };

  const handleSaveRole = () => {
    if (editingUser) {
      updateRoleMutation.mutate({ userId: editingUser.userId, newRole });
      setEditingUser(null);
    }
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Quản trị viên</Badge>;
      case 'glv':
        return <Badge variant="gold">Giáo lý viên</Badge>;
      case 'student':
        return <Badge variant="secondary">Học viên</Badge>;
    }
  };

  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  const glvCount = users?.filter(u => u.role === 'glv').length || 0;
  const studentCount = users?.filter(u => u.role === 'student').length || 0;

  return (
    <MainLayout 
      title="Quản lý hệ thống" 
      subtitle="Quản lý người dùng và phân quyền"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-4 md:p-6">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Quản trị viên</p>
                <p className="text-xl md:text-2xl font-bold">{adminCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="gold">
            <CardContent className="flex items-center gap-4 p-4 md:p-6">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-accent/10">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Giáo lý viên</p>
                <p className="text-xl md:text-2xl font-bold">{glvCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-4 md:p-6">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Học viên</p>
                <p className="text-xl md:text-2xl font-bold">{studentCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-4 md:p-6">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-muted">
                <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Tổng cộng</p>
                <p className="text-xl md:text-2xl font-bold">{users?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Danh sách người dùng</CardTitle>
                <CardDescription>Quản lý tài khoản và phân quyền</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Ngày tạo</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user, index) => (
                      <TableRow 
                        key={user.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: vi })}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditRole(user.user_id, user.role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi vai trò</DialogTitle>
            <DialogDescription>
              Chọn vai trò mới cho người dùng này
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(value: AppRole) => setNewRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="glv">Giáo lý viên</SelectItem>
                <SelectItem value="student">Học viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSaveRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
