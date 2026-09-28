import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Briefcase,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { User, Task, Invitation } from '../types';

interface MembersViewProps {
  members: User[];
  tasks: Task[];
  invitations: Invitation[];
  currentUser: User;
  onOpenInvite: () => void;
  onOpenRegister: () => void;
  onCancelInvitation: (id: string) => void;
  onAssignTaskToMember: (member: User) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  tasks,
  invitations,
  currentUser,
  onOpenInvite,
  onOpenRegister,
  onCancelInvitation,
  onAssignTaskToMember
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const filteredMembers = members.filter(
    (m) =>
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopyInvite = (inv: Invitation) => {
    const inviteUrl = `${window.location.origin}?invite=${inv.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCodeId(inv.id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const getRoleBadge = (role: string) => {
    if (role.includes('Trưởng') || role.includes('Quản lý')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
          {role}
        </span>
      );
    }
    if (role.includes('Thiết kế')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
          {role}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
        {role}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Quản Lý Thành Viên & Phân Công Dự Án</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng {members.length} thành viên đang tham gia quản lý công việc và nộp báo cáo kết quả.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenRegister}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Đăng ký thành viên</span>
          </button>

          <button
            id="members-invite-btn"
            onClick={onOpenInvite}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-blue-600 hover:opacity-95 rounded-xl shadow-md shadow-pink-500/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Mời thành viên mới</span>
          </button>
        </div>
      </div>

      {/* Search Members Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm theo tên, email, vai trò hoặc phòng ban..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-700"
        />
      </div>

      {/* Members Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((member) => {
          const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
          const doneTasks = memberTasks.filter((t) => t.status === 'done');
          const inProgressTasks = memberTasks.filter((t) => t.status === 'in_progress');
          const reviewTasks = memberTasks.filter((t) => t.status === 'review');

          return (
            <div
              key={member.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-pink-300 hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Avatar & Role Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.displayName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-400 shadow-sm"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        member.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      title={member.status === 'busy' ? 'Bận' : 'Đang trực tuyến'}
                    />
                  </div>

                  <div className="text-right">
                    {getRoleBadge(member.role)}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {member.department || 'Dự án chung'}
                    </p>
                  </div>
                </div>

                {/* Name & Contact */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-pink-600 transition">
                    {member.displayName}
                  </h3>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{member.email}</span>
                  </p>
                </div>

                {/* Workload Stats Bar */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-600 text-[11px]">
                    <span>Tổng việc giao:</span>
                    <span className="text-slate-800 font-bold">{memberTasks.length} việc</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1 border-t border-slate-200/60">
                    <div className="bg-blue-50 py-1 rounded text-blue-700 font-medium">
                      {inProgressTasks.length} đang làm
                    </div>
                    <div className="bg-purple-50 py-1 rounded text-purple-700 font-medium">
                      {reviewTasks.length} báo cáo
                    </div>
                    <div className="bg-emerald-50 py-1 rounded text-emerald-700 font-medium">
                      {doneTasks.length} đã xong
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Giao việc cho thành viên */}
              <button
                onClick={() => onAssignTaskToMember(member)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-blue-500/10 hover:from-pink-500 hover:to-blue-600 text-pink-700 hover:text-white border border-pink-200 hover:border-transparent text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Giao việc cho {member.displayName.split(' ').pop()}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Pending Invitations Section - Crucial for "Mời thành viên" */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-pink-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Danh sách lời mời tham gia nhóm (Đang chờ chấp nhận)
            </h3>
          </div>
          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">
            {invitations.length} lời mời
          </span>
        </div>

        {invitations.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Không có lời mời nào đang chờ. Bạn có thể nhấn nút "Mời thành viên mới" để thêm người vào nhóm.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{inv.email}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
                      {inv.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      Mã: {inv.inviteCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Được mời bởi: <span className="font-semibold">{inv.invitedByName}</span> • Phòng ban: {inv.department}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyInvite(inv)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedCodeId === inv.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép link mời</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onCancelInvitation(inv.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hủy lời mời"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
