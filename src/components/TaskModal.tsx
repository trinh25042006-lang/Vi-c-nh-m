import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  UserCheck,
  Link2,
  AlertCircle,
  Flag,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Task, User, TaskPriority, TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentCount'>) => Promise<void>;
  members: User[];
  currentUser: User;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  currentUser,
  taskToEdit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [reportLink, setReportLink] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default dates helper
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getNextWeekString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setAssigneeId(taskToEdit.assigneeId);
      setStartDate(taskToEdit.startDate);
      setDueDate(taskToEdit.dueDate);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setReportLink(taskToEdit.reportLink || '');
      setReportNote(taskToEdit.reportNote || '');
    } else {
      setTitle('');
      setDescription('');
      setAssigneeId(members[0]?.id || currentUser.id);
      setStartDate(getTodayString());
      setDueDate(getNextWeekString());
      setPriority('medium');
      setStatus('todo');
      setReportLink('');
      setReportNote('');
    }
    setError('');
  }, [taskToEdit, isOpen, members, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề công việc!');
      return;
    }
    if (!startDate) {
      setError('Vui lòng chọn ngày bắt đầu!');
      return;
    }
    if (!dueDate) {
      setError('Vui lòng chọn ngày hoàn thành / hạn chót!');
      return;
    }
    if (new Date(dueDate) < new Date(startDate)) {
      setError('Ngày hoàn thành không thể trước ngày bắt đầu!');
      return;
    }

    const assignedMember = members.find((m) => m.id === assigneeId) || currentUser;

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim(),
        assigneeId: assignedMember.id,
        assigneeName: assignedMember.displayName,
        assigneeEmail: assignedMember.email,
        assigneeAvatar: assignedMember.avatar,
        startDate,
        dueDate,
        status,
        priority,
        reportLink: reportLink.trim(),
        reportNote: reportNote.trim(),
        createdById: currentUser.id,
        createdByName: currentUser.displayName,
        reportSubmittedAt: reportLink.trim() ? new Date().toISOString() : undefined
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi lưu công việc.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="task-form-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {taskToEdit ? 'Chỉnh sửa đầu việc' : 'Giao việc mới cho thành viên'}
              </h3>
              <p className="text-xs text-pink-100">
                Điền thông tin phân công, ngày bắt đầu, ngày hoàn thành & link báo cáo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tiêu đề công việc <span className="text-pink-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thiết kế giao diện báo cáo, Lập trình API Firebase..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition font-medium text-slate-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mô tả chi tiết yêu cầu
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể mục tiêu, tài liệu tham khảo và các yêu cầu nghiệm thu..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition text-slate-700 resize-none"
            />
          </div>

          {/* Assignee & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Người phụ trách (Giao việc cho) <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="task-assignee-select"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800 font-medium appearance-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName} ({m.role})
                    </option>
                  ))}
                </select>
                <UserCheck className="w-4 h-4 text-blue-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mức độ ưu tiên
              </label>
              <div className="relative">
                <select
                  id="task-priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition text-slate-800 font-medium appearance-none"
                >
                  <option value="low">Thấp (Thong thả)</option>
                  <option value="medium">Trung bình (Bình thường)</option>
                  <option value="high">Cao (Ưu tiên)</option>
                  <option value="urgent">Khẩn cấp (Gấp)</option>
                </select>
                <Flag className="w-4 h-4 text-pink-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Start Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Ngày bắt đầu</span> <span className="text-pink-500">*</span>
              </label>
              <input
                id="task-startdate-input"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-600" />
                <span>Ngày hoàn thành (Hạn chót)</span> <span className="text-pink-500">*</span>
              </label>
              <input
                id="task-duedate-input"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition text-slate-800"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trạng thái công việc
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'todo', label: 'Cần làm', color: 'border-slate-300 text-slate-700' },
                { id: 'in_progress', label: 'Đang làm', color: 'border-blue-300 text-blue-700 bg-blue-50/50' },
                { id: 'review', label: 'Chờ nghiệm thu', color: 'border-purple-300 text-purple-700 bg-purple-50/50' },
                { id: 'done', label: 'Đã xong', color: 'border-emerald-300 text-emerald-700 bg-emerald-50/50' }
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStatus(s.id as TaskStatus)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    status === s.id
                      ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white border-transparent shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Report Result Link */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50/60 to-blue-50/60 border border-pink-200/70 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-pink-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Link báo cáo kết quả công việc (Bàn giao sản phẩm)
              </h4>
            </div>
            <p className="text-[11px] text-slate-500">
              Dán đường link chứa kết quả công việc (VD: Google Drive, Docs, Figma, Github PR, Link web...) để người giao việc kiểm tra và bình luận đánh giá.
            </p>

            <div>
              <input
                id="task-report-link-input"
                type="url"
                value={reportLink}
                onChange={(e) => setReportLink(e.target.value)}
                placeholder="https://drive.google.com/... hoặc https://figma.com/file/..."
                className="w-full px-4 py-2 text-sm bg-white border border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition text-slate-800"
              />
            </div>

            <div>
              <input
                id="task-report-note-input"
                type="text"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="Ghi chú ngắn về kết quả (VD: Đã làm xong phần 1, mời anh/chị xem và góp ý)..."
                className="w-full px-4 py-2 text-xs bg-white border border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy bỏ
            </button>
            <button
              id="save-task-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-blue-600 hover:opacity-95 shadow-md shadow-pink-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Đang lưu lên Firebase...'
                : taskToEdit
                ? 'Cập nhật công việc'
                : 'Tạo và Giao việc ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
