import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, Loader2, Copy, Check, StopCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, isSunday, previousSunday, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AttendanceSessionManagerProps {
  classId: string;
  className: string;
}

export function AttendanceSessionManager({ classId, className }: AttendanceSessionManagerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Get active session for this class
  const { data: activeSession, isLoading } = useQuery({
    queryKey: ['attendance-session', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Generate random 6-digit code
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Helper to get the nearest past Sunday (or today if it's Sunday)
  const getNearestSunday = () => {
    const today = startOfDay(new Date());
    if (isSunday(today)) {
      return format(today, 'yyyy-MM-dd');
    }
    return format(previousSunday(today), 'yyyy-MM-dd');
  };

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const code = generateCode();
      const sessionDate = getNearestSunday();

      console.log('Creating session with:', { classId, date: sessionDate, code });

      // First, deactivate any existing active sessions for this class
      await supabase
        .from('attendance_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('class_id', classId)
        .eq('is_active', true);

      const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
          class_id: classId,
          date: sessionDate,
          check_in_code: code,
          is_active: true,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      console.log('Session created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-session', classId] });
      toast.success('Đã mở phiên điểm danh!');
    },
    onError: (error) => {
      console.error('Error starting session:', error);
      toast.error('Không thể mở phiên điểm danh');
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('attendance_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-session', classId] });
      toast.success('Đã đóng phiên điểm danh');
    },
    onError: (error) => {
      console.error('Error ending session:', error);
      toast.error('Không thể đóng phiên điểm danh');
    },
  });

  const handleCopyCode = () => {
    if (activeSession?.check_in_code) {
      navigator.clipboard.writeText(activeSession.check_in_code);
      setCopied(true);
      toast.success('Đã sao chép mã điểm danh');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (activeSession) {
    return (
      <Card variant="gold">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Phiên điểm danh đang mở
              </CardTitle>
              <CardDescription>
                {className} - {format(new Date(activeSession.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
              </CardDescription>
            </div>
            <Badge className="bg-green-500">Đang hoạt động</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-background rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Mã điểm danh</p>
              <p className="text-5xl font-bold tracking-[0.5em] text-primary">
                {activeSession.check_in_code}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyCode}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Sao chép mã
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => endSessionMutation.mutate(activeSession.id)}
              disabled={endSessionMutation.isPending}
            >
              {endSessionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Đóng phiên
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Học viên nhập mã này trong app để điểm danh
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Điểm danh học viên
        </CardTitle>
        <CardDescription>
          Mở phiên điểm danh để học viên tự check-in bằng mã
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="gold"
          className="w-full"
          onClick={() => startSessionMutation.mutate()}
          disabled={startSessionMutation.isPending}
        >
          {startSessionMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang mở...
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4 mr-2" />
              Mở phiên điểm danh
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
