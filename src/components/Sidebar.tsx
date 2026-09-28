import React from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  FileCheck2,
  UserPlus,
  PlusCircle,
  Database,
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'tasks' | 'members' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'members' | 'reports') => void;
  currentUser: User;
  taskCounts: {
    total: number;
    inProgress: number;
    review: number;
    done: number;
  };
  onOpenNewTask: () => void;
  onOpenInvite: () => void;
  onOpenRegister: () => void;
  allMembers: User[];
  onSwitchUser: (user: User) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  taskCounts,
  onOpenNewTask,
  onOpenInvite,
  onOpenRegister,
  allMembers,
  onSwitchUser
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = React.useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
      description: 'Báo cáo & số liệu dự án'
    },
    {
      id: 'tasks',
      label: 'Quản lý công việc',
      icon: KanbanSquare,
      badge: taskCounts.total > 0 ? taskCounts.total : null,
      description: 'Giao việc, tiến độ, hạn chót'
    },
    {
      id: 'reports',
      label: 'Báo cáo & Nhận xét',
      icon: FileCheck2,
      badge: taskCounts.review > 0 ? `${taskCounts.review} chờ duyệt` : null,
      description: 'Link kết quả & Thảo luận'
    },
    {
      id: 'members',
      label: 'Quản lý thành viên',
      icon: Users,
      badge: allMembers.length,
      description: 'Thành viên & Lời mời'
    }
  ] as const;

  return (
    <aside
      id="main-sidebar"
      className="w-72 bg-gradient-to-b from-white via-slate-50 to-pink-50/40 border-r border-slate-200/80 flex flex-col h-screen select-none shrink-0 transition-all shadow-sm"
    >
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-pink-100/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight tracking-tight">
              Quản Lý Công Việc
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span>Firebase Realtime</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Buttons */}
      <div className="p-4 space-y-2">
        <button
          id="sidebar-create-task-btn"
          onClick={onOpenNewTask}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-pink-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Giao việc mới</span>
        </button>

        <button
          id="sidebar-invite-member-btn"
          onClick={onOpenInvite}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Mời thành viên</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" id="sidebar-navigation">
        <p className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Chức năng chính
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-blue-500/10 text-pink-700 font-semibold border border-pink-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-br from-pink-500 to-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium leading-none">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-normal line-clamp-1">
                    {item.description}
                  </div>
                </div>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-pink-100 text-pink-700'
                      : typeof item.badge === 'string'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Cloud & Realtime Status Indicator */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-medium truncate">Firestore Realtime Sync</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
      </div>

      {/* User Profile & Account Switcher */}
      <div className="p-3 border-t border-slate-200/80 bg-white/80 relative">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition">
          <button
            id="sidebar-current-user-btn"
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
            title="Nhấn để đổi vai trò hoặc chuyển tài khoản"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-full object-cover border-2 border-pink-400"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {currentUser.displayName}
              </p>
              <p className="text-[11px] text-pink-600 font-medium truncate">
                {currentUser.role}
              </p>
            </div>
          </button>

          <button
            id="sidebar-register-btn"
            onClick={onOpenRegister}
            title="Đăng ký tài khoản mới"
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* User Switcher Dropdown */}
        {showSwitchMenu && (
          <div
            id="user-switch-dropdown"
            className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between px-2 py-1 text-slate-400 font-semibold border-b border-slate-100 mb-1">
              <span>Chuyển tài khoản demo</span>
              <button
                onClick={() => setShowSwitchMenu(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {allMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    onSwitchUser(member);
                    setShowSwitchMenu(false);
                  }}
                  className={`w-full text-left p-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-100 transition ${
                    member.id === currentUser.id ? 'bg-pink-50 font-semibold text-pink-700' : 'text-slate-700'
                  }`}
                >
                  <img
                    src={member.avatar}
                    alt={member.displayName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="truncate flex-1">
                    <div>{member.displayName}</div>
                    <div className="text-[10px] text-slate-400">{member.role}</div>
                  </div>
                  {member.id === currentUser.id && (
                    <UserCheck className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="pt-1.5 mt-1.5 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowSwitchMenu(false);
                  onOpenRegister();
                }}
                className="w-full text-center py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 font-medium flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tạo & Đăng ký tài khoản mới</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
