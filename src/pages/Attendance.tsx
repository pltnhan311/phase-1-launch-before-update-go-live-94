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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Save, Users, Church, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note: string;
}

interface MassRecord {
  studentId: string;
  studentName: string;
  attended: boolean;
}

export default function Attendance() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAttending, setIsAttending] = useState(false);
  const [isMassRecording, setIsMassRecording] = useState(false);

  const { data: students, isLoading: studentsLoading } = useStudents(selectedClass || undefined);

  const classStudents = students || [];
  const selectedClassInfo = classes?.find(c => c.id === selectedClass);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [massRecords, setMassRecords] = useState<MassRecord[]>([]);

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setIsAttending(false);
    setIsMassRecording(false);
  };

  const startAttendance = () => {
    if (!classStudents.length) return;
    setAttendanceRecords(
      classStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: 'present' as AttendanceStatus,
        note: ''
      }))
    );
    setIsAttending(true);
  };

  const startMassRecording = () => {
    if (!classStudents.length) return;
    setMassRecords(
      classStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        attended: true
      }))
    );
    setIsMassRecording(true);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(records =>
      records.map(r =>
        r.studentId === studentId ? { ...r, status } : r
      )
    );
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceRecords(records =>
      records.map(r =>
        r.studentId === studentId ? { ...r, note } : r
      )
    );
  };

  const handleMassToggle = (studentId: string) => {
    setMassRecords(records =>
      records.map(r =>
        r.studentId === studentId ? { ...r, attended: !r.attended } : r
      )
    );
  };

  const handleSaveAttendance = () => {
    toast.success('Lưu điểm danh Giáo lý thành công!');
    setIsAttending(false);
  };

  const handleSaveMass = () => {
    toast.success('Lưu điểm danh Thánh lễ thành công!');
    setIsMassRecording(false);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Badge variant="present">Có mặt</Badge>;
      case 'absent':
        return <Badge variant="absent">Vắng</Badge>;
      case 'late':
        return <Badge variant="late">Trễ</Badge>;
      case 'excused':
        return <Badge variant="excused">Có phép</Badge>;
    }
  };

  const stats = {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    excused: attendanceRecords.filter(r => r.status === 'excused').length,
  };

  const massStats = {
    attended: massRecords.filter(r => r.attended).length,
    notAttended: massRecords.filter(r => !r.attended).length
  };

  const isLoading = classesLoading || studentsLoading;

  return (
    <MainLayout 
      title="Điểm danh" 
      subtitle="Điểm danh Giáo lý và Thánh lễ"
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
                    <SelectValue placeholder="Chọn lớp để điểm danh" />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes || []).map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 max-w-xs">
                <label className="text-sm font-medium">Ngày</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedClass ? (
          <Card variant="flat" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chọn lớp để điểm danh</h3>
              <p className="text-muted-foreground text-center">
                Vui lòng chọn lớp học từ danh sách phía trên
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : classStudents.length === 0 ? (
          <Card variant="flat" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lớp chưa có học viên</h3>
              <p className="text-muted-foreground text-center">
                Vui lòng thêm học viên vào lớp trước khi điểm danh
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="catechism" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="catechism" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Giáo lý
              </TabsTrigger>
              <TabsTrigger value="mass" className="flex items-center gap-2">
                <Church className="h-4 w-4" />
                Thánh lễ
              </TabsTrigger>
            </TabsList>

            {/* Catechism Attendance Tab */}
            <TabsContent value="catechism" className="space-y-6">
              {isAttending && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Card className="border-success/20 bg-success/5">
                    <CardContent className="flex items-center gap-3 p-4">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.present}</p>
                        <p className="text-sm text-muted-foreground">Có mặt</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 p-4">
                      <XCircle className="h-8 w-8 text-destructive" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
                        <p className="text-sm text-muted-foreground">Vắng</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-warning/20 bg-warning/5">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Clock className="h-8 w-8 text-warning" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.late}</p>
                        <p className="text-sm text-muted-foreground">Trễ</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-muted-foreground/20 bg-muted/50">
                    <CardContent className="flex items-center gap-3 p-4">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.excused}</p>
                        <p className="text-sm text-muted-foreground">Có phép</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {selectedClassInfo?.name} - Điểm danh Giáo lý
                      </CardTitle>
                      <CardDescription>
                        {selectedClassInfo?.schedule || 'Chưa xếp lịch'} • {classStudents.length} học viên
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {isAttending ? (
                        <>
                          <Button variant="outline" onClick={() => setIsAttending(false)}>
                            Hủy
                          </Button>
                          <Button variant="success" onClick={handleSaveAttendance}>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu
                          </Button>
                        </>
                      ) : (
                        <Button variant="gold" onClick={startAttendance}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Bắt đầu điểm danh
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead>Mã HV</TableHead>
                        <TableHead>Họ và tên</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        {isAttending && <TableHead>Ghi chú</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(isAttending ? attendanceRecords : classStudents.map(s => ({ studentId: s.id, studentName: s.name, status: 'present' as AttendanceStatus, note: '' }))).map((record, index) => {
                        const student = classStudents.find(s => s.id === record.studentId);
                        return (
                          <TableRow key={record.studentId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{student?.student_id}</TableCell>
                            <TableCell className="font-medium">{record.studentName}</TableCell>
                            <TableCell>
                              {isAttending ? (
                                <div className="flex justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant={record.status === 'present' ? 'success' : 'outline'}
                                    onClick={() => handleStatusChange(record.studentId, 'present')}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={record.status === 'absent' ? 'destructive' : 'outline'}
                                    onClick={() => handleStatusChange(record.studentId, 'absent')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={record.status === 'late' ? 'gold' : 'outline'}
                                    onClick={() => handleStatusChange(record.studentId, 'late')}
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={record.status === 'excused' ? 'secondary' : 'outline'}
                                    onClick={() => handleStatusChange(record.studentId, 'excused')}
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <Badge variant="outline">Chưa điểm danh</Badge>
                                </div>
                              )}
                            </TableCell>
                            {isAttending && (
                              <TableCell>
                                <Textarea
                                  placeholder="Ghi chú..."
                                  className="min-h-[36px] resize-none"
                                  value={record.note}
                                  onChange={(e) => handleNoteChange(record.studentId, e.target.value)}
                                />
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mass Attendance Tab */}
            <TabsContent value="mass" className="space-y-6">
              {isMassRecording && (
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <Card className="border-success/20 bg-success/5">
                    <CardContent className="flex items-center gap-3 p-4">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{massStats.attended}</p>
                        <p className="text-sm text-muted-foreground">Tham dự</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 p-4">
                      <XCircle className="h-8 w-8 text-destructive" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{massStats.notAttended}</p>
                        <p className="text-sm text-muted-foreground">Không tham dự</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Church className="h-5 w-5" />
                        {selectedClassInfo?.name} - Tham dự Thánh lễ
                      </CardTitle>
                      <CardDescription>
                        Chủ nhật • {classStudents.length} học viên
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {isMassRecording ? (
                        <>
                          <Button variant="outline" onClick={() => setIsMassRecording(false)}>
                            Hủy
                          </Button>
                          <Button variant="success" onClick={handleSaveMass}>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu
                          </Button>
                        </>
                      ) : (
                        <Button variant="gold" onClick={startMassRecording}>
                          <Church className="mr-2 h-4 w-4" />
                          Ghi nhận
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">STT</TableHead>
                        <TableHead>Mã HV</TableHead>
                        <TableHead>Họ và tên</TableHead>
                        <TableHead className="text-center">Tham dự</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(isMassRecording ? massRecords : classStudents.map(s => ({ studentId: s.id, studentName: s.name, attended: true }))).map((record, index) => {
                        const student = classStudents.find(s => s.id === record.studentId);
                        return (
                          <TableRow key={record.studentId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{student?.student_id}</TableCell>
                            <TableCell className="font-medium">{record.studentName}</TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                {isMassRecording ? (
                                  <Checkbox
                                    checked={record.attended}
                                    onCheckedChange={() => handleMassToggle(record.studentId)}
                                  />
                                ) : (
                                  <Badge variant="outline">Chưa ghi nhận</Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
