import React from 'react';
import {
  Search,
  Plus,
  UserPlus,
  Bell,
  Sparkles,
  Link2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentUser: User;
  onOpenNewTask: () => void;
  onOpenInvite: () => void;
  onOpenRegister: () => void;
  reportCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  setSearchTerm,
  currentUser,
  onOpenNewTask,
  onOpenInvite,
  onOpenRegister,
  reportCount
}) => {
  return (
    <header
      id="main-workspace-header"
      className="h-18 px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20 shrink-0"
    >
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {reportCount > 0 && title.includes('Báo cáo') && (
              <span className="text-xs bg-pink-100 text-pink-700 font-semibold px-2 py-0.5 rounded-full border border-pink-200">
                {reportCount} báo cáo
              </span>
            )}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="header-global-search-input"
            type="text"
            placeholder="Tìm kiếm công việc, thành viên, link báo cáo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition text-slate-700 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          id="header-invite-btn"
          onClick={onOpenInvite}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Mời thành viên</span>
        </button>

        <button
          id="header-create-task-btn"
          onClick={onOpenNewTask}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl shadow-sm shadow-pink-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Giao việc mới</span>
        </button>

        {/* Current User Pill */}
        <div
          onClick={onOpenRegister}
          className="flex items-center gap-2 pl-2 pr-3 py-1 bg-gradient-to-r from-pink-50 to-blue-50 border border-pink-100 rounded-full cursor-pointer hover:border-pink-300 transition"
          title="Bấm để đăng ký thêm tài khoản"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-7 h-7 rounded-full object-cover border border-pink-400"
          />
          <span className="text-xs font-semibold text-slate-700 hidden lg:inline max-w-[100px] truncate">
            {currentUser.displayName}
          </span>
        </div>
      </div>
    </header>
  );
};
