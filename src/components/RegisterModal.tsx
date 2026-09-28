import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  User,
  Shield,
  Briefcase,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { User as UserType } from '../types';
import confetti from 'canvas-confetti';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: Omit<UserType, 'id' | 'joinedAt'>) => Promise<UserType>;
  onSelectUser: (user: UserType) => void;
  existingUsers: UserType[];
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
];

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  onSelectUser,
  existingUsers
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserType['role']>('Thành viên');
  const [department, setDepartment] = useState('Phát triển Sản phẩm');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Vui lòng nhập họ và tên!');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ!');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const newUser = await onRegister({
        displayName: displayName.trim(),
        email: email.trim(),
        role,
        department: department.trim(),
        avatar: selectedAvatar,
        status: 'online'
      });

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSelectUser(newUser);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi đăng ký.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="register-modal-container"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-blue-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Đăng ký thành viên mới</h3>
              <p className="text-xs text-pink-100">
                Lưu tài khoản lên Firebase và bắt đầu quản lý công việc
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Chọn ảnh đại diện
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {AVATAR_OPTIONS.map((avatarUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={`relative rounded-xl overflow-hidden p-0.5 transition ${
                    selectedAvatar === avatarUrl
                      ? 'ring-3 ring-pink-500 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-11 h-11 rounded-lg object-cover"
                  />
                  {selectedAvatar === avatarUrl && (
                    <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Họ và tên thành viên <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="register-name-input"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="VD: Hoàng Gia Bảo, Trần Mai Lan..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Địa chỉ Email <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="register-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giabao@congviec.vn"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition text-slate-800"
              />
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chức vụ / Vai trò
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="register-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserType['role'])}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-slate-800 appearance-none font-medium"
                >
                  <option value="Thành viên">Thành viên</option>
                  <option value="Thiết kế">Thiết kế UI/UX</option>
                  <option value="Lập trình viên">Lập trình viên</option>
                  <option value="Quản lý dự án">Quản lý dự án</option>
                  <option value="Trưởng nhóm">Trưởng nhóm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phòng ban
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Vận hành, Kỹ thuật..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Fast Switch Existing Users for Demo/Testing */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Hoặc chọn nhanh tài khoản có sẵn:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {existingUsers.slice(0, 4).map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    onClose();
                  }}
                  className="p-2 rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-pink-50/40 text-left flex items-center gap-2 transition"
                >
                  <img
                    src={u.avatar}
                    alt={u.displayName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {u.displayName}
                    </p>
                    <p className="text-[10px] text-pink-600 truncate">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Hủy
            </button>
            <button
              id="submit-register-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-pink-500/25 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : 'Đăng ký & Tham gia ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
