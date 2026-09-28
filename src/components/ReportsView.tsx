import React, { useState } from 'react';
import {
  FileCheck2,
  Link2,
  ExternalLink,
  MessageSquare,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  Share2,
  Check,
  Search,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, User, TaskComment } from '../types';
import { addComment, updateTask } from '../services/dataService';

interface ReportsViewProps {
  tasks: Task[];
  allComments: TaskComment[];
  currentUser: User;
  onOpenNewTask: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tasks,
  allComments,
  currentUser,
  onOpenNewTask
}) => {
  // Only tasks with report links, or allow selecting any task to add report link
  const tasksWithReport = tasks.filter((t) => t.reportLink && t.reportLink.trim().length > 0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    tasksWithReport[0]?.id || tasks[0]?.id || ''
  );
  const [commentText, setCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState<'Góp ý' | 'Đã duyệt' | 'Cần chỉnh sửa' | 'Hỏi đáp'>('Góp ý');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('all');

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasksWithReport[0] || tasks[0];

  // Comments for selected task
  const taskComments = allComments.filter((c) => c.taskId === selectedTask?.id);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      await addComment({
        taskId: selectedTask.id,
        authorId: currentUser.id,
        authorName: currentUser.displayName,
        authorEmail: currentUser.email,
        authorAvatar: currentUser.avatar,
        content: commentText.trim(),
        tag: selectedTag
      });
      setCommentText('');

      if (selectedTag === 'Đã duyệt') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error('Lỗi gửi comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleMarkDone = async () => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, { status: 'done' });
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleCopyLink = () => {
    if (!selectedTask?.reportLink) return;
    navigator.clipboard.writeText(selectedTask.reportLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-pink-600" />
            <span>Nghiệm Thu Báo Cáo Kết Quả & Thảo Luận Trực Tuyến</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem xét đường link kết quả công việc, phản hồi đóng góp ý kiến hoặc duyệt hoàn thành.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 border border-pink-200">
            {tasksWithReport.length} link kết quả đã nộp
          </span>
        </div>
      </div>

      {/* Main Split Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): List of tasks with report links */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col max-h-[700px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách đầu việc đã nộp link báo cáo
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {tasksWithReport.length} việc
            </span>
          </div>

          <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
            {tasksWithReport.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Link2 className="w-8 h-8 mx-auto text-slate-300" />
                <p>Chưa có đầu việc nào đính kèm link báo cáo kết quả.</p>
                <button
                  onClick={onOpenNewTask}
                  className="px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg text-xs font-bold hover:bg-pink-100"
                >
                  + Giao việc mới có link báo cáo
                </button>
              </div>
            ) : (
              tasksWithReport.map((task) => {
                const isSelected = selectedTask?.id === task.id;
                const commentCount = allComments.filter((c) => c.taskId === task.id).length;

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-50/60 to-blue-50/60 border-pink-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          task.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {task.status === 'done' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-blue-600 truncate font-medium">
                      <Link2 className="w-3 h-3 text-pink-500 shrink-0" />
                      <span className="truncate">{task.reportLink}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={task.assigneeAvatar}
                          alt={task.assigneeName}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-slate-600 font-medium">{task.assigneeName}</span>
                      </div>

                      <div className="flex items-center gap-1 text-pink-600 font-bold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{commentCount} thảo luận</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Report View & Comment Thread */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col max-h-[700px] overflow-hidden">
          {selectedTask ? (
            <>
              {/* Selected Task & Report Banner */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-pink-50/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">
                    Báo cáo kết quả của: {selectedTask.assigneeName}
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedTask.status !== 'done' && (
                      <button
                        onClick={handleMarkDone}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Duyệt hoàn thành</span>
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800">{selectedTask.title}</h3>

                {/* Report Link Display Card */}
                {selectedTask.reportLink ? (
                  <div className="p-3.5 rounded-xl bg-white border-2 border-pink-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 rounded-lg bg-pink-100 text-pink-600 shrink-0">
                          <Link2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800">Liên kết báo cáo kết quả:</p>
                          <a
                            href={selectedTask.reportLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 truncate block hover:underline"
                          >
                            {selectedTask.reportLink}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={handleCopyLink}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition"
                          title="Sao chép link"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">Sao chép</span>
                        </button>
                        <a
                          href={selectedTask.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition hover:opacity-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Mở link kết quả</span>
                        </a>
                      </div>
                    </div>

                    {selectedTask.reportNote && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg italic">
                        "{selectedTask.reportNote}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    Công việc này chưa cập nhật link báo cáo kết quả.
                  </div>
                )}
              </div>

              {/* Discussion / Comment Stream Header */}
              <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Trao đổi & Bình luận về kết quả này</span>
                </div>
                <span className="text-slate-400">{taskComments.length} ý kiến</span>
              </div>

              {/* Comments Feed */}
              <div className="p-5 overflow-y-auto flex-1 space-y-3.5 bg-slate-50/30">
                {taskComments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600">
                      Chưa có bình luận nào trên link báo cáo này
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Bạn có thể gửi nhận xét, đánh giá kết quả hoặc yêu cầu chỉnh sửa bên dưới.
                    </p>
                  </div>
                ) : (
                  taskComments.map((comment) => {
                    const isMe = comment.authorId === currentUser.id;
                    return (
                      <div
                        key={comment.id}
                        className={`flex gap-3 text-xs ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-pink-300 shrink-0 mt-0.5"
                        />
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs space-y-1.5 ${
                            isMe
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-none'
                              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-bold text-[11px] ${isMe ? 'text-pink-100' : 'text-slate-800'}`}>
                              {comment.authorName}
                            </span>
                            <span className={`text-[10px] ${isMe ? 'text-pink-200' : 'text-slate-400'}`}>
                              {new Date(comment.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {comment.tag && (
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                                comment.tag === 'Đã duyệt'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : comment.tag === 'Cần chỉnh sửa'
                                  ? 'bg-rose-100 text-rose-800'
                                  : comment.tag === 'Hỏi đáp'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {comment.tag}
                            </span>
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

              {/* Comment Input Form */}
              <form onSubmit={handleSendComment} className="p-4 border-t border-slate-100 bg-white space-y-2 shrink-0">
                {/* Tag Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Đánh giá:
                  </span>
                  {(['Góp ý', 'Đã duyệt', 'Cần chỉnh sửa', 'Hỏi đáp'] as const).map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                        selectedTag === tag
                          ? tag === 'Đã duyệt'
                            ? 'bg-emerald-600 text-white'
                            : tag === 'Cần chỉnh sửa'
                            ? 'bg-rose-600 text-white'
                            : tag === 'Hỏi đáp'
                            ? 'bg-purple-600 text-white'
                            : 'bg-blue-600 text-white'
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

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Bình luận đánh giá link kết quả của ${selectedTask.assigneeName}...`}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 disabled:opacity-40 transition active:scale-95 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Vui lòng chọn một công việc để xem báo cáo kết quả và thảo luận.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
