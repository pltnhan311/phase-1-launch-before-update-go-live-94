import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Loader2, Calendar } from 'lucide-react';
import { generateAttendanceReportCSV, downloadCSV, getWeeksInMonth } from '@/utils/csvUtils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExportAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: Array<{ id: string; name: string }>;
}

export function ExportAttendanceDialog({ 
  open, 
  onOpenChange, 
  classes 
}: ExportAttendanceDialogProps) {
  const currentDate = new Date();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentDate.getMonth()));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentDate.getFullYear()));
  const [isExporting, setIsExporting] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: format(new Date(2024, i), 'MMMM', { locale: vi })
  }));

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i;
    return { value: String(year), label: String(year) };
  });

  const handleExport = async () => {
    if (!selectedClassId) {
      toast.error('Vui lòng chọn lớp');
      return;
    }

    setIsExporting(true);
    try {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const sundays = getWeeksInMonth(year, month);
      
      // Get class info
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (!selectedClass) throw new Error('Class not found');

      // Get students in class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name, baptism_name')
        .eq('class_id', selectedClassId)
        .eq('is_active', true)
        .order('name');

      if (studentsError) throw studentsError;
      if (!students || students.length === 0) {
        toast.error('Lớp chưa có học viên');
        return;
      }

      // Get date range for the month
      const startDate = format(sundays[0], 'yyyy-MM-dd');
      const endDate = format(sundays[sundays.length - 1], 'yyyy-MM-dd');

      // Get attendance records
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('student_id, date, status')
        .eq('class_id', selectedClassId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (attendanceError) throw attendanceError;

      // Get mass attendance records
      const { data: massRecords, error: massError } = await supabase
        .from('mass_attendance')
        .select('student_id, date, attended')
        .in('student_id', students.map(s => s.id))
        .gte('date', startDate)
        .lte('date', endDate);

      if (massError) throw massError;

      // Generate CSV
      const csvContent = generateAttendanceReportCSV(
        students,
        attendanceRecords || [],
        massRecords || [],
        year,
        month,
        selectedClass.name
      );

      // Download file
      const fileName = `diem_danh_${selectedClass.name.replace(/\s+/g, '_')}_thang_${month + 1}_${year}.csv`;
      downloadCSV(csvContent, fileName);

      toast.success('Xuất báo cáo điểm danh thành công');
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất báo cáo');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Xuất báo cáo điểm danh
          </DialogTitle>
          <DialogDescription>
            Xuất bảng điểm danh Thánh lễ (TL) và Giáo lý (GL) theo tháng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn lớp *</label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tháng</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Năm</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Báo cáo sẽ bao gồm:
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Danh sách học viên (Tên Thánh, Họ và Tên)</li>
              <li>Cột TL (Thánh lễ) cho mỗi Chủ nhật</li>
              <li>Cột GL (Giáo lý) cho mỗi Chủ nhật</li>
              <li>Cột ĐIỂM cho mỗi tuần</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={!selectedClassId || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xuất báo cáo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
