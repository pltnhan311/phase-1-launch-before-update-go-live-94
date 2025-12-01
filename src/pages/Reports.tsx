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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockClasses, mockStudents, mockAttendanceSessions, mockScores } from '@/data/mockData';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Church,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const [selectedClass, setSelectedClass] = useState<string>('1');
  const [reportPeriod, setReportPeriod] = useState<string>('week');

  const classStudents = mockStudents.filter(s => s.classId === selectedClass);
  const selectedClassInfo = mockClasses.find(c => c.id === selectedClass);

  // Mock attendance report data
  const attendanceReport = classStudents.map(student => {
    const totalSessions = 12; // Mock: 12 weeks
    const presentCount = Math.floor(Math.random() * 3) + 10; // 10-12 sessions attended
    return {
      studentId: student.studentId,
      name: student.name,
      totalSessions,
      presentCount,
      absentCount: totalSessions - presentCount,
      attendanceRate: Math.round((presentCount / totalSessions) * 100)
    };
  });

  // Mock mass attendance data
  const massAttendanceReport = classStudents.map(student => {
    const totalMasses = 12;
    const attendedCount = Math.floor(Math.random() * 4) + 9;
    return {
      studentId: student.studentId,
      name: student.name,
      totalMasses,
      attendedCount,
      missedCount: totalMasses - attendedCount,
      attendanceRate: Math.round((attendedCount / totalMasses) * 100)
    };
  });

  // Mock score report
  const scoreReport = classStudents.map(student => {
    const presentation = (Math.random() * 3 + 7).toFixed(1);
    const semester1 = (Math.random() * 3 + 7).toFixed(1);
    const avg = ((parseFloat(presentation) + parseFloat(semester1)) / 2).toFixed(1);
    return {
      studentId: student.studentId,
      name: student.name,
      presentation: parseFloat(presentation),
      semester1: parseFloat(semester1),
      average: parseFloat(avg)
    };
  });

  const handleExport = (type: string) => {
    toast.success(`Đang xuất báo cáo ${type}...`);
    // In production, this would generate and download the file
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return <Badge variant="success">{score}</Badge>;
    if (score >= 6.5) return <Badge variant="gold">{score}</Badge>;
    if (score >= 5) return <Badge variant="warning">{score}</Badge>;
    return <Badge variant="destructive">{score}</Badge>;
  };

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 90) return <Badge variant="success">{rate}%</Badge>;
    if (rate >= 75) return <Badge variant="gold">{rate}%</Badge>;
    if (rate >= 60) return <Badge variant="warning">{rate}%</Badge>;
    return <Badge variant="destructive">{rate}%</Badge>;
  };

  // Calculate summary stats
  const avgAttendance = Math.round(
    attendanceReport.reduce((sum, r) => sum + r.attendanceRate, 0) / attendanceReport.length
  );
  const avgMassAttendance = Math.round(
    massAttendanceReport.reduce((sum, r) => sum + r.attendanceRate, 0) / massAttendanceReport.length
  );
  const avgScore = (
    scoreReport.reduce((sum, r) => sum + r.average, 0) / scoreReport.length
  ).toFixed(1);

  return (
    <MainLayout 
      title="Báo cáo" 
      subtitle="Thống kê chuyên cần, điểm danh lễ và điểm số"
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TB Chuyên cần</p>
                <p className="text-2xl font-bold">{avgAttendance}%</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Church className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TB Tham dự lễ</p>
                <p className="text-2xl font-bold">{avgMassAttendance}%</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="gold">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ĐTB lớp</p>
                <p className="text-2xl font-bold">{avgScore}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="flat" className="border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
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
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Tuần này</SelectItem>
                    <SelectItem value="month">Tháng này</SelectItem>
                    <SelectItem value="semester">Học kỳ</SelectItem>
                    <SelectItem value="year">Cả năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => handleExport('Excel')}>
                <Download className="mr-2 h-4 w-4" />
                Xuất Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="attendance">Chuyên cần</TabsTrigger>
            <TabsTrigger value="mass">Tham dự lễ</TabsTrigger>
            <TabsTrigger value="scores">Điểm số</TabsTrigger>
          </TabsList>

          {/* Attendance Report */}
          <TabsContent value="attendance">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Báo cáo chuyên cần - {selectedClassInfo?.name}
                </CardTitle>
                <CardDescription>
                  Thống kê điểm danh giáo lý hằng tuần
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã HV</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead className="text-center">Tổng buổi</TableHead>
                      <TableHead className="text-center">Có mặt</TableHead>
                      <TableHead className="text-center">Vắng</TableHead>
                      <TableHead className="text-center">Tỷ lệ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceReport.map(row => (
                      <TableRow key={row.studentId}>
                        <TableCell className="font-mono text-sm">{row.studentId}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-center">{row.totalSessions}</TableCell>
                        <TableCell className="text-center text-success">{row.presentCount}</TableCell>
                        <TableCell className="text-center text-destructive">{row.absentCount}</TableCell>
                        <TableCell className="text-center">
                          {getAttendanceBadge(row.attendanceRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mass Attendance Report */}
          <TabsContent value="mass">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5" />
                  Báo cáo tham dự Thánh lễ - {selectedClassInfo?.name}
                </CardTitle>
                <CardDescription>
                  Thống kê tham dự Thánh lễ Chúa nhật
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã HV</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead className="text-center">Tổng lễ</TableHead>
                      <TableHead className="text-center">Tham dự</TableHead>
                      <TableHead className="text-center">Vắng</TableHead>
                      <TableHead className="text-center">Tỷ lệ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {massAttendanceReport.map(row => (
                      <TableRow key={row.studentId}>
                        <TableCell className="font-mono text-sm">{row.studentId}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-center">{row.totalMasses}</TableCell>
                        <TableCell className="text-center text-success">{row.attendedCount}</TableCell>
                        <TableCell className="text-center text-destructive">{row.missedCount}</TableCell>
                        <TableCell className="text-center">
                          {getAttendanceBadge(row.attendanceRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Score Report */}
          <TabsContent value="scores">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Báo cáo điểm số - {selectedClassInfo?.name}
                </CardTitle>
                <CardDescription>
                  Tổng hợp điểm thuyết trình và học kỳ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã HV</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead className="text-center">Thuyết trình</TableHead>
                      <TableHead className="text-center">Học kỳ 1</TableHead>
                      <TableHead className="text-center">ĐTB</TableHead>
                      <TableHead className="text-center">Xếp loại</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scoreReport.map(row => (
                      <TableRow key={row.studentId}>
                        <TableCell className="font-mono text-sm">{row.studentId}</TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-center">{getScoreBadge(row.presentation)}</TableCell>
                        <TableCell className="text-center">{getScoreBadge(row.semester1)}</TableCell>
                        <TableCell className="text-center">{getScoreBadge(row.average)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={row.average >= 8 ? 'success' : row.average >= 6.5 ? 'gold' : 'secondary'}>
                            {row.average >= 8 ? 'Giỏi' : row.average >= 6.5 ? 'Khá' : 'TB'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
