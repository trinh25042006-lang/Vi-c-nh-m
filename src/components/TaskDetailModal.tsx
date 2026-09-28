import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  UserCheck,
  ExternalLink,
  MessageSquare,
  Send,
  Link2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  Trash2,
  Edit3,
  Flag,
  Share2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, User, TaskComment, TaskStatus } from '../types';
import { subscribeToComments, addComment, deleteComment, updateTask } from '../services/dataService';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  currentUser,
  onEditTask,
  onDeleteTask
}) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState<'Góp ý' | 'Đã duyệt' | 'Cần chỉnh sửa' | 'Hỏi đáp'>('Góp ý');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [editingReportLink, setEditingReportLink] = useState(false);
  const [tempReportLink, setTempReportLink] = useState('');
  const [tempReportNote, setTempReportNote] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTempReportLink(task.reportLink || '');
    setTempReportNote(task.reportNote || '');

    // Realtime Firestore comment listener
    const unsubscribe = subscribeToComments(task.id, (loadedComments) => {
      setComments(loadedComments);
    });

    return () => unsubscribe();
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setIsSendingComment(true);
      await addComment({
        taskId: task.id,
        authorId: currentUser.id,
        authorName: currentUser.displayName,
        authorEmail: currentUser.email,
        authorAvatar: currentUser.avatar,
        content: newCommentText.trim(),
        tag: selectedTag
      });
      setNewCommentText('');

      // Trigger confetti if approval comment
      if (selectedTag === 'Đã duyệt') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error('Lỗi khi gửi bình luận:', err);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleSaveReportLink = async () => {
    try {
      await updateTask(task.id, {
        reportLink: tempReportLink.trim(),
        reportNote: tempReportNote.trim(),
        reportSubmittedAt: tempReportLink.trim() ? new Date().toISOString() : undefined,
        // If report is newly provided, suggest moving to 'review' status
        status: tempReportLink.trim() && task.status === 'todo' ? 'review' : task.status
      });
      setEditingReportLink(false);
    } catch (err) {
      console.error('Lỗi khi cập nhật link báo cáo:', err);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateTask(task.id, { status: newStatus });
    if (newStatus === 'done') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleCopyReportLink = () => {
    if (!task.reportLink) return;
    navigator.clipboard.writeText(task.reportLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">Khẩn cấp</span>;
      case 'high':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">Ưu tiên cao</span>;
      case 'medium':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Trung bình</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Thấp</span>;
    }
  };

  const getTagBadge = (tag?: string) => {
    switch (tag) {
      case 'Đã duyệt':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã duyệt
          </span>
        );
      case 'Cần chỉnh sửa':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Cần chỉnh sửa
          </span>
        );
      case 'Hỏi đáp':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
            <HelpCircle className="w-3 h-3 text-purple-600" /> Hỏi đáp
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
            <Lightbulb className="w-3 h-3 text-blue-600" /> Góp ý
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="task-detail-modal"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header with Title & Quick Actions */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-blue-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-pink-100 uppercase tracking-wider block">
                Chi tiết công việc & Báo cáo kết quả
              </span>
              <h2 className="text-base sm:text-lg font-bold truncate text-white">
                {task.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEditTask(task)}
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition text-xs font-semibold flex items-center gap-1"
              title="Chỉnh sửa thông tin"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Column (5 cols): Task Specs & Report Link */}
          <div className="lg:col-span-5 p-5 space-y-5 bg-slate-50/50">
            {/* Status Selector Bar */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Trạng thái tiến độ
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'todo', label: 'Cần làm', color: 'hover:bg-slate-200' },
                  { id: 'in_progress', label: 'Đang làm', color: 'hover:bg-blue-100' },
                  { id: 'review', label: 'Chờ nghiệm thu', color: 'hover:bg-purple-100' },
                  { id: 'done', label: 'Đã hoàn thành', color: 'hover:bg-emerald-100' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id as TaskStatus)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition text-center ${
                      task.status === st.id
                        ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white border-transparent shadow-sm'
                        : `bg-white border-slate-200 text-slate-600 ${st.color}`
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meta Cards: Dates & Assignee */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Người phụ trách:</span>
                <div className="flex items-center gap-2">
                  <img
                    src={task.assigneeAvatar}
                    alt={task.assigneeName}
                    className="w-6 h-6 rounded-full object-cover border border-pink-400"
                  />
                  <span className="text-xs font-bold text-slate-800">{task.assigneeName}</span>
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Độ ưu tiên:</span>
                <div>{getPriorityBadge(task.priority)}</div>
              </div>

              {/* Start Date */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày bắt đầu:
                </span>
                <span className="text-xs font-semibold text-slate-700">{task.startDate}</span>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-pink-600" /> Ngày hoàn thành:
                </span>
                <span className="text-xs font-bold text-pink-600">{task.dueDate}</span>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Mô tả công việc
                </label>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            {/* REPORT LINK CARD - PROMINENT REQUIREMENT */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 via-white to-blue-50 border-2 border-pink-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Link Báo Cáo Kết Quả
                    </h4>
                    <span className="text-[10px] text-pink-600 font-medium">
                      Bàn giao & Nghiệm thu
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingReportLink(!editingReportLink)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  {editingReportLink ? 'Đóng' : task.reportLink ? 'Sửa link' : '+ Gắn link'}
                </button>
              </div>

              {editingReportLink ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="url"
                    value={tempReportLink}
                    onChange={(e) => setTempReportLink(e.target.value)}
                    placeholder="https://drive.google.com/... hoặc link kết quả"
                    className="w-full px-3 py-2 text-xs bg-white border border-pink-300 rounded-lg focus:outline-pink-500 text-slate-800"
                  />
                  <input
                    type="text"
                    value={tempReportNote}
                    onChange={(e) => setTempReportNote(e.target.value)}
                    placeholder="Ghi chú bàn giao kết quả (tùy chọn)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-blue-500 text-slate-700"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingReportLink(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveReportLink}
                      className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-blue-600 rounded-lg"
                    >
                      Lưu link báo cáo
                    </button>
                  </div>
                </div>
              ) : task.reportLink ? (
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-pink-100 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-blue-700 truncate hover:underline">
                        {task.reportLink}
                      </p>
                      {task.reportNote && (
                        <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-2">
                          "{task.reportNote}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={handleCopyReportLink}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                        title="Sao chép link báo cáo"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={task.reportLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs inline-flex items-center gap-1"
                        title="Mở link báo cáo kết quả trong tab mới"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                    <span>Trạng thái: Đã đính kèm kết quả</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sẵn sàng nghiệm thu
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/80 rounded-lg border border-dashed border-pink-300 text-center space-y-2">
                  <p className="text-xs text-slate-500">Chưa cập nhật link báo cáo kết quả.</p>
                  <button
                    onClick={() => setEditingReportLink(true)}
                    className="px-3 py-1.5 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition"
                  >
                    + Thêm link báo cáo ngay
                  </button>
                </div>
              )}
            </div>

            {/* Delete button */}
            <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
              <span>Mã ID: {task.id.slice(0, 10)}</span>
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa công việc này không?')) {
                    onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="text-rose-500 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa việc
              </button>
            </div>
          </div>

          {/* Right Column (7 cols): Realtime Comment Thread on Report */}
          <div className="lg:col-span-7 flex flex-col h-full bg-white">
            {/* Comment Section Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Bình luận & Đánh giá kết quả công việc
                </h3>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                {comments.length} bình luận
              </span>
            </div>

            {/* Comments List Feed */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/30">
              {comments.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-pink-50 text-pink-400 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">
                    Chưa có bình luận nào trên link báo cáo này!
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Hãy kiểm tra link kết quả công việc và để lại nhận xét, duyệt báo cáo hoặc yêu cầu chỉnh sửa bên dưới.
                  </p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isMe = comment.authorId === currentUser.id;
                  return (
                    <div
                      key={comment.id}
                      className={`flex gap-3 text-xs ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                      />
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs space-y-1.5 ${
                          isMe
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-bold text-[11px] ${
                              isMe ? 'text-pink-100' : 'text-slate-800'
                            }`}
                          >
                            {comment.authorName}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isMe ? 'text-pink-200' : 'text-slate-400'
                            }`}
                          >
                            {new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {comment.tag && (
                          <div className="pt-0.5">
                            {getTagBadge(comment.tag)}
                          </div>
                        )}

                        <p className={`text-xs leading-relaxed whitespace-pre-line ${isMe ? 'text-white' : 'text-slate-700'}`}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input Box */}
            <form
              onSubmit={handleSendComment}
              className="p-4 border-t border-slate-200/80 bg-white space-y-2.5 shrink-0"
            >
              {/* Tag selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Nhãn đánh giá:
                </span>
                {(['Góp ý', 'Đã duyệt', 'Cần chỉnh sửa', 'Hỏi đáp'] as const).map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                      selectedTag === tag
                        ? tag === 'Đã duyệt'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : tag === 'Cần chỉnh sửa'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : tag === 'Hỏi đáp'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag === 'Đã duyệt' && '✅ '}
                    {tag === 'Cần chỉnh sửa' && '⚠️ '}
                    {tag === 'Hỏi đáp' && '❓ '}
                    {tag === 'Góp ý' && '💡 '}
                    {tag}
                  </button>
                ))}
              </div>

              {/* Textarea + Send */}
              <div className="flex gap-2">
                <textarea
                  id="report-comment-input"
                  rows={2}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={`Nhận xét về link báo cáo kết quả của ${task.assigneeName}... (Enter để gửi)`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment(e);
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition text-slate-800 resize-none"
                />

                <button
                  id="send-report-comment-btn"
                  type="submit"
                  disabled={isSendingComment || !newCommentText.trim()}
                  className="px-4 bg-gradient-to-r from-pink-500 to-blue-600 hover:opacity-95 text-white rounded-xl shadow-md shadow-pink-500/20 flex items-center justify-center disabled:opacity-40 transition active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
