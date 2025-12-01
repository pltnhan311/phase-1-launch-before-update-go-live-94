import { 
  User, 
  AcademicYear, 
  ClassInfo, 
  Student, 
  AttendanceSession,
  Score,
  LearningMaterial,
  DashboardStats 
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'Admin Tổng Quản', email: 'admin@giaoxu.vn', role: 'admin' },
  { id: '2', name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', role: 'glv', phone: '0901234567' },
  { id: '3', name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', role: 'glv', phone: '0912345678' },
  { id: '4', name: 'Lê Minh Cường', email: 'cuong.le@gmail.com', role: 'glv', phone: '0923456789' },
  { id: '5', name: 'Phạm Thị Dung', email: 'dung.pham@gmail.com', role: 'glv', phone: '0934567890' },
];

// Mock Academic Years
export const mockAcademicYears: AcademicYear[] = [
  { 
    id: '1', 
    name: '2024-2025', 
    startDate: '2024-09-01', 
    endDate: '2025-06-30', 
    isActive: true,
    classCount: 4,
    studentCount: 120
  },
  { 
    id: '2', 
    name: '2023-2024', 
    startDate: '2023-09-01', 
    endDate: '2024-06-30', 
    isActive: false,
    classCount: 4,
    studentCount: 115
  },
];

// Mock Classes
export const mockClasses: ClassInfo[] = [
  {
    id: '1',
    name: 'Hiệp Sĩ 1',
    academicYearId: '1',
    academicYearName: '2024-2025',
    description: 'Lớp Hiệp Sĩ năm nhất',
    schedule: 'Chủ nhật, 8:00 - 9:30',
    catechists: [mockUsers[1], mockUsers[2]],
    studentCount: 30,
    createdAt: '2024-09-01'
  },
  {
    id: '2',
    name: 'Hiệp Sĩ 2',
    academicYearId: '1',
    academicYearName: '2024-2025',
    description: 'Lớp Hiệp Sĩ năm hai',
    schedule: 'Chủ nhật, 8:00 - 9:30',
    catechists: [mockUsers[3], mockUsers[4]],
    studentCount: 28,
    createdAt: '2024-09-01'
  },
  {
    id: '3',
    name: 'Hiệp Sĩ 3',
    academicYearId: '1',
    academicYearName: '2024-2025',
    description: 'Lớp Hiệp Sĩ năm ba',
    schedule: 'Chủ nhật, 9:45 - 11:15',
    catechists: [mockUsers[1], mockUsers[4]],
    studentCount: 32,
    createdAt: '2024-09-01'
  },
  {
    id: '4',
    name: 'Hiệp Sĩ 4',
    academicYearId: '1',
    academicYearName: '2024-2025',
    description: 'Lớp Hiệp Sĩ năm tư',
    schedule: 'Chủ nhật, 9:45 - 11:15',
    catechists: [mockUsers[2], mockUsers[3]],
    studentCount: 30,
    createdAt: '2024-09-01'
  },
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: '1',
    studentId: 'HS2024001',
    name: 'Nguyễn Hoàng Anh',
    birthDate: '2010-03-15',
    gender: 'male',
    phone: '0901111111',
    parentPhone: '0901111112',
    address: '123 Nguyễn Trãi, Q.1',
    classId: '1',
    className: 'Hiệp Sĩ 1',
    baptismName: 'Giuse',
    enrollmentDate: '2024-09-01'
  },
  {
    id: '2',
    studentId: 'HS2024002',
    name: 'Trần Thị Bảo Ngọc',
    birthDate: '2010-05-20',
    gender: 'female',
    phone: '0902222222',
    parentPhone: '0902222223',
    address: '456 Lê Lợi, Q.3',
    classId: '1',
    className: 'Hiệp Sĩ 1',
    baptismName: 'Maria',
    enrollmentDate: '2024-09-01'
  },
  {
    id: '3',
    studentId: 'HS2024003',
    name: 'Lê Minh Khang',
    birthDate: '2010-07-10',
    gender: 'male',
    phone: '0903333333',
    parentPhone: '0903333334',
    address: '789 Hai Bà Trưng, Q.5',
    classId: '1',
    className: 'Hiệp Sĩ 1',
    baptismName: 'Phêrô',
    enrollmentDate: '2024-09-01'
  },
  {
    id: '4',
    studentId: 'HS2024004',
    name: 'Phạm Thanh Tâm',
    birthDate: '2010-01-25',
    gender: 'female',
    phone: '0904444444',
    parentPhone: '0904444445',
    address: '321 CMT8, Q.10',
    classId: '1',
    className: 'Hiệp Sĩ 1',
    baptismName: 'Anna',
    enrollmentDate: '2024-09-01'
  },
  {
    id: '5',
    studentId: 'HS2024005',
    name: 'Võ Đức Huy',
    birthDate: '2010-11-08',
    gender: 'male',
    phone: '0905555555',
    parentPhone: '0905555556',
    address: '654 Võ Văn Tần, Q.3',
    classId: '1',
    className: 'Hiệp Sĩ 1',
    baptismName: 'Phaolô',
    enrollmentDate: '2024-09-01'
  },
  {
    id: '6',
    studentId: 'HS2024006',
    name: 'Đỗ Thị Mai',
    birthDate: '2009-04-12',
    gender: 'female',
    classId: '2',
    className: 'Hiệp Sĩ 2',
    baptismName: 'Têrêsa',
    enrollmentDate: '2023-09-01'
  },
  {
    id: '7',
    studentId: 'HS2024007',
    name: 'Hoàng Văn Dũng',
    birthDate: '2009-08-22',
    gender: 'male',
    classId: '2',
    className: 'Hiệp Sĩ 2',
    baptismName: 'Gioan',
    enrollmentDate: '2023-09-01'
  },
  {
    id: '8',
    studentId: 'HS2024008',
    name: 'Bùi Thị Hồng',
    birthDate: '2008-02-14',
    gender: 'female',
    classId: '3',
    className: 'Hiệp Sĩ 3',
    baptismName: 'Catarina',
    enrollmentDate: '2022-09-01'
  },
];

