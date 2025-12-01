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
import { mockAcademicYears } from '@/data/mockData';
import { AcademicYear } from '@/types';
import { Plus, Calendar, Users, GraduationCap, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function AcademicYears() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(mockAcademicYears);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newYear, setNewYear] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const handleCreateYear = () => {
    if (!newYear.name || !newYear.startDate || !newYear.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Check for duplicate
    if (academicYears.some(y => y.name === newYear.name)) {
      toast.error('Niên khóa đã tồn tại');
      return;
    }

    const year: AcademicYear = {
      id: String(academicYears.length + 1),
      name: newYear.name,
      startDate: newYear.startDate,
      endDate: newYear.endDate,
      isActive: false,
      classCount: 0,
      studentCount: 0
    };

    setAcademicYears([year, ...academicYears]);
    setNewYear({ name: '', startDate: '', endDate: '' });
    setIsDialogOpen(false);
    toast.success('Tạo niên khóa thành công!');
  };

  const handleSetActive = (id: string) => {
    setAcademicYears(years => 
      years.map(y => ({ ...y, isActive: y.id === id }))
    );
    toast.success('Đã kích hoạt niên khóa');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
              Tổng cộng {academicYears.length} niên khóa
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
                      value={newYear.startDate}
                      onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newYear.endDate}
                      onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateYear}>
                  Tạo niên khóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Academic Years Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {academicYears.map((year, index) => (
            <Card 
              key={year.id} 
              variant={year.isActive ? 'gold' : 'elevated'}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {year.name}
                    {year.isActive && (
                      <Badge variant="success">Đang hoạt động</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {formatDate(year.startDate)} - {formatDate(year.endDate)}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSetActive(year.id)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Kích hoạt
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
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
                      <p className="text-2xl font-bold text-foreground">{year.classCount}</p>
                      <p className="text-xs text-muted-foreground">Lớp học</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{year.studentCount}</p>
                      <p className="text-xs text-muted-foreground">Học viên</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
