import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { GraduationCap, User, KeyRound, Calendar, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginStudent } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin/GLV login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Student login
  const [studentId, setStudentId] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        toast.error('Email hoặc mật khẩu không đúng');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await loginStudent(studentId, birthDate);
      if (success) {
        toast.success('Đăng nhập thành công!');
        navigate('/student');
      } else {
        toast.error('Mã học viên hoặc ngày sinh không đúng');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        
        <div className="relative z-10 text-center animate-fade-in">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl gradient-gold shadow-gold">
            <GraduationCap className="h-14 w-14 text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-4">
            Quản Lý Giáo Lý
          </h1>
          <p className="text-xl text-primary-foreground/80 mb-2">
            Ngành Hiệp Sĩ
          </p>
          <p className="text-primary-foreground/60">
            Giáo xứ Xóm Chiếu
          </p>
          
          <div className="mt-12 space-y-4 text-left text-primary-foreground/70">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Quản lý học viên và giáo lý viên</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Điểm danh và theo dõi chuyên cần</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Quản lý điểm số và tài liệu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl gradient-gold shadow-gold">
              <GraduationCap className="h-9 w-9 text-accent-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Quản Lý Giáo Lý
            </h1>
          </div>

          <Card variant="elevated" className="border-0 shadow-custom-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
              <CardDescription className="text-center">
                Chọn phương thức đăng nhập phù hợp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="admin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="admin">GLV / Admin</TabsTrigger>
                  <TabsTrigger value="student">Học viên</TabsTrigger>
                </TabsList>
                
                <TabsContent value="admin">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang đăng nhập...
                        </>
                      ) : (
                        'Đăng nhập'
                      )}
                    </Button>
                  </form>
                  
                  <div className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Demo:</p>
                    <p>Email: admin@giaoxu.vn</p>
                    <p>Mật khẩu: 123456</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="student">
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Mã học viên</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="studentId"
                          placeholder="VD: HS2024001"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Ngày sinh</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="birthDate"
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang đăng nhập...
                        </>
                      ) : (
                        'Đăng nhập'
                      )}
                    </Button>
                  </form>
                  
                  <div className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Demo:</p>
                    <p>Mã HV: HS2024001</p>
                    <p>Ngày sinh: 2010-03-15</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            © 2024 Giáo xứ Xóm Chiếu. Ngành Hiệp Sĩ.
          </p>
        </div>
      </div>
    </div>
  );
}