// Mock Attendance Sessions
export const mockAttendanceSessions: AttendanceSession[] = [
  {
    id: '1',
    classId: '1',
    className: 'Hiệp Sĩ 1',
    date: '2024-12-01',
    week: 12,
    totalStudents: 30,
    presentCount: 28,
    absentCount: 2,
    records: [
      { id: '1', studentId: '1', studentName: 'Nguyễn Hoàng Anh', classId: '1', date: '2024-12-01', status: 'present', recordedBy: 'GLV An', recordedAt: '2024-12-01T08:15:00' },
      { id: '2', studentId: '2', studentName: 'Trần Thị Bảo Ngọc', classId: '1', date: '2024-12-01', status: 'present', recordedBy: 'GLV An', recordedAt: '2024-12-01T08:15:00' },
      { id: '3', studentId: '3', studentName: 'Lê Minh Khang', classId: '1', date: '2024-12-01', status: 'absent', note: 'Bị ốm', recordedBy: 'GLV An', recordedAt: '2024-12-01T08:15:00' },
      { id: '4', studentId: '4', studentName: 'Phạm Thanh Tâm', classId: '1', date: '2024-12-01', status: 'present', recordedBy: 'GLV An', recordedAt: '2024-12-01T08:15:00' },
      { id: '5', studentId: '5', studentName: 'Võ Đức Huy', classId: '1', date: '2024-12-01', status: 'late', note: 'Trễ 15 phút', recordedBy: 'GLV An', recordedAt: '2024-12-01T08:15:00' },
    ]
  },
];

// Mock Scores
export const mockScores: Score[] = [
  { id: '1', studentId: '1', studentName: 'Nguyễn Hoàng Anh', classId: '1', type: 'presentation', score: 8.5, maxScore: 10, date: '2024-10-15', gradedBy: 'GLV An' },
  { id: '2', studentId: '2', studentName: 'Trần Thị Bảo Ngọc', classId: '1', type: 'presentation', score: 9.0, maxScore: 10, date: '2024-10-15', gradedBy: 'GLV An' },
  { id: '3', studentId: '3', studentName: 'Lê Minh Khang', classId: '1', type: 'presentation', score: 7.5, maxScore: 10, date: '2024-10-15', gradedBy: 'GLV An' },
  { id: '4', studentId: '1', studentName: 'Nguyễn Hoàng Anh', classId: '1', type: 'semester1', score: 8.0, maxScore: 10, date: '2024-11-30', gradedBy: 'GLV An' },
  { id: '5', studentId: '2', studentName: 'Trần Thị Bảo Ngọc', classId: '1', type: 'semester1', score: 9.5, maxScore: 10, date: '2024-11-30', gradedBy: 'GLV An' },
];

// Mock Learning Materials
export const mockMaterials: LearningMaterial[] = [
  {
    id: '1',
    classId: '1',
    title: 'Bài 1: Thiên Chúa là Cha',
    description: 'Giới thiệu về Thiên Chúa là Cha yêu thương',
    fileUrl: '/materials/bai-1.pdf',
    fileType: 'pdf',
    week: 1,
    uploadedBy: 'GLV An',
    uploadedAt: '2024-09-01T10:00:00'
  },
  {
    id: '2',
    classId: '1',
    title: 'Bài 2: Đức Giêsu là Con Thiên Chúa',
    description: 'Tìm hiểu về Đức Giêsu Kitô',
    fileUrl: '/materials/bai-2.pdf',
    fileType: 'pdf',
    week: 2,
    uploadedBy: 'GLV An',
    uploadedAt: '2024-09-08T10:00:00'
  },
  {
    id: '3',
    classId: '1',
    title: 'Bài 3: Chúa Thánh Thần',
    description: 'Tìm hiểu về Chúa Thánh Thần',
    fileUrl: '/materials/bai-3.pdf',
    fileType: 'pdf',
    week: 3,
    uploadedBy: 'GLV An',
    uploadedAt: '2024-09-15T10:00:00'
  },
];

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalStudents: 120,
  totalClasses: 4,
  totalCatechists: 4,
  averageAttendance: 93.5,
  todayAttendance: 112,
  upcomingEvents: 3
};
