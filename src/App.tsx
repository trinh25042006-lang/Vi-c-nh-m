/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TaskBoardView } from './components/TaskBoardView';
import { MembersView } from './components/MembersView';
import { ReportsView } from './components/ReportsView';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { InviteModal } from './components/InviteModal';
import { RegisterModal } from './components/RegisterModal';
import {
  Task,
  User,
  TaskComment,
  Invitation,
  TaskStatus
} from './types';
import {
  subscribeToTasks,
  subscribeToMembers,
  subscribeToAllComments,
  subscribeToInvitations,
  createTask,
  updateTask,
  deleteTask,
  registerMember,
  createInvitation,
  cancelInvitation,
  INITIAL_MEMBERS,
  INITIAL_TASKS
} from './services/dataService';
import { Menu, X, CheckCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'reports' | 'members'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [members, setMembers] = useState<User[]>(INITIAL_MEMBERS);
  const [allComments, setAllComments] = useState<TaskComment[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_MEMBERS[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Firebase Realtime Subscriptions
  useEffect(() => {
    const unsubTasks = subscribeToTasks((loadedTasks) => {
      setTasks(loadedTasks);
    });

    const unsubMembers = subscribeToMembers((loadedMembers) => {
      setMembers(loadedMembers);
      // If current user is not in the list, keep or update
      if (loadedMembers.length > 0 && !loadedMembers.some((m) => m.id === currentUser.id)) {
        setCurrentUser(loadedMembers[0]);
      }
    });

    const unsubComments = subscribeToAllComments((loadedComments) => {
      setAllComments(loadedComments);
    });

    const unsubInvitations = subscribeToInvitations((loadedInvites) => {
      setInvitations(loadedInvites);
    });

    return () => {
      unsubTasks();
      unsubMembers();
      unsubComments();
      unsubInvitations();
    };
  }, []);

  // Compute tasks count for sidebar badges
  const taskCounts = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length
  };

  // Keep selectedTask in sync when tasks list updates
  useEffect(() => {
    if (selectedTaskForDetail) {
      const updated = tasks.find((t) => t.id === selectedTaskForDetail.id);
      if (updated) {
        setSelectedTaskForDetail(updated);
      }
    }
  }, [tasks]);

  // Handlers
  const handleSaveTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentCount'>
  ) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, taskData);
      showToast('Đã cập nhật công việc thành công!');
    } else {
      await createTask(taskData);
      showToast('Đã tạo và giao việc thành công lên Firebase!');
    }
    setTaskToEdit(null);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
    const task = tasks.find((t) => t.id === taskId);
    showToast(`Đã chuyển trạng thái việc: ${task?.title.slice(0, 20)}...`);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    showToast('Đã xóa công việc khỏi Firebase.');
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(null);
    }
  };

  const handleSendInvite = async (inviteData: {
    email: string;
    role: string;
    department: string;
  }) => {
    const inv = await createInvitation({
      ...inviteData,
      invitedBy: currentUser.id,
      invitedByName: currentUser.displayName
    });
    showToast(`Đã lưu lời mời cho ${inviteData.email} lên Firebase!`);
    return { inviteCode: inv.inviteCode };
  };

  const handleCancelInvite = async (inviteId: string) => {
    await cancelInvitation(inviteId);
    showToast('Đã hủy lời mời.');
  };

  const handleRegisterUser = async (data: Omit<User, 'id' | 'joinedAt'>) => {
    const newUser = await registerMember(data);
    showToast(`Chào mừng thành viên mới: ${newUser.displayName}!`);
    return newUser;
  };

  const handleAssignTaskToMember = (member: User) => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  // Subtitle per tab
  const getTabInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Tổng Quan Dự Án',
          subtitle: 'Thống kê công việc, tỷ lệ hoàn thành và link báo cáo nghiệm thu'
        };
      case 'tasks':
        return {
          title: 'Quản Lý Công Việc',
          subtitle: 'Bảng Kanban & Danh sách đầu việc, ngày bắt đầu, ngày hoàn thành & kết quả'
        };
      case 'reports':
        return {
          title: 'Báo Cáo Kết Quả & Thảo Luận',
          subtitle: 'Xem link báo cáo sản phẩm bàn giao và trao đổi bình luận trực tiếp'
        };
      case 'members':
        return {
          title: 'Quản Lý Thành Viên',
          subtitle: 'Danh sách nhân sự, phân bổ nhiệm vụ và mời thành viên tham gia'
        };
    }
  };

  const tabInfo = getTabInfo();

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs font-semibold rounded-2xl shadow-xl border border-pink-500/30 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar (Slide bar bên trái) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          taskCounts={taskCounts}
          onOpenNewTask={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          onOpenInvite={() => setIsInviteModalOpen(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          allMembers={members}
          onSwitchUser={(user) => {
            setCurrentUser(user);
            showToast(`Đã chuyển sang tài khoản: ${user.displayName}`);
          }}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-100 text-slate-600 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              currentUser={currentUser}
              taskCounts={taskCounts}
              onOpenNewTask={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              onOpenInvite={() => {
                setIsInviteModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              onOpenRegister={() => {
                setIsRegisterModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              allMembers={members}
              onSwitchUser={(user) => {
                setCurrentUser(user);
                setIsMobileSidebarOpen(false);
                showToast(`Đã chuyển sang: ${user.displayName}`);
              }}
            />
          </div>
          <div
            className="flex-1"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Workspace Area (Khu vực làm việc bên phải) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50/70">
        {/* Mobile Navigation Trigger Button */}
        <div className="lg:hidden p-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Quản Lý Công Việc
          </span>
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            onClick={() => setIsRegisterModalOpen(true)}
            className="w-8 h-8 rounded-full border border-pink-400 object-cover cursor-pointer"
          />
        </div>

        {/* Workspace Top Header */}
        <Header
          title={tabInfo.title}
          subtitle={tabInfo.subtitle}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentUser={currentUser}
          onOpenNewTask={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          onOpenInvite={() => setIsInviteModalOpen(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          reportCount={tasks.filter((t) => t.reportLink).length}
        />

        {/* Active Content Body */}
        <main className="flex-1 overflow-y-auto" id="workspace-main-content">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              members={members}
              allComments={allComments}
              onSelectTask={(task) => setSelectedTaskForDetail(task)}
              onOpenNewTask={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              onOpenInvite={() => setIsInviteModalOpen(true)}
              onViewTasks={() => setActiveTab('tasks')}
              onViewReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoardView
              tasks={tasks}
              members={members}
              searchTerm={searchTerm}
              onSelectTask={(task) => setSelectedTaskForDetail(task)}
              onOpenNewTask={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              tasks={tasks}
              allComments={allComments}
              currentUser={currentUser}
              onOpenNewTask={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              members={members}
              tasks={tasks}
              invitations={invitations}
              currentUser={currentUser}
              onOpenInvite={() => setIsInviteModalOpen(true)}
              onOpenRegister={() => setIsRegisterModalOpen(true)}
              onCancelInvitation={handleCancelInvite}
              onAssignTaskToMember={handleAssignTaskToMember}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {/* 1. Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        members={members}
        currentUser={currentUser}
        taskToEdit={taskToEdit}
      />

      {/* 2. Task Detail Modal (with Report link & Realtime Comments) */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={Boolean(selectedTaskForDetail)}
        onClose={() => setSelectedTaskForDetail(null)}
        currentUser={currentUser}
        onEditTask={(task) => {
          setSelectedTaskForDetail(null);
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
      />

      {/* 3. Invite Member Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentUser={currentUser}
        onSendInvite={handleSendInvite}
      />

      {/* 4. Register Member Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegisterUser}
        onSelectUser={(u) => setCurrentUser(u)}
        existingUsers={members}
      />
    </div>
  );
}
