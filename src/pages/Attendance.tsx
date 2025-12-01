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
import { Textarea } from '@/components/ui/textarea';
import { mockClasses, mockStudents, mockAttendanceSessions } from '@/data/mockData';
import { AttendanceStatus } from '@/types';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Save, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note: string;
}

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAttending, setIsAttending] = useState(false);
  
  const classStudents = mockStudents.filter(s => s.classId === selectedClass);
  const selectedClassInfo = mockClasses.find(c => c.id === selectedClass);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    classStudents.map(s => ({
      studentId: s.id,
      studentName: s.name,
      status: 'present' as AttendanceStatus,
      note: ''
    }))
  );

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    const students = mockStudents.filter(s => s.classId === classId);
    setAttendanceRecords(
      students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: 'present' as AttendanceStatus,
        note: ''
      }))
    );
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

  const handleSaveAttendance = () => {
    // In production, this would save to database
    toast.success('Lưu điểm danh thành công!');
    setIsAttending(false);
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

  return (
    <MainLayout 
      title="Điểm danh" 
      subtitle="Điểm danh học viên hằng tuần"
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
                <label className="text-sm font-medium">Ngày điểm danh</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button 
                variant={isAttending ? 'outline' : 'gold'}
                onClick={() => setIsAttending(!isAttending)}
              >
                {isAttending ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Hủy
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Bắt đầu điểm danh
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
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

        {/* Class Info */}
        {selectedClassInfo && (
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {selectedClassInfo.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedClassInfo.schedule} • {classStudents.length} học viên
                  </CardDescription>
                </div>
                {isAttending && (
                  <Button variant="success" onClick={handleSaveAttendance}>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu điểm danh
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
                    <TableHead className="text-center">Trạng thái</TableHead>
                    {isAttending && <TableHead>Ghi chú</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record, index) => {
                    const student = classStudents.find(s => s.id === record.studentId);
                    return (
                      <TableRow key={record.studentId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{student?.studentId}</TableCell>
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
                              {getStatusBadge(record.status)}
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
        )}

        {/* Recent Sessions */}
        {!isAttending && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Lịch sử điểm danh</CardTitle>
              <CardDescription>Các buổi điểm danh gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAttendanceSessions.map(session => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{session.className}</p>
                        <p className="text-sm text-muted-foreground">
                          Tuần {session.week} • {new Date(session.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-success">
                          {session.presentCount}/{session.totalStudents} có mặt
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((session.presentCount / session.totalStudents) * 100)}% chuyên cần
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
