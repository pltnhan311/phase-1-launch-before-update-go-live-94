import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentCheckInProps {
  studentId: string;
  classId: string;
}

export function StudentCheckIn({ studentId, classId }: StudentCheckInProps) {
  const { user } = useAuth();
  const [code, setCode] = useState('');

  // Check if already checked in today
  const { data: todayRecord, refetch: refetchRecord } = useQuery({
    queryKey: ['today-attendance', studentId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (inputCode: string) => {
      const today = new Date().toISOString().split('T')[0];

      // Find active session with matching code
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('class_id', classId)
        .eq('check_in_code', inputCode)
        .eq('is_active', true)
        .eq('date', today)
        .maybeSingle();

      if (sessionError) throw sessionError;
      if (!session) {
        throw new Error('Mã điểm danh không hợp lệ hoặc đã hết hạn');
      }

      // Check if already checked in
      const { data: existing } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', today)
        .eq('class_id', classId)
        .maybeSingle();

      if (existing) {
        throw new Error('Bạn đã điểm danh hôm nay rồi');
      }

      // Create attendance record
      const { error: insertError } = await supabase
        .from('attendance_records')
        .insert({
          student_id: studentId,
          class_id: classId,
          date: today,
          status: 'present',
          recorded_by: user?.id,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success('Điểm danh thành công!');
      setCode('');
      refetchRecord();
    },
    onError: (error) => {
      console.error('Check-in error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể điểm danh');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số');
      return;
    }
    checkInMutation.mutate(code);
  };

  if (todayRecord) {
    return (
      <Card variant="elevated" className="border-success/50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
          <h3 className="text-lg font-semibold text-success">Đã điểm danh hôm nay</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Trạng thái: {todayRecord.status === 'present' ? 'Có mặt' : todayRecord.status === 'late' ? 'Đi trễ' : todayRecord.status}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Điểm danh
        </CardTitle>
        <CardDescription>
          Nhập mã 6 số từ Giáo lý viên để điểm danh. 
          Mã này được tạo khi GLV mở phiên điểm danh trong hệ thống và hiển thị trên màn hình của GLV.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Nhập mã 6 số..."
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
            disabled={checkInMutation.isPending}
          />
          <Button 
            type="submit" 
            className="w-full" 
            variant="gold"
            disabled={code.length !== 6 || checkInMutation.isPending}
          >
            {checkInMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Điểm danh'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
