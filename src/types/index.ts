// User types
export type UserRole = 'admin' | 'glv' | 'student';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  birthDate?: string;
  phone?: string;
  address?: string;
}

// Academic year
export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  classCount: number;
  studentCount: number;
}

// Class
export interface ClassInfo {
  id: string;
  name: string;
  academicYearId: string;
  academicYearName: string;
  description?: string;
  schedule?: string;
  catechists: User[];
  studentCount: number;
  createdAt: string;
}

// Student
export interface Student {
  id: string;
  studentId: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  phone?: string;
  parentPhone?: string;
  address?: string;
  classId: string;
  className: string;
  baptismName?: string;
  avatar?: string;
  enrollmentDate: string;
}

// Attendance
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  date: string;
  week: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  records: AttendanceRecord[];
}

// Mass attendance
export interface MassAttendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  attended: boolean;
  note?: string;
}

// Scores
export interface Score {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  type: 'presentation' | 'semester1' | 'semester2';
  score: number;
  maxScore: number;
  date: string;
  note?: string;
  gradedBy: string;
}

// Learning materials
export interface LearningMaterial {
  id: string;
  classId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'pdf';
  week?: number;
  uploadedBy: string;
  uploadedAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalCatechists: number;
  averageAttendance: number;
  todayAttendance?: number;
  upcomingEvents?: number;
}
