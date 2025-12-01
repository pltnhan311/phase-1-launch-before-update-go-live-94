import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockDashboardStats, mockClasses, mockAttendanceSessions, mockStudents } from '@/data/mockData';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = mockDashboardStats;
  const recentSession = mockAttendanceSessions[0];

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
            value={stats.totalStudents}
            subtitle="Niên khóa 2024-2025"
            icon={Users}
            trend={{ value: 4.5, isPositive: true }}
          />
          <StatCard
            title="Số lớp"
            value={stats.totalClasses}
            subtitle="Đang hoạt động"
            icon={GraduationCap}
            variant="gold"
          />
          <StatCard
            title="Giáo lý viên"
            value={stats.totalCatechists}
            subtitle="Đang phụ trách"
            icon={UserCheck}
          />
          <StatCard
            title="Chuyên cần TB"
            value={`${stats.averageAttendance}%`}
            subtitle="Tuần này"
            icon={TrendingUp}
            trend={{ value: 2.1, isPositive: true }}
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
              <div className="space-y-4">
                {mockClasses.map((cls, index) => (
                  <div 
                    key={cls.id} 
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-custom-sm"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-display text-lg font-bold text-primary">
                        {cls.name.replace('Hiệp Sĩ ', 'HS')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">{cls.schedule}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{cls.studentCount} học viên</p>
                        <p className="text-xs text-muted-foreground">
                          {cls.catechists.map(c => c.name.split(' ').pop()).join(', ')}
                        </p>
                      </div>
                      <Badge variant="success">Đang học</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
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

            {/* Recent Attendance */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Điểm danh gần nhất</CardTitle>
                <CardDescription>
                  {recentSession.className} - Tuần {recentSession.week}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm">Có mặt</span>
                    </div>
                    <span className="font-medium text-success">{recentSession.presentCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Vắng</span>
                    </div>
                    <span className="font-medium text-destructive">{recentSession.absentCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm">Trễ</span>
                    </div>
                    <span className="font-medium text-warning-foreground">
                      {recentSession.records.filter(r => r.status === 'late').length}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tỷ lệ chuyên cần</span>
                      <span className="font-medium text-foreground">
                        {Math.round((recentSession.presentCount / recentSession.totalStudents) * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-success transition-all duration-500"
                        style={{ width: `${(recentSession.presentCount / recentSession.totalStudents) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Lịch học tuần này</CardTitle>
            <CardDescription>Chủ nhật, ngày 1 tháng 12 năm 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {mockClasses.map((cls) => (
                <div 
                  key={cls.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">{cls.schedule}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
