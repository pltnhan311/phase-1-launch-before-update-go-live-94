import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear } from '@/hooks/useAcademicYears';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { Plus, Calendar, Users, GraduationCap, MoreVertical, Pencil, Trash2, Loader2, Database } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AcademicYears() {
  const { data: academicYears, isLoading } = useAcademicYears();
  const { data: classes } = useClasses();
  const { data: students } = useStudents();
  const createAcademicYear = useCreateAcademicYear();
  const updateAcademicYear = useUpdateAcademicYear();
  const deleteAcademicYear = useDeleteAcademicYear();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newYear, setNewYear] = useState({
    name: '',
    start_date: '',
    end_date: ''
  });

  const handleCreateYear = async () => {
    if (!newYear.name || !newYear.start_date || !newYear.end_date) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    createAcademicYear.mutate({
      name: newYear.name,
      start_date: newYear.start_date,
      end_date: newYear.end_date,
      is_active: !academicYears || academicYears.length === 0,
    }, {
      onSuccess: () => {
        setNewYear({ name: '', start_date: '', end_date: '' });
        setIsDialogOpen(false);
      }
    });
  };

  const handleSetActive = (id: string) => {
    updateAcademicYear.mutate({ id, is_active: true });
  };

  const handleDelete = (id: string) => {
    deleteAcademicYear.mutate(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getYearStats = (yearId: string) => {
    const yearClasses = (classes || []).filter(c => c.academic_year_id === yearId);
    const classIds = yearClasses.map(c => c.id);
    const yearStudents = (students || []).filter(s => s.class_id && classIds.includes(s.class_id));
    return {
      classCount: yearClasses.length,
      studentCount: yearStudents.length
    };
  };

  return (
    <MainLayout 
      title="Quản lý Niên khóa" 
      subtitle="Tạo và quản lý các niên khóa học"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Tổng cộng {academicYears?.length || 0} niên khóa
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="mr-2 h-4 w-4" />
                Tạo niên khóa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo niên khóa mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin niên khóa mới. Tên niên khóa không được trùng.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="yearName">Tên niên khóa</Label>
                  <Input
                    id="yearName"
                    placeholder="VD: 2025-2026"
                    value={newYear.name}
                    onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Ngày bắt đầu</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newYear.start_date}
                      onChange={(e) => setNewYear({ ...newYear, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newYear.end_date}
                      onChange={(e) => setNewYear({ ...newYear, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateYear} disabled={createAcademicYear.isPending}>
                  {createAcademicYear.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo niên khóa'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Academic Years Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : academicYears && academicYears.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {academicYears.map((year, index) => {
              const stats = getYearStats(year.id);
              return (
                <Card 
                  key={year.id} 
                  variant={year.is_active ? 'gold' : 'elevated'}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {year.name}
                        {year.is_active && (
                          <Badge variant="success">Đang hoạt động</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(year.start_date)} - {formatDate(year.end_date)}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!year.is_active && (
                          <DropdownMenuItem onClick={() => handleSetActive(year.id)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Kích hoạt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(year.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{stats.classCount}</p>
                          <p className="text-xs text-muted-foreground">Lớp học</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                          <Users className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{stats.studentCount}</p>
                          <p className="text-xs text-muted-foreground">Học viên</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card variant="flat" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có niên khóa nào</h3>
              <p className="text-muted-foreground text-center mb-4">
                Bắt đầu bằng việc tạo niên khóa đầu tiên
              </p>
              <Button variant="gold" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo niên khóa đầu tiên
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
