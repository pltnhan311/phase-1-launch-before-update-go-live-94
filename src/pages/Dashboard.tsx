import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useCatechists } from '@/hooks/useCatechists';
import { useActiveAcademicYear } from '@/hooks/useAcademicYears';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: catechists, isLoading: catechistsLoading } = useCatechists();
  const { data: activeYear, isLoading: yearLoading } = useActiveAcademicYear();

  const isLoading = classesLoading || studentsLoading || catechistsLoading || yearLoading;

  const stats = {
    totalStudents: students?.length || 0,
    totalClasses: classes?.length || 0,
    totalCatechists: catechists?.length || 0,
  };

  return (
    <MainLayout 
      title="Tổng quan" 
      subtitle="Chào mừng quay trở lại! Đây là tình hình hôm nay."
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng học viên"
            value={isLoading ? '-' : stats.totalStudents}
            subtitle={activeYear?.name || 'Chưa có niên khóa'}
            icon={Users}
          />
          <StatCard
            title="Số lớp"
            value={isLoading ? '-' : stats.totalClasses}
            subtitle="Đang hoạt động"
            icon={GraduationCap}
            variant="gold"
          />
          <StatCard
            title="Giáo lý viên"
            value={isLoading ? '-' : stats.totalCatechists}
            subtitle="Đang phụ trách"
            icon={UserCheck}
          />
          <StatCard
            title="Chuyên cần TB"
            value="-"
            subtitle="Cần dữ liệu điểm danh"
            icon={TrendingUp}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Classes Overview */}
          <Card variant="elevated" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh sách lớp</CardTitle>
                <CardDescription>Các lớp trong niên khóa hiện tại</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/classes">
                  Xem tất cả
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : classes && classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.slice(0, 5).map((cls, index) => (
                    <div 
                      key={cls.id} 
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-custom-sm"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                          {cls.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{cls.name}</p>
                          <p className="text-sm text-muted-foreground">{cls.schedule || 'Chưa xếp lịch'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {cls.students?.[0]?.count || 0} học viên
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cls.class_catechists?.map(cc => cc.catechists?.name?.split(' ').pop()).join(', ') || 'Chưa gán GLV'}
                          </p>
                        </div>
                        <Badge variant="success">Đang học</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Database className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Chưa có lớp học nào</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/classes">Tạo lớp đầu tiên</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card variant="gold">
              <CardHeader>
                <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="default" className="w-full justify-start" asChild>
                  <Link to="/attendance">
                    <Clock className="mr-2 h-4 w-4" />
                    Điểm danh hôm nay
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/students">
                    <Users className="mr-2 h-4 w-4" />
                    Xem danh sách học viên
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/scores">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Nhập điểm
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Bắt đầu</CardTitle>
                <CardDescription>Các bước thiết lập hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${activeYear ? 'bg-success' : 'bg-muted'}`} />
                  <span className={`text-sm ${activeYear ? 'text-foreground' : 'text-muted-foreground'}`}>
                    1. Tạo niên khóa
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${classes && classes.length > 0 ? 'bg-success' : 'bg-muted'}`} />
                  <span className={`text-sm ${classes && classes.length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    2. Tạo lớp học
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${catechists && catechists.length > 0 ? 'bg-success' : 'bg-muted'}`} />
                  <span className={`text-sm ${catechists && catechists.length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    3. Thêm giáo lý viên
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${students && students.length > 0 ? 'bg-success' : 'bg-muted'}`} />
                  <span className={`text-sm ${students && students.length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    4. Thêm học viên
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Lịch học tuần này</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : classes && classes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {classes.map((cls) => (
                  <div 
                    key={cls.id}
                    className="flex items-center gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">{cls.schedule || 'Chưa xếp lịch'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Chưa có lớp học nào được tạo
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
