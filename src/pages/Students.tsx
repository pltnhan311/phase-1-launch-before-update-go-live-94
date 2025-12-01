import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { mockStudents, mockClasses } from '@/data/mockData';
import { Student } from '@/types';
import { Plus, Search, Eye, Pencil, User, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Students() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    classId: '',
    baptismName: '',
    phone: '',
    parentPhone: '',
    address: ''
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleCreateStudent = () => {
    if (!newStudent.name || !newStudent.birthDate || !newStudent.classId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const className = mockClasses.find(c => c.id === newStudent.classId)?.name || '';
    const studentId = `HS2024${String(students.length + 1).padStart(3, '0')}`;

    const student: Student = {
      id: String(students.length + 1),
      studentId,
      name: newStudent.name,
      birthDate: newStudent.birthDate,
      gender: newStudent.gender,
      classId: newStudent.classId,
      className,
      baptismName: newStudent.baptismName,
      phone: newStudent.phone,
      parentPhone: newStudent.parentPhone,
      address: newStudent.address,
      enrollmentDate: new Date().toISOString().split('T')[0]
    };

    setStudents([student, ...students]);
    setNewStudent({
      name: '',
      birthDate: '',
      gender: 'male',
      classId: '',
      baptismName: '',
      phone: '',
      parentPhone: '',
      address: ''
    });
    setIsDialogOpen(false);
    toast.success('Thêm học viên thành công!');
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
      title="Quản lý Học viên" 
      subtitle="Danh sách và thông tin học viên"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card variant="flat" className="border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên hoặc mã HV..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả lớp</SelectItem>
                    {mockClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm học viên
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Thêm học viên mới</DialogTitle>
                    <DialogDescription>
                      Điền thông tin để thêm học viên vào lớp.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Họ và tên *</Label>
                        <Input
                          id="studentName"
                          placeholder="Nguyễn Văn A"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="baptismName">Tên Thánh</Label>
                        <Input
                          id="baptismName"
                          placeholder="Giuse"
                          value={newStudent.baptismName}
                          onChange={(e) => setNewStudent({ ...newStudent, baptismName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Ngày sinh *</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={newStudent.birthDate}
                          onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <Select
                          value={newStudent.gender}
                          onValueChange={(value: 'male' | 'female') => setNewStudent({ ...newStudent, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="classId">Lớp học *</Label>
                      <Select
                        value={newStudent.classId}
                        onValueChange={(value) => setNewStudent({ ...newStudent, classId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn lớp" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockClasses.map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">SĐT học viên</Label>
                        <Input
                          id="phone"
                          placeholder="0901234567"
                          value={newStudent.phone}
                          onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">SĐT phụ huynh</Label>
                        <Input
                          id="parentPhone"
                          placeholder="0901234567"
                          value={newStudent.parentPhone}
                          onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        placeholder="123 Đường ABC, Quận XYZ"
                        value={newStudent.address}
                        onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleCreateStudent}>
                      Thêm học viên
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Tìm thấy {filteredStudents.length} học viên
        </p>

        {/* Students Table */}
        <Card variant="elevated">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HV</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Tên Thánh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow 
                    key={student.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.baptismName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.className}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(student.birthDate)}</TableCell>
                    <TableCell>
                      <Badge variant={student.gender === 'male' ? 'default' : 'gold'}>
                        {student.gender === 'male' ? 'Nam' : 'Nữ'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Student Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {selectedStudent && (
              <>
                <DialogHeader>
                  <DialogTitle>Hồ sơ học viên</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-display text-2xl font-bold text-primary">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">
                        {selectedStudent.baptismName} {selectedStudent.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedStudent.studentId}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ngày sinh</p>
                        <p className="font-medium">{formatDate(selectedStudent.birthDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Lớp</p>
                        <p className="font-medium">{selectedStudent.className}</p>
                      </div>
                    </div>
                    {selectedStudent.phone && (
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Số điện thoại</p>
                          <p className="font-medium">{selectedStudent.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedStudent.address && (
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Địa chỉ</p>
                          <p className="font-medium">{selectedStudent.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
