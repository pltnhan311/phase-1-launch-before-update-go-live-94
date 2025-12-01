import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import { mockClasses, mockStudents } from '@/data/mockData';
import { Church, Calendar, Save, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MassRecord {
  studentId: string;
  studentName: string;
  attended: boolean;
}

export default function MassAttendance() {
  const [selectedClass, setSelectedClass] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isRecording, setIsRecording] = useState(false);

  const classStudents = mockStudents.filter(s => s.classId === selectedClass);
  const selectedClassInfo = mockClasses.find(c => c.id === selectedClass);

  const [records, setRecords] = useState<MassRecord[]>(
    classStudents.map(s => ({
      studentId: s.id,
      studentName: s.name,
      attended: true
    }))
  );

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    const students = mockStudents.filter(s => s.classId === classId);
    setRecords(
      students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        attended: true
      }))
    );
  };

  const handleToggle = (studentId: string) => {
    setRecords(records =>
      records.map(r =>
        r.studentId === studentId ? { ...r, attended: !r.attended } : r
      )
    );
  };

  const handleSave = () => {
    toast.success('Lưu điểm danh Thánh lễ thành công!');
    setIsRecording(false);
  };

  const stats = {
    attended: records.filter(r => r.attended).length,
    notAttended: records.filter(r => !r.attended).length
  };

  return (
    <MainLayout 
      title="Tham dự Thánh lễ" 
      subtitle="Ghi nhận tham dự Thánh lễ Chúa nhật"
    >
      <div className="space-y-6">
        {/* Selection */}
        <Card variant="flat" className="border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="space-y-2 flex-1 max-w-xs">
                <label className="text-sm font-medium">Chọn lớp</label>
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2 flex-1 max-w-xs">
                <label className="text-sm font-medium">Ngày Chúa nhật</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button 
                variant={isRecording ? 'outline' : 'gold'}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Hủy
                  </>
                ) : (
                  <>
                    <Church className="mr-2 h-4 w-4" />
                    Ghi nhận
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {isRecording && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 max-w-md">
            <Card className="border-success/20 bg-success/5">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.attended}</p>
                  <p className="text-sm text-muted-foreground">Tham dự</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="flex items-center gap-3 p-4">
                <XCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.notAttended}</p>
                  <p className="text-sm text-muted-foreground">Không tham dự</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Record Table */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5" />
                  {selectedClassInfo?.name}
                </CardTitle>
                <CardDescription>
                  {new Date(selectedDate).toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </CardDescription>
              </div>
              {isRecording && (
                <Button variant="success" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Mã HV</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead className="text-center">Tham dự lễ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => {
                  const student = classStudents.find(s => s.id === record.studentId);
                  return (
                    <TableRow key={record.studentId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{student?.studentId}</TableCell>
                      <TableCell className="font-medium">{record.studentName}</TableCell>
                      <TableCell className="text-center">
                        {isRecording ? (
                          <Checkbox
                            checked={record.attended}
                            onCheckedChange={() => handleToggle(record.studentId)}
                            className="h-5 w-5"
                          />
                        ) : (
                          <Badge variant={record.attended ? 'present' : 'absent'}>
                            {record.attended ? 'Có' : 'Không'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
