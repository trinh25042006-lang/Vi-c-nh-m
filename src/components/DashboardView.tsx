import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Link2,
  MessageSquare,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Task, User, TaskComment } from '../types';

interface DashboardViewProps {
  tasks: Task[];
  members: User[];
  allComments: TaskComment[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onOpenInvite: () => void;
  onViewTasks: () => void;
  onViewReports: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  members,
  allComments,
  onSelectTask,
  onOpenNewTask,
  onOpenInvite,
  onViewTasks,
  onViewReports
}) => {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const tasksWithReport = tasks.filter((t) => t.reportLink && t.reportLink.trim().length > 0).length;

  const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Recent tasks with report links
  const recentReports = tasks
    .filter((t) => t.reportLink)
    .slice(0, 4);

  // Urgent or upcoming tasks
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner with Pink & Blue Gradient */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-blue-600 text-white shadow-xl shadow-pink-500/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ thống Quản Lý Công Việc & Báo Cáo Kết Quả</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Chào mừng trở lại dự án!
            </h1>
            <p className="text-pink-100 text-xs sm:text-sm leading-relaxed">
              Theo dõi tiến độ từ ngày bắt đầu đến ngày hoàn thành, kiểm tra các link báo cáo kết quả và thảo luận comment trực tiếp với thành viên.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewTask}
              className="px-4 py-2.5 rounded-xl bg-white text-pink-600 hover:bg-pink-50 font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Giao việc mới</span>
            </button>
            <button
              onClick={onOpenInvite}
              className="px-4 py-2.5 rounded-xl bg-blue-900/40 hover:bg-blue-900/60 border border-white/30 text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Mời thành viên</span>
            </button>
          </div>
        </div>

        {/* Progress Bar inside Banner */}
        <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span>Tiến độ hoàn thành dự án</span>
              <span>{completionPercentage}% ({doneTasks}/{totalTasks} công việc)</span>
            </div>
            <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-emerald-300 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex sm:justify-end gap-3 text-xs">
            <span className="bg-white/15 px-3 py-1.5 rounded-xl font-medium">
              🔗 {tasksWithReport} link kết quả
            </span>
            <span className="bg-white/15 px-3 py-1.5 rounded-xl font-medium">
              💬 {allComments.length} bình luận
            </span>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div
          onClick={onViewTasks}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng đầu việc
            </span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600 group-hover:bg-pink-500 group-hover:text-white transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{totalTasks}</span>
            <span className="text-xs text-slate-400">công việc</span>
          </div>
          <div className="mt-2 text-[11px] text-pink-600 font-medium flex items-center gap-1">
            <span>{todoTasks} việc cần làm</span>
          </div>
        </div>

        {/* In Progress Tasks */}
        <div
          onClick={onViewTasks}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Đang thực hiện
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{inProgressTasks}</span>
            <span className="text-xs text-slate-400">đang chạy</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium">
            Tiến độ hàng ngày
          </div>
        </div>

        {/* Review & Reports */}
        <div
          onClick={onViewReports}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chờ nghiệm thu
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{reviewTasks}</span>
            <span className="text-xs text-slate-400">cần duyệt</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 font-medium">
            Có {tasksWithReport} link kết quả
          </div>
        </div>

        {/* Done Tasks */}
        <div
          onClick={onViewTasks}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Đã hoàn thành
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{doneTasks}</span>
            <span className="text-xs text-slate-400">đạt chuẩn</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            {completionPercentage}% mục tiêu
          </div>
        </div>
      </div>

      {/* Main 2-column Content: Upcoming tasks & Reports with comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Upcoming Tasks & Deadlines */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Công việc cần thực hiện & Ngày hoàn thành
              </h3>
            </div>
            <button
              onClick={onViewTasks}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Không có công việc nào đang chờ thực hiện.
              </p>
            ) : (
              upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-pink-50/40 border border-slate-200/70 hover:border-pink-200 transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-500" /> Từ {t.startDate}
                      </span>
                      <span className="flex items-center gap-1 text-pink-600 font-semibold">
                        <Clock className="w-3 h-3" /> Hạn: {t.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <img
                      src={t.assigneeAvatar}
                      alt={t.assigneeName}
                      title={`Người nhận việc: ${t.assigneeName}`}
                      className="w-7 h-7 rounded-full object-cover border border-pink-300"
                    />
                    {t.reportLink && (
                      <span className="p-1 rounded-md bg-blue-100 text-blue-700" title="Đã có link báo cáo">
                        <Link2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Card: Recent Reports & Interactive Discussion preview */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Báo cáo kết quả mới & Thảo luận comment
              </h3>
            </div>
            <button
              onClick={onViewReports}
              className="text-xs font-semibold text-pink-600 hover:text-pink-800 flex items-center gap-1"
            >
              <span>Xem báo cáo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <div className="text-center py-8 space-y-1.5">
                <Link2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-500">
                  Chưa có công việc nào cập nhật link báo cáo.
                </p>
                <p className="text-[11px] text-slate-400">
                  Thành viên khi hoàn thành công việc có thể dán link báo cáo kết quả và thảo luận comment.
                </p>
              </div>
            ) : (
              recentReports.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-pink-50/30 to-blue-50/30 border border-slate-200/80 hover:border-blue-300 transition cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{t.title}</p>
                      <p className="text-[11px] text-blue-600 truncate flex items-center gap-1 mt-0.5">
                        <Link2 className="w-3 h-3 shrink-0" />
                        <span>{t.reportLink}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                      {t.status === 'done' ? 'Đã duyệt' : 'Chờ đánh giá'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={t.assigneeAvatar}
                        alt={t.assigneeName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{t.assigneeName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-pink-600 font-semibold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nhấp để bình luận</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Members Workload Quick Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Phân bổ công việc theo thành viên nhóm
            </h3>
          </div>
          <span className="text-xs text-slate-400">{members.length} thành viên</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {members.map((member) => {
            const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
            const memberDone = memberTasks.filter((t) => t.status === 'done').length;
            const memberInProgress = memberTasks.filter((t) => t.status === 'in_progress').length;

            return (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center gap-3"
              >
                <img
                  src={member.avatar}
                  alt={member.displayName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-pink-400 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {member.displayName}
                  </p>
                  <p className="text-[10px] text-pink-600 truncate">{member.role}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <span>{memberTasks.length} việc</span>
                    <span>•</span>
                    <span className="text-emerald-600">{memberDone} xong</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
