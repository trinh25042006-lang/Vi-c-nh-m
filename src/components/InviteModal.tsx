import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Shield,
  Briefcase,
  Copy,
  Check,
  Sparkles,
  Send,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSendInvite: (inviteData: {
    email: string;
    role: string;
    department: string;
  }) => Promise<{ inviteCode: string }>;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSendInvite
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Thành viên');
  const [department, setDepartment] = useState('Dự án phát triển');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await onSendInvite({
        email: email.trim(),
        role,
        department
      });
      setCreatedCode(res.inviteCode);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo lời mời.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdCode) return;
    const inviteUrl = `${window.location.origin}?invite=${createdCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReset = () => {
    setEmail('');
    setCreatedCode(null);
    setCopiedLink(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="invite-modal-container"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Mời thành viên tham gia</h3>
              <p className="text-xs text-blue-100">
                Gửi lời mời và tạo liên kết tham gia dự án
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {createdCode ? (
            /* Success State with Share Link */
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">
                  Đã tạo lời mời thành công!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Dữ liệu lời mời cho <strong className="text-slate-800">{email}</strong> đã được lưu lên Firebase Firestore.
                </p>
              </div>

              {/* Code Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-left">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Mã lời mời:</span>
                  <span className="font-mono font-bold text-blue-600">{createdCode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}?invite=${createdCode}`}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Đã chép' : 'Sao chép link'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-pink-500/20"
                >
                  Hoàn tất & Quay lại
                </button>
              </div>
            </div>
          ) : (
            /* Invite Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email người được mời <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="invite-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nguyenvanan@company.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vai trò dự án
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    id="invite-role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-slate-800 appearance-none font-medium"
                  >
                    <option value="Thành viên">Thành viên (Member)</option>
                    <option value="Thiết kế">Thiết kế UI/UX (Designer)</option>
                    <option value="Lập trình viên">Lập trình viên (Developer)</option>
                    <option value="Quản lý dự án">Quản lý dự án (Project Manager)</option>
                    <option value="Trưởng nhóm">Trưởng nhóm (Team Lead)</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phòng ban / Bộ phận
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="VD: Kỹ Thuật, Thiết Kế, Vận Hành..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  id="submit-invite-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Tạo lời mời & Lưu Firebase'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
