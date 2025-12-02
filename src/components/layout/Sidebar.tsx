import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Users,
  ClipboardCheck,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
  UserCheck,
  Home,
  Shield
} from 'lucide-react';

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Tổng quan', 
    path: '/dashboard',
    roles: ['admin', 'glv']
  },
  { 
    icon: CalendarDays, 
    label: 'Niên khóa', 
    path: '/academic-years',
    roles: ['admin']
  },
  { 
    icon: GraduationCap, 
    label: 'Lớp học', 
    path: '/classes',
    roles: ['admin', 'glv']
  },
  { 
    icon: UserCheck, 
    label: 'Giáo lý viên', 
    path: '/catechists',
    roles: ['admin']
  },
  { 
    icon: Users, 
    label: 'Học viên', 
    path: '/students',
    roles: ['admin', 'glv']
  },
  { 
    icon: ClipboardCheck, 
    label: 'Điểm danh', 
    path: '/attendance',
    roles: ['admin', 'glv']
  },
  { 
    icon: Star, 
    label: 'Điểm số', 
    path: '/scores',
    roles: ['admin', 'glv']
  },
  { 
    icon: BookOpen, 
    label: 'Tài liệu', 
    path: '/materials',
    roles: ['admin', 'glv']
  },
  { 
    icon: BarChart3, 
    label: 'Báo cáo', 
    path: '/reports',
    roles: ['admin']
  },
  { 
    icon: Shield, 
    label: 'Người dùng', 
    path: '/users',
    roles: ['admin']
  },
  { 
    icon: Settings, 
    label: 'Cài đặt', 
    path: '/settings',
    roles: ['admin']
  },
  // Student menu items
  { 
    icon: Home, 
    label: 'Trang chủ', 
    path: '/student',
    roles: ['student']
  },
  { 
    icon: BookOpen, 
    label: 'Tài liệu', 
    path: '/student/materials',
    roles: ['student']
  },
  { 
    icon: ClipboardCheck, 
    label: 'Điểm danh', 
    path: '/student/attendance',
    roles: ['student']
  },
  { 
    icon: Star, 
    label: 'Điểm số', 
    path: '/student/scores',
    roles: ['student']
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut, hasRole, userRole } = useAuth();

  const filteredMenu = menuItems.filter(item => 
    hasRole(item.roles as any[])
  );

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Người dùng';
  const roleLabel = userRole === 'admin' ? 'Quản trị viên' : userRole === 'glv' ? 'Giáo lý viên' : 'Học viên';

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 hidden md:block",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link to={userRole === 'student' ? '/student' : '/dashboard'} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-gold">
              <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-sidebar-foreground">
                Giáo Lý
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Xóm Chiếu
              </span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg gradient-gold">
            <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-primary" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        {!collapsed && user && (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-sidebar-foreground/60 capitalize">
                {roleLabel}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={signOut}
            className="flex-1 justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Đăng xuất</span>}
          </Button>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md transition-colors hover:bg-sidebar-accent"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
