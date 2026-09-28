import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { Task, User, TaskComment, Invitation } from '../types';

// Default mock initial data to seed Firebase if empty
export const INITIAL_MEMBERS: User[] = [
  {
    id: 'user-1',
    displayName: 'Nguyễn Thảo Vy',
    email: 'thaovy@congviec.vn',
    role: 'Trưởng nhóm',
    department: 'Ban Quản Trị',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedAt: '2026-01-10'
  },
  {
    id: 'user-2',
    displayName: 'Trần Minh Khang',
    email: 'minhkhang@congviec.vn',
    role: 'Thiết kế',
    department: 'UI/UX Design',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedAt: '2026-01-15'
  },
  {
    id: 'user-3',
    displayName: 'Lê Hoàng Nam',
    email: 'hoangnam@congviec.vn',
    role: 'Lập trình viên',
    department: 'Kỹ Thuật Công Nghệ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'busy',
    joinedAt: '2026-02-01'
  },
  {
    id: 'user-4',
    displayName: 'Phạm Phương Linh',
    email: 'phuonglinh@congviec.vn',
    role: 'Quản lý dự án',
    department: 'Vận Hành',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedAt: '2026-02-12'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Thiết kế giao diện Design System tone Hồng & Xanh',
    description: 'Xây dựng bộ thư viện UI Components, typography và bảng màu chuẩn thương hiệu kết hợp giữa sắc hồng cá tính và xanh dương hiện đại.',
    assigneeId: 'user-2',
    assigneeName: 'Trần Minh Khang',
    assigneeEmail: 'minhkhang@congviec.vn',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    startDate: '2026-09-01',
    dueDate: '2026-09-18',
    status: 'review',
    priority: 'high',
    reportLink: 'https://www.figma.com/file/demo-pink-blue-system',
    reportNote: 'Đã hoàn thành toàn bộ 42 master component trên Figma, mời team review và để lại nhận xét!',
    reportSubmittedAt: '2026-09-12T14:30:00Z',
    createdById: 'user-1',
    createdByName: 'Nguyễn Thảo Vy',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-12T14:30:00Z',
    commentCount: 3
  },
  {
    id: 'task-2',
    title: 'Phát triển module Quản lý Thành viên & Mời người dùng',
    description: 'Tạo luồng đăng ký tài khoản, sinh link mời thành viên và quản lý phân quyền theo phòng ban dự án.',
    assigneeId: 'user-3',
    assigneeName: 'Lê Hoàng Nam',
    assigneeEmail: 'hoangnam@congviec.vn',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    startDate: '2026-09-05',
    dueDate: '2026-09-20',
    status: 'in_progress',
    priority: 'urgent',
    reportLink: 'https://github.com/team-project/member-management-pull-24',
    reportNote: 'Đã deploy bản preview lên staging, code đã tối ưu hóa realtime Firestore sync.',
    reportSubmittedAt: '2026-09-11T16:00:00Z',
    createdById: 'user-1',
    createdByName: 'Nguyễn Thảo Vy',
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-11T16:00:00Z',
    commentCount: 2
  },
  {
    id: 'task-3',
    title: 'Kế hoạch triển khai kiểm thử và nghiệm thu dự án Q3',
    description: 'Chuẩn bị kịch bản kiểm thử UAT, lập checklist các tiêu chuẩn bàn giao nghiệm thu đầu việc và tài liệu hướng dẫn.',
    assigneeId: 'user-4',
    assigneeName: 'Phạm Phương Linh',
    assigneeEmail: 'phuonglinh@congviec.vn',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    startDate: '2026-09-10',
    dueDate: '2026-09-25',
    status: 'todo',
    priority: 'medium',
    reportLink: '',
    reportNote: '',
    createdById: 'user-1',
    createdByName: 'Nguyễn Thảo Vy',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
    commentCount: 0
  },
  {
    id: 'task-4',
    title: 'Báo cáo tổng kết tuần & Phân tích hiệu suất hoàn thành',
    description: 'Tổng hợp số lượng task đúng hạn, tỷ lệ nghiệm thu qua link báo cáo và phản hồi của ban quản trị.',
    assigneeId: 'user-1',
    assigneeName: 'Nguyễn Thảo Vy',
    assigneeEmail: 'thaovy@congviec.vn',
    assigneeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    startDate: '2026-09-02',
    dueDate: '2026-09-09',
    status: 'done',
    priority: 'medium',
    reportLink: 'https://docs.google.com/spreadsheets/d/demo-weekly-report',
    reportNote: 'Bảng số liệu chi tiết đã được cập nhật đầy đủ, đạt 94% mục tiêu đề ra.',
    reportSubmittedAt: '2026-09-09T17:00:00Z',
    createdById: 'user-1',
    createdByName: 'Nguyễn Thảo Vy',
    createdAt: '2026-09-02T08:00:00Z',
    updatedAt: '2026-09-09T17:00:00Z',
    commentCount: 1
  }
];

