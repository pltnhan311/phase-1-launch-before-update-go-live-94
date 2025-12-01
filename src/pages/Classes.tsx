import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockClasses, mockUsers, mockAcademicYears } from '@/data/mockData';
import { ClassInfo } from '@/types';
import { Plus, Users, Clock, UserCheck, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Classes() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassInfo[]>(mockClasses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    academicYearId: '',
    description: '',
    schedule: ''
  });

  const glvUsers = mockUsers.filter(u => u.role === 'glv');
  const activeYear = mockAcademicYears.find(y => y.isActive);

  const handleCreateClass = () => {
    if (!newClass.name || !newClass.academicYearId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Check for duplicate name in same year
    if (classes.some(c => c.name === newClass.name && c.academicYearId === newClass.academicYearId)) {
      toast.error('Tên lớp đã tồn tại trong niên khóa này');
      return;
    }

    const yearName = mockAcademicYears.find(y => y.id === newClass.academicYearId)?.name || '';

    const cls: ClassInfo = {
      id: String(classes.length + 1),
      name: newClass.name,
      academicYearId: newClass.academicYearId,
      academicYearName: yearName,
      description: newClass.description,
      schedule: newClass.schedule,
      catechists: [],
      studentCount: 0,
      createdAt: new Date().toISOString()
    };

    setClasses([cls, ...classes]);
    setNewClass({ name: '', academicYearId: '', description: '', schedule: '' });
    setIsDialogOpen(false);
    toast.success('Tạo lớp thành công!');
  };

  return (
    <MainLayout 
      title="Quản lý Lớp học" 
      subtitle="Tạo và quản lý các lớp trong niên khóa"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Niên khóa {activeYear?.name} • {classes.length} lớp
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="mr-2 h-4 w-4" />
                Tạo lớp mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Tạo lớp mới</DialogTitle>
                <DialogDescription>
                  Điền thông tin để tạo lớp học mới trong niên khóa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Tên lớp *</Label>
                  <Input
                    id="className"
                    placeholder="VD: Hiệp Sĩ 5"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Niên khóa *</Label>
                  <Select
                    value={newClass.academicYearId}
                    onValueChange={(value) => setNewClass({ ...newClass, academicYearId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn niên khóa" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAcademicYears.map(year => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} {year.isActive && '(Đang hoạt động)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Lịch học</Label>
                  <Input
                    id="schedule"
                    placeholder="VD: Chủ nhật, 8:00 - 9:30"
                    value={newClass.schedule}
                    onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả về lớp học..."
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateClass}>
                  Tạo lớp
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {classes.map((cls, index) => (
            <Card 
              key={cls.id} 
              variant="interactive"
              className="animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/classes/${cls.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {cls.name}
                      <Badge variant="gold">{cls.academicYearName}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {cls.description || 'Không có mô tả'}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{cls.studentCount}</p>
                        <p className="text-xs text-muted-foreground">Học viên</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Clock className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{cls.schedule || 'Chưa xếp'}</p>
                        <p className="text-xs text-muted-foreground">Lịch học</p>
                      </div>
                    </div>
                  </div>

                  {/* Catechists */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Giáo lý viên phụ trách</span>
                    </div>
                    {cls.catechists.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {cls.catechists.map(cat => (
                          <Badge key={cat.id} variant="secondary">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Chưa gán GLV</p>
                    )}
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
