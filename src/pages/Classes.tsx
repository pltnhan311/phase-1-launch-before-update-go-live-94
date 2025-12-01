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
import { useClasses, useCreateClass } from '@/hooks/useClasses';
import { useAcademicYears, useActiveAcademicYear } from '@/hooks/useAcademicYears';
import { Plus, Users, Clock, UserCheck, ChevronRight, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function Classes() {
  const navigate = useNavigate();
  const { data: classes, isLoading } = useClasses();
  const { data: academicYears } = useAcademicYears();
  const { data: activeYear } = useActiveAcademicYear();
  const createClass = useCreateClass();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    academic_year_id: '',
    description: '',
    schedule: ''
  });

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.academic_year_id) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    createClass.mutate({
      name: newClass.name,
      academic_year_id: newClass.academic_year_id,
      description: newClass.description || undefined,
      schedule: newClass.schedule || undefined,
    }, {
      onSuccess: () => {
        setNewClass({ name: '', academic_year_id: '', description: '', schedule: '' });
        setIsDialogOpen(false);
      }
    });
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
              {activeYear ? `Niên khóa ${activeYear.name}` : 'Chưa có niên khóa'} • {classes?.length || 0} lớp
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" disabled={!academicYears || academicYears.length === 0}>
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
                    value={newClass.academic_year_id}
                    onValueChange={(value) => setNewClass({ ...newClass, academic_year_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn niên khóa" />
                    </SelectTrigger>
                    <SelectContent>
                      {(academicYears || []).map(year => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} {year.is_active && '(Đang hoạt động)'}
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
                <Button onClick={handleCreateClass} disabled={createClass.isPending}>
                  {createClass.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo lớp'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : classes && classes.length > 0 ? (
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
                        <Badge variant="gold">{cls.academic_years?.name || 'N/A'}</Badge>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">{cls.students?.[0]?.count || 0}</p>
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

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Giáo lý viên phụ trách</span>
                      </div>
                      {cls.class_catechists && cls.class_catechists.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {cls.class_catechists.map(cc => (
                            <Badge key={cc.id} variant="secondary">
                              {cc.catechists?.name}
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
        ) : (
          <Card variant="flat" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có lớp học nào</h3>
              <p className="text-muted-foreground text-center mb-4">
                {!academicYears || academicYears.length === 0 
                  ? 'Hãy tạo niên khóa trước khi tạo lớp học'
                  : 'Bắt đầu bằng việc tạo lớp học đầu tiên'}
              </p>
              {academicYears && academicYears.length > 0 && (
                <Button variant="gold" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo lớp đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