export const INITIAL_COMMENTS: TaskComment[] = [
  {
    id: 'comment-1',
    taskId: 'task-1',
    authorId: 'user-1',
    authorName: 'Nguyễn Thảo Vy',
    authorEmail: 'thaovy@congviec.vn',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    content: 'Màu hồng phối xanh dương này nhìn rất bắt mắt và trẻ trung! Các nút bấm và thẻ việc có độ tương phản cao, rất dễ nhìn.',
    tag: 'Đã duyệt',
    createdAt: '2026-09-12T15:10:00Z'
  },
  {
    id: 'comment-2',
    taskId: 'task-1',
    authorId: 'user-3',
    authorName: 'Lê Hoàng Nam',
    authorEmail: 'hoangnam@congviec.vn',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    content: 'Em đã xem qua Figma, phần hover card và shadow hồng nhạt rất hợp lý. Em sẽ code theo đúng spec này trong frontend.',
    tag: 'Góp ý',
    createdAt: '2026-09-12T16:05:00Z'
  },
  {
    id: 'comment-3',
    taskId: 'task-1',
    authorId: 'user-4',
    authorName: 'Phạm Phương Linh',
    authorEmail: 'phuonglinh@congviec.vn',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Đồng ý nghiệm thu! Đề nghị Khang xuất file token màu CSS để Nam tích hợp vào dự án luôn nhé.',
    tag: 'Đã duyệt',
    createdAt: '2026-09-12T17:20:00Z'
  },
  {
    id: 'comment-4',
    taskId: 'task-2',
    authorId: 'user-1',
    authorName: 'Nguyễn Thảo Vy',
    authorEmail: 'thaovy@congviec.vn',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    content: 'Đã test thử luồng mời qua email và tạo link, hoạt động rất nhanh. Hãy thêm thông báo khi copy link thành công nhé.',
    tag: 'Góp ý',
    createdAt: '2026-09-12T09:15:00Z'
  }
];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv-1',
    email: 'nguyenhuong@congviec.vn',
    role: 'Thiết kế',
    department: 'UI/UX Design',
    invitedBy: 'user-1',
    invitedByName: 'Nguyễn Thảo Vy',
    inviteCode: 'JOIN-PINKBLUE-2026',
    status: 'pending',
    createdAt: '2026-09-13T10:00:00Z'
  }
];

// Helper to seed Firebase Firestore collections if empty
let isSeeding = false;
export async function seedInitialDataIfNeeded() {
  if (isSeeding) return;
  isSeeding = true;
  try {
    const tasksCol = collection(db, 'tasks');
    const taskSnap = await getDocs(tasksCol);
    if (taskSnap.empty) {
      for (const t of INITIAL_TASKS) {
        await setDoc(doc(db, 'tasks', t.id), t);
      }
    }

    const membersCol = collection(db, 'users');
    const memberSnap = await getDocs(membersCol);
    if (memberSnap.empty) {
      for (const m of INITIAL_MEMBERS) {
        await setDoc(doc(db, 'users', m.id), m);
      }
    }

    const commentsCol = collection(db, 'comments');
    const commentSnap = await getDocs(commentsCol);
    if (commentSnap.empty) {
      for (const c of INITIAL_COMMENTS) {
        await setDoc(doc(db, 'comments', c.id), c);
      }
    }

    const invitesCol = collection(db, 'invitations');
    const inviteSnap = await getDocs(invitesCol);
    if (inviteSnap.empty) {
      for (const inv of INITIAL_INVITATIONS) {
        await setDoc(doc(db, 'invitations', inv.id), inv);
      }
    }
  } catch (err) {
    console.warn('Initial seeding note (will use local state fallback if offline):', err);
  } finally {
    isSeeding = false;
  }
}

