export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'Trưởng nhóm' | 'Thành viên' | 'Quản lý dự án' | 'Thiết kế' | 'Lập trình viên';
  avatar: string;
  status?: 'online' | 'offline' | 'busy';
  department?: string;
  joinedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  tag?: 'Góp ý' | 'Đã duyệt' | 'Cần chỉnh sửa' | 'Hỏi đáp';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  assigneeAvatar: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  status: TaskStatus;
  priority: TaskPriority;
  reportLink: string; // Link báo cáo kết quả công việc
  reportNote?: string; // Ghi chú kết quả nghiệm thu
  reportSubmittedAt?: string;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  department: string;
  invitedBy: string;
  invitedByName: string;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
}
