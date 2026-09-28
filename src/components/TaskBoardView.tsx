import React, { useState } from 'react';
import {
  KanbanSquare,
  List,
  Calendar,
  Clock,
  UserCheck,
  Link2,
  MessageSquare,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Task, User, TaskStatus, TaskPriority } from '../types';

interface TaskBoardViewProps {
  tasks: Task[];
  members: User[];
  searchTerm: string;
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; badgeColor: string; bgCol: string }[] = [
  {
    id: 'todo',
    label: 'Cần làm',
    color: 'border-slate-300 text-slate-700',
    badgeColor: 'bg-slate-100 text-slate-700',
    bgCol: 'bg-slate-50/60'
  },
  {
    id: 'in_progress',
    label: 'Đang thực hiện',
    color: 'border-blue-400 text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800',
    bgCol: 'bg-blue-50/30'
  },
  {
    id: 'review',
    label: 'Chờ nghiệm thu (Có báo cáo)',
    color: 'border-purple-400 text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-800',
    bgCol: 'bg-purple-50/30'
  },
  {
    id: 'done',
    label: 'Đã hoàn thành',
    color: 'border-emerald-400 text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    bgCol: 'bg-emerald-50/30'
  }
];

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  tasks,
  members,
  searchTerm,
  onSelectTask,
  onOpenNewTask,
  onUpdateTaskStatus
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [filterReportOnly, setFilterReportOnly] = useState<boolean>(false);

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    // Search matching
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.assigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.reportLink && t.reportLink.toLowerCase().includes(searchTerm.toLowerCase()));

    // Assignee filter
    const matchAssignee = selectedAssignee === 'all' || t.assigneeId === selectedAssignee;

    // Priority filter
    const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;

    // Report only filter
    const matchReport = !filterReportOnly || (t.reportLink && t.reportLink.trim().length > 0);

    return matchSearch && matchAssignee && matchPriority && matchReport;
  });

  const getPriorityStyle = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityLabel = (p: TaskPriority) => {
    switch (p) {
      case 'urgent': return 'Khẩn cấp';
      case 'high': return 'Ưu tiên cao';
      case 'medium': return 'Trung bình';
      default: return 'Thấp';
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'done';
    return 'todo';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Filter & Toolbar Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-500 uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-pink-500" />
            <span>Bộ lọc:</span>
          </div>

          {/* Member Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:border-pink-500 focus:bg-white"
          >
            <option value="all">Tất cả thành viên</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:border-pink-500 focus:bg-white"
          >
            <option value="all">Mọi mức ưu tiên</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Ưu tiên cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>

          {/* Has Report Link toggle */}
          <button
            onClick={() => setFilterReportOnly(!filterReportOnly)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition font-medium ${
              filterReportOnly
                ? 'bg-pink-100 text-pink-700 border-pink-300 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Chỉ xem việc có link báo cáo</span>
          </button>
        </div>

        {/* Right: View Mode & Action */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng Bảng Kanban"
            >
              <KanbanSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng Danh sách chi tiết"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
          </div>

          <button
            onClick={onOpenNewTask}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Giao việc mới</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className={`rounded-2xl border ${col.color} ${col.bgCol} p-3.5 flex flex-col min-h-[480px] shadow-xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200/80 rounded-xl text-slate-400 text-xs">
                      Không có công việc
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        id={`task-card-${task.id}`}
                        onClick={() => onSelectTask(task)}
                        className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-pink-300 hover:shadow-md transition cursor-pointer space-y-3 group"
                      >
                        {/* Header: Priority & Advance Status button */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityStyle(
                              task.priority
                            )}`}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTaskStatus(task.id, getNextStatus(task.status));
                            }}
                            className="text-[10px] font-semibold text-slate-400 hover:text-pink-600 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-50 hover:bg-pink-50 transition"
                            title="Chuyển nhanh sang trạng thái tiếp theo"
                          >
                            <span>Chuyển</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-pink-600 transition">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Start Date & Due Date - Explicit requirement */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-500" /> Bắt đầu:
                            </span>
                            <span className="font-medium text-slate-700">{task.startDate}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-pink-600">
                              <Clock className="w-3 h-3" /> Hoàn thành:
                            </span>
                            <span className="font-bold text-pink-600">{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Report Link Badge & Comment Discussion Trigger */}
                        {task.reportLink ? (
                          <div className="p-2 rounded-lg bg-gradient-to-r from-pink-50 to-blue-50 border border-pink-200 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0 text-blue-700 font-semibold truncate text-[11px]">
                              <Link2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                              <span className="truncate">Đã nộp link báo cáo</span>
                            </div>
                            <span className="text-[10px] text-pink-600 font-bold flex items-center gap-1 shrink-0 bg-white px-1.5 py-0.5 rounded border border-pink-200">
                              <MessageSquare className="w-3 h-3" />
                              <span>Bình luận</span>
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic flex items-center gap-1 px-1">
                            <span>Chưa có link báo cáo kết quả</span>
                          </div>
                        )}

                        {/* Footer: Assignee & Comment Count */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <img
                              src={task.assigneeAvatar}
                              alt={task.assigneeName}
                              className="w-6 h-6 rounded-full object-cover border border-pink-400 shrink-0"
                            />
                            <span className="text-[11px] font-semibold text-slate-700 truncate">
                              {task.assigneeName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span>{task.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tên công việc</th>
                  <th className="py-3 px-4">Người phụ trách</th>
                  <th className="py-3 px-4">Ngày bắt đầu</th>
                  <th className="py-3 px-4">Ngày hoàn thành</th>
                  <th className="py-3 px-4">Ưu tiên</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Link báo cáo kết quả</th>
                  <th className="py-3 px-4 text-center">Bình luận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      Không tìm thấy công việc phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-pink-50/30 transition cursor-pointer"
                    >
                      {/* Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-800 truncate hover:text-pink-600">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-400 truncate">
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName}
                            className="w-6 h-6 rounded-full object-cover border border-pink-400"
                          />
                          <span className="font-semibold text-slate-700">{task.assigneeName}</span>
                        </div>
                      </td>

                      {/* Start Date */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {task.startDate}
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 font-bold text-pink-600">
                        {task.dueDate}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            task.status === 'done'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'review'
                              ? 'bg-purple-100 text-purple-800'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.status === 'done'
                            ? 'Đã xong'
                            : task.status === 'review'
                            ? 'Chờ nghiệm thu'
                            : task.status === 'in_progress'
                            ? 'Đang làm'
                            : 'Cần làm'}
                        </span>
                      </td>

                      {/* Report Link */}
                      <td className="py-3 px-4 max-w-xs">
                        {task.reportLink ? (
                          <div className="flex items-center gap-1.5 text-blue-600 font-semibold truncate hover:underline">
                            <Link2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <span className="truncate">{task.reportLink}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa đính kèm</span>
                        )}
                      </td>

                      {/* Comments */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                          <MessageSquare className="w-3 h-3 text-pink-500" />
                          <span>{task.commentCount || 0}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