// Subscriptions
export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  const q = collection(db, 'tasks');
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialDataIfNeeded().then(() => {
          callback(INITIAL_TASKS);
        });
        return;
      }
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      // Sort tasks by updated date descending
      tasks.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      callback(tasks);
    },
    (error) => {
      console.warn('Firestore tasks listen fallback:', error);
      callback(INITIAL_TASKS);
    }
  );
}

export function subscribeToMembers(callback: (members: User[]) => void) {
  const q = collection(db, 'users');
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialDataIfNeeded().then(() => {
          callback(INITIAL_MEMBERS);
        });
        return;
      }
      const members: User[] = [];
      snapshot.forEach((docSnap) => {
        members.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      callback(members);
    },
    (error) => {
      console.warn('Firestore users listen fallback:', error);
      callback(INITIAL_MEMBERS);
    }
  );
}

export function subscribeToComments(taskId: string, callback: (comments: TaskComment[]) => void) {
  const q = query(collection(db, 'comments'), where('taskId', '==', taskId));
  return onSnapshot(
    q,
    (snapshot) => {
      const comments: TaskComment[] = [];
      snapshot.forEach((docSnap) => {
        comments.push({ id: docSnap.id, ...docSnap.data() } as TaskComment);
      });
      comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(comments);
    },
    (error) => {
      console.warn('Firestore comments listen fallback:', error);
      const filtered = INITIAL_COMMENTS.filter((c) => c.taskId === taskId);
      callback(filtered);
    }
  );
}

export function subscribeToAllComments(callback: (comments: TaskComment[]) => void) {
  const q = collection(db, 'comments');
  return onSnapshot(
    q,
    (snapshot) => {
      const comments: TaskComment[] = [];
      snapshot.forEach((docSnap) => {
        comments.push({ id: docSnap.id, ...docSnap.data() } as TaskComment);
      });
      comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(comments);
    },
    (error) => {
      console.warn('Firestore all comments listen fallback:', error);
      callback(INITIAL_COMMENTS);
    }
  );
}

export function subscribeToInvitations(callback: (invitations: Invitation[]) => void) {
  const q = collection(db, 'invitations');
  return onSnapshot(
    q,
    (snapshot) => {
      const invites: Invitation[] = [];
      snapshot.forEach((docSnap) => {
        invites.push({ id: docSnap.id, ...docSnap.data() } as Invitation);
      });
      invites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(invites);
    },
    (error) => {
      console.warn('Firestore invitations listen fallback:', error);
      callback(INITIAL_INVITATIONS);
    }
  );
}

// Actions
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  const newTask = {
    ...taskData,
    createdAt: now,
    updatedAt: now,
    commentCount: 0
  };
  const docRef = await addDoc(collection(db, 'tasks'), newTask);
  return docRef.id;
}

export async function updateTask(taskId: string, data: Partial<Task>): Promise<void> {
  const ref = doc(db, 'tasks', taskId);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  const ref = doc(db, 'tasks', taskId);
  await deleteDoc(ref);
}

export async function addComment(commentData: Omit<TaskComment, 'id' | 'createdAt'>): Promise<string> {
  const now = new Date().toISOString();
  const newComment = {
    ...commentData,
    createdAt: now
  };
  const docRef = await addDoc(collection(db, 'comments'), newComment);

  // Update task's comment count & updated time
  try {
    const taskRef = doc(db, 'tasks', commentData.taskId);
    await updateDoc(taskRef, {
      updatedAt: now
    });
  } catch (err) {
    console.warn('Update task comment count note:', err);
  }

  return docRef.id;
}

export async function deleteComment(commentId: string): Promise<void> {
  const ref = doc(db, 'comments', commentId);
  await deleteDoc(ref);
}

export async function registerMember(memberData: Omit<User, 'id' | 'joinedAt'>): Promise<User> {
  const id = 'user-' + Date.now();
  const joinedAt = new Date().toISOString().split('T')[0];
  const newUser: User = {
    id,
    ...memberData,
    joinedAt,
    status: 'online'
  };
  await setDoc(doc(db, 'users', id), newUser);
  return newUser;
}

export async function createInvitation(invData: {
  email: string;
  role: string;
  department: string;
  invitedBy: string;
  invitedByName: string;
}): Promise<Invitation> {
  const id = 'inv-' + Date.now();
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newInv: Invitation = {
    id,
    ...invData,
    inviteCode: `JOIN-${randomCode}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'invitations', id), newInv);
  return newInv;
}

export async function cancelInvitation(inviteId: string): Promise<void> {
  await deleteDoc(doc(db, 'invitations', inviteId));
}
