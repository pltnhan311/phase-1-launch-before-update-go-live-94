import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { Star, Save, TrendingUp, Award, BookOpen, Loader2, Database, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ScoreEntry {
  studentId: string;
  studentName: string;
  presentation: number | null;
  semester1: number | null;
  semester2: number | null;
}

export default function Scores() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [scoreType, setScoreType] = useState<'presentation' | 'semester1' | 'semester2'>('presentation');
  const [isEditing, setIsEditing] = useState(false);

  const { data: students, isLoading: studentsLoading } = useStudents(selectedClass || undefined);

  const classStudents = students || [];
  const selectedClassInfo = classes?.find(c => c.id === selectedClass);

  const [scores, setScores] = useState<ScoreEntry[]>([]);

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setIsEditing(false);
  };

  const startEditing = () => {
    if (!classStudents.length) return;
    setScores(
      classStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        presentation: null,
        semester1: null,
        semester2: null,
      }))
    );
    setIsEditing(true);
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== null && (numValue < 0 || numValue > 10)) {
      toast.error('Điểm phải từ 0 đến 10');
      return;
    }

    setScores(scores =>
      scores.map(s =>
        s.studentId === studentId
          ? { ...s, [scoreType]: numValue }
          : s
      )
    );
  };

  const handleSaveScores = () => {
    toast.success('Lưu điểm thành công!');
    setIsEditing(false);
  };

  const getScoreLabel = (type: typeof scoreType) => {
    switch (type) {
      case 'presentation':
        return 'Thuyết trình';
      case 'semester1':
        return 'Học kỳ 1';
      case 'semester2':
        return 'Học kỳ 2';
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">Chưa có</Badge>;
    if (score >= 8) return <Badge variant="success">{score}</Badge>;
    if (score >= 6.5) return <Badge variant="gold">{score}</Badge>;
    if (score >= 5) return <Badge variant="warning">{score}</Badge>;
    return <Badge variant="destructive">{score}</Badge>;
  };

  const isLoading = classesLoading || studentsLoading;

  return (
    <MainLayout 
      title="Quản lý Điểm số" 
      subtitle="Nhập và quản lý điểm thuyết trình, học kỳ"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ĐTB Thuyết trình</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ĐTB Học kỳ 1</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="gold">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Award className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Học viên giỏi</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selection */}
        <Card variant="flat" className="border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="space-y-2 flex-1 max-w-xs">
                <label className="text-sm font-medium">Chọn lớp</label>
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp để nhập điểm" />
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
                <label className="text-sm font-medium">Loại điểm</label>
                <Select value={scoreType} onValueChange={(v: typeof scoreType) => setScoreType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presentation">Điểm thuyết trình</SelectItem>
                    <SelectItem value="semester1">Điểm học kỳ 1</SelectItem>
                    <SelectItem value="semester2">Điểm học kỳ 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedClass && classStudents.length > 0 && (
                <>
                  <Button 
                    variant={isEditing ? 'outline' : 'gold'}
                    onClick={() => isEditing ? setIsEditing(false) : startEditing()}
                  >
                    {isEditing ? 'Hủy' : 'Nhập điểm'}
                  </Button>
                  {isEditing && (
                    <Button variant="success" onClick={handleSaveScores}>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu điểm
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scores Table */}
        {!selectedClass ? (
          <Card variant="flat" className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chọn lớp để nhập điểm</h3>
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
                Vui lòng thêm học viên vào lớp trước khi nhập điểm
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Bảng điểm - {selectedClassInfo?.name}
              </CardTitle>
              <CardDescription>
                {isEditing ? `Đang nhập ${getScoreLabel(scoreType)}` : 'Xem điểm tổng hợp'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">STT</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead className="text-center">Thuyết trình</TableHead>
                    <TableHead className="text-center">HK1</TableHead>
                    <TableHead className="text-center">HK2</TableHead>
                    <TableHead className="text-center">ĐTB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isEditing ? scores : classStudents.map(s => ({ studentId: s.id, studentName: s.name, presentation: null, semester1: null, semester2: null }))).map((entry, index) => (
                    <TableRow key={entry.studentId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{entry.studentName}</TableCell>
                      <TableCell className="text-center">
                        {isEditing && scoreType === 'presentation' ? (
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className="w-20 mx-auto text-center"
                            value={entry.presentation ?? ''}
                            onChange={(e) => handleScoreChange(entry.studentId, e.target.value)}
                          />
                        ) : (
                          getScoreBadge(entry.presentation)
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing && scoreType === 'semester1' ? (
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className="w-20 mx-auto text-center"
                            value={entry.semester1 ?? ''}
                            onChange={(e) => handleScoreChange(entry.studentId, e.target.value)}
                          />
                        ) : (
                          getScoreBadge(entry.semester1)
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing && scoreType === 'semester2' ? (
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className="w-20 mx-auto text-center"
                            value={entry.semester2 ?? ''}
                            onChange={(e) => handleScoreChange(entry.studentId, e.target.value)}
                          />
                        ) : (
                          getScoreBadge(entry.semester2)
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getScoreBadge(null)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
