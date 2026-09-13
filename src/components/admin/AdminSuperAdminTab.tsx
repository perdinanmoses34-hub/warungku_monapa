import React, { useState } from 'react';
import { SystemSettings, User, UserRole } from '../../types';
import { store } from '../../services/storeService';
import { formatRupiah } from '../../utils/formatters';
import {
  Shield,
  Coins,
  ArrowDownCircle,
  Users,
  Store,
  ShoppingBag,
  Truck,
  Ban,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  LogIn,
  Edit3,
  Check,
  Building2,
  Phone,
  Mail,
} from 'lucide-react';

interface Props {
  settings: SystemSettings;
  users: User[];
  currentUserId: string;
}

export const AdminSuperAdminTab: React.FC<Props> = ({ settings, users, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESTRICTED'>('ALL');

  // Admin Fee edit state
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState(settings.platformAdminFee || 1000);

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Restrict modal state
  const [restrictTargetUser, setRestrictTargetUser] = useState<User | null>(null);
  const [restrictReason, setRestrictReason] = useState('Melanggar ketentuan platform WARUNGKU');

  // Delete modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);

  // Edit Super Admin account state
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accHolder, setAccHolder] = useState(settings.superAdminAccount?.holderName || 'Perdinan Moses');
  const [accBank, setAccBank] = useState(settings.superAdminAccount?.bankName || 'BCA (Bank Central Asia)');
  const [accNumber, setAccNumber] = useState(settings.superAdminAccount?.accountNumber || '8830192831');

  // Toast indicator
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveFee = () => {
    const num = Number(feeInput);
    if (isNaN(num) || num < 0) return;
    store.updatePlatformAdminFee(num);
    setIsEditingFee(false);
    showToast(`Biaya admin platform diperbarui menjadi ${formatRupiah(num)} per pesanan`);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSuperAdminAccount({
      holderName: accHolder,
      bankName: accBank,
      accountNumber: accNumber,
    });
    setIsEditingAccount(false);
    showToast('Informasi rekening Super Admin berhasil diperbarui!');
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amount = Number(withdrawAmount);
    const balance = settings.superAdminEarnings?.currentBalance || 0;

    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Masukkan jumlah penarikan yang valid');
      return;
    }
    if (amount > balance) {
      setWithdrawError(`Saldo tidak mencukupi. Maksimal penarikan: ${formatRupiah(balance)}`);
      return;
    }

    const ok = store.withdrawSuperAdminEarnings(amount, withdrawNote);
    if (ok) {
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawNote('');
      showToast(`Berhasil mencairkan dana ${formatRupiah(amount)} ke rekening Super Admin!`);
    } else {
      setWithdrawError('Gagal memproses penarikan saldo.');
    }
  };

  const handleConfirmRestrict = () => {
    if (!restrictTargetUser) return;
    store.restrictUser(restrictTargetUser.id, restrictReason);
    showToast(`Akun ${restrictTargetUser.name} berhasil dibatasi.`);
    setRestrictTargetUser(null);
  };

  const handleUnrestrict = (user: User) => {
    store.unrestrictUser(user.id);
    showToast(`Batasan akun ${user.name} telah dicabut.`);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetUser) return;
    store.deleteUser(deleteTargetUser.id);
    showToast(`Akun ${deleteTargetUser.name} telah dihapus dari sistem.`);
    setDeleteTargetUser(null);
  };

  const handleSwitchToUser = (user: User) => {
    store.switchUser(user.id);
    showToast(`Beralih ke akun ${user.name} (${user.role})`);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm) ||
      (u.storeProfile?.storeName && u.storeProfile.storeName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.status !== 'RESTRICTED') ||
      (statusFilter === 'RESTRICTED' && u.status === 'RESTRICTED');

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sellersCount = users.filter((u) => u.role === 'SELLER' || u.role === 'ADMIN').length;
  const customersCount = users.filter((u) => u.role === 'CUSTOMER').length;
  const couriersCount = users.filter((u) => u.role === 'COURIER').length;
  const restrictedCount = users.filter((u) => u.status === 'RESTRICTED').length;

  const earnings = settings.superAdminEarnings || {
    totalFeeAccumulated: 4000,
    currentBalance: 4000,
    totalWithdrawn: 0,
  };

  return (
    <div className="space-y-6 text-xs text-stone-900 animate-in fade-in">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SECTION 1: SUPER ADMIN EARNINGS & COMMISSION */}
      <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-purple-800/60 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-purple-100">
                    Keuntungan Super Admin Pusat
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 text-[10px] font-black text-purple-200 uppercase tracking-wide">
                    Potongan Admin
                  </span>
                </div>
                <p className="text-purple-300/80 text-[11px] mt-0.5">
                  Setiap pesanan di semua warung dipotong biaya admin otomatis dan dibayarkan ke akun Super Admin.
                </p>
              </div>
            </div>

            {/* Quick action: Withdraw button */}
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Tarik Saldo Keuntungan</span>
            </button>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-purple-900/50 border border-purple-700/50 rounded-2xl p-4">
              <div className="text-[11px] text-purple-300 font-semibold mb-1">
                Saldo Keuntungan Tersedia
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatRupiah(earnings.currentBalance)}
              </div>
              <div className="text-[10px] text-purple-300/70 mt-1">
                Siap ditarik ke rekening bank Super Admin
              </div>
            </div>

            <div className="bg-purple-900/50 border border-purple-700/50 rounded-2xl p-4">
              <div className="text-[11px] text-purple-300 font-semibold mb-1">
                Total Komisi Terakumulasi
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-200">
                {formatRupiah(earnings.totalFeeAccumulated)}
              </div>
              <div className="text-[10px] text-purple-300/70 mt-1">
                Akumulasi seluruh transaksi sukses di platform
              </div>
            </div>

            <div className="bg-purple-900/50 border border-purple-700/50 rounded-2xl p-4">
              <div className="text-[11px] text-purple-300 font-semibold mb-1">
                Total Telah Dicairkan
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-200">
                {formatRupiah(earnings.totalWithdrawn)}
              </div>
              <div className="text-[10px] text-purple-300/70 mt-1">
                Total keuntungan yang telah ditransfer ke rekening
              </div>
            </div>
          </div>

          {/* Configuration sub-row: Admin Fee setting & Receiving Bank */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Setting: Platform Admin Fee */}
            <div className="bg-purple-900/40 border border-purple-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-200">
                  Besaran Potongan Biaya Admin Per Pembelian:
                </span>
                {!isEditingFee && (
                  <button
                    onClick={() => setIsEditingFee(true)}
                    className="text-[11px] text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Ubah</span>
                  </button>
                )}
              </div>

              {isEditingFee ? (
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-purple-300 font-bold">Rp</span>
                    <input
                      type="number"
                      value={feeInput}
                      onChange={(e) => setFeeInput(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-1.5 bg-purple-950 border border-purple-600 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                  <button
                    onClick={handleSaveFee}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Simpan</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingFee(false);
                      setFeeInput(settings.platformAdminFee || 1000);
                    }}
                    className="px-2.5 py-1.5 bg-purple-800 hover:bg-purple-700 text-purple-200 rounded-xl text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-black text-amber-300">
                  <span>{formatRupiah(settings.platformAdminFee || 1000)}</span>
                  <span className="text-[11px] font-normal text-purple-300">/ setiap transaksi pesanan</span>
                </div>
              )}
            </div>

            {/* Setting: Super Admin Receiving Account */}
            <div className="bg-purple-900/40 border border-purple-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-200">
                  Rekening Penerima Dana Super Admin:
                </span>
                {!isEditingAccount && (
                  <button
                    onClick={() => setIsEditingAccount(true)}
                    className="text-[11px] text-purple-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Rekening</span>
                  </button>
                )}
              </div>

              {isEditingAccount ? (
                <form onSubmit={handleSaveAccount} className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Bank (BCA, Mandiri, dll)"
                      value={accBank}
                      onChange={(e) => setAccBank(e.target.value)}
                      className="px-2.5 py-1 bg-purple-950 border border-purple-600 rounded-xl text-xs text-white outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Nomor Rekening"
                      value={accNumber}
                      onChange={(e) => setAccNumber(e.target.value)}
                      className="px-2.5 py-1 bg-purple-950 border border-purple-600 rounded-xl text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Nama Pemilik Rekening"
                    value={accHolder}
                    onChange={(e) => setAccHolder(e.target.value)}
                    className="w-full px-2.5 py-1 bg-purple-950 border border-purple-600 rounded-xl text-xs text-white outline-none"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Simpan Rekening
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAccount(false)}
                      className="px-2.5 py-1 bg-purple-800 text-purple-200 rounded-xl text-xs cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-xs text-purple-200">
                  <div className="font-bold text-white">
                    {settings.superAdminAccount?.bankName} - {settings.superAdminAccount?.accountNumber}
                  </div>
                  <div className="text-[11px] text-purple-300">
                    a.n. {settings.superAdminAccount?.holderName} ({settings.superAdminAccount?.email})
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACCOUNTS MANAGEMENT (SUPER ADMIN PRIVILEGES) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-700" />
              <h3 className="font-extrabold text-sm text-stone-900">
                Pusat Kontrol Seluruh Akun Pengguna ({users.length})
              </h3>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Super Admin memiliki hak penuh melihat semua akun, membatasi (restrict), atau menghapus akun yang melanggar ketentuan.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              {sellersCount} Penjual
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {customersCount} Pembeli
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {couriersCount} Kurir
            </span>
            {restrictedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold animate-pulse">
                {restrictedCount} Dibatasi
              </span>
            )}
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, toko, email, atau no. HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Peran</option>
              <option value="SELLER">Penjual (Warung)</option>
              <option value="CUSTOMER">Pembeli</option>
              <option value="COURIER">Kurir</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Status Aktif</option>
              <option value="RESTRICTED">Status Dibatasi</option>
            </select>
          </div>
        </div>

        {/* User list cards / table */}
        <div className="space-y-2.5">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-stone-400 bg-stone-50 rounded-2xl">
              Tidak ada akun yang sesuai dengan kriteria pencarian.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isSuperAdmin = user.role === 'SUPER_ADMIN';
              const isRestricted = user.status === 'RESTRICTED';

              return (
                <div
                  key={user.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isRestricted
                      ? 'bg-rose-50/70 border-rose-200'
                      : isSuperAdmin
                      ? 'bg-purple-50/50 border-purple-200'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200 mt-0.5"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm truncate">
                          {user.name}
                        </span>

                        {/* Role badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : user.role === 'SELLER'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : user.role === 'COURIER'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {user.role === 'SELLER'
                            ? 'Penjual'
                            : user.role === 'SUPER_ADMIN'
                            ? 'Super Admin'
                            : user.role === 'COURIER'
                            ? 'Kurir'
                            : 'Pembeli'}
                        </span>

                        {/* Status badge */}
                        {isRestricted ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-200 text-rose-900 flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            <span>Dibatasi</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        )}

                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-stone-900 text-white font-bold">
                            Anda Saat Ini
                          </span>
                        )}
                      </div>

                      {/* Store detail if seller */}
                      {user.storeProfile && (
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-bold">
                          <Store className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            Warung: <strong>{user.storeProfile.storeName}</strong>
                          </span>
                          <span className="text-stone-400 font-normal">
                            ({user.storeProfile.storeAddress || 'Alamat warung terdaftar'})
                          </span>
                        </div>
                      )}

                      {/* Contact metadata */}
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap">
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{user.phone}</span>
                          </span>
                        )}
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{user.email}</span>
                          </span>
                        )}
                      </div>

                      {/* Restriction reason display */}
                      {isRestricted && user.restrictedReason && (
                        <div className="text-[11px] text-rose-800 bg-rose-100/70 px-2.5 py-1 rounded-lg mt-1 font-medium flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Alasan dibatasi: "{user.restrictedReason}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    {/* Switch role preview */}
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleSwitchToUser(user)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer"
                        title="Masuk dan pantau sebagai akun ini"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Beralih Akun</span>
                      </button>
                    )}

                    {/* Restrict / Unrestrict (Super Admin power) */}
                    {!isSuperAdmin && (
                      <>
                        {isRestricted ? (
                          <button
                            onClick={() => handleUnrestrict(user)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Buka Batasan</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setRestrictTargetUser(user)}
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer"
                            title="Batasi akun jika melanggar ketentuan"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>Batasi Akun</span>
                          </button>
                        )}

                        {/* Delete Account */}
                        <button
                          onClick={() => setDeleteTargetUser(user)}
                          className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                          title="Hapus akun permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: WITHDRAW COMMISSION */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                <ArrowDownCircle className="w-5 h-5 text-purple-700" />
                <span>Pencairan Saldo Keuntungan Super Admin</span>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
              <div className="text-[11px] text-purple-700 font-semibold">Rekening Tujuan:</div>
              <div className="font-bold text-purple-950 text-xs">
                {settings.superAdminAccount?.bankName} - {settings.superAdminAccount?.accountNumber}
              </div>
              <div className="text-[11px] text-purple-800">
                a.n. {settings.superAdminAccount?.holderName}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-stone-500 flex justify-between">
                <span>Saldo Keuntungan Tersedia:</span>
                <strong className="text-emerald-700">{formatRupiah(earnings.currentBalance)}</strong>
              </div>
            </div>

            {withdrawError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-xl font-bold">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nominal Penarikan (Rp):
                </label>
                <input
                  type="number"
                  required
                  placeholder={`Maksimal ${earnings.currentBalance}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:bg-white outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Catatan / Keterangan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Penarikan keuntungan periode minggu ini"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
                >
                  Konfirmasi Tarik Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESTRICT USER */}
      {restrictTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-800 font-black text-sm border-b border-stone-200 pb-3">
              <Ban className="w-5 h-5 text-rose-600" />
              <span>Batasi Akun: {restrictTargetUser.name}</span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-[11px] leading-relaxed">
              <strong>Peringatan Super Admin:</strong> Akun yang dibatasi tidak dapat melakukan pembelian ataupun menambah/mengubah produk warung mereka hingga Super Admin mencabut batasan ini.
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Alasan Pembatasan Akun:
              </label>
              <textarea
                rows={3}
                required
                value={restrictReason}
                onChange={(e) => setRestrictReason(e.target.value)}
                placeholder="Tuliskan pelanggaran yang dilakukan pengguna..."
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestrictTargetUser(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestrict}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                Terapkan Batasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE USER */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-stone-900">
                Hapus Akun Pengguna?
              </h3>
              <p className="text-stone-500 text-[11px] mt-1">
                Apakah Anda yakin ingin menghapus akun <strong>{deleteTargetUser.name}</strong> ({deleteTargetUser.role})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
