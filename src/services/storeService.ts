import {
  AuditLog,
  CartItem,
  Category,
  NotificationItem,
  Order,
  OrderStatus,
  Product,
  PromoVoucher,
  Review,
  SellerStoreProfile,
  StockMovement,
  SystemSettings,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_VOUCHERS,
} from '../data/seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'warungku_products_v1',
  CATEGORIES: 'warungku_categories_v1',
  CART: 'warungku_cart_v1',
  ORDERS: 'warungku_orders_v1',
  USERS: 'warungku_users_v1',
  CURRENT_USER: 'warungku_current_user_v1',
  VOUCHERS: 'warungku_vouchers_v1',
  SETTINGS: 'warungku_settings_v1',
  REVIEWS: 'warungku_reviews_v1',
  WISHLIST: 'warungku_wishlist_v1',
  NOTIFICATIONS: 'warungku_notifications_v1',
  AUDIT_LOGS: 'warungku_audit_logs_v1',
  STOCK_MOVEMENTS: 'warungku_stock_movements_v1',
};

type Listener = () => void;

class StoreService {
  private listeners: Set<Listener> = new Set();

  private products: Product[] = [];
  private categories: Category[] = [];
  private cart: CartItem[] = [];
  private orders: Order[] = [];
  private users: User[] = [];
  private currentUserId: string = 'user-customer';
  private vouchers: PromoVoucher[] = [];
  private settings: SystemSettings = INITIAL_SETTINGS;
  private reviews: Review[] = [];
  private wishlist: string[] = [];
  private notifications: NotificationItem[] = [];
  private auditLogs: AuditLog[] = [];
  private stockMovements: StockMovement[] = [];

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.loadFromStorage();
        this.notify();
      });
    }
  }

  private init() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      this.products = this.getItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      this.categories = this.getItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      this.cart = this.getItem(STORAGE_KEYS.CART, []);
      this.orders = this.getItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      this.users = this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
      // Ensure seed sellers exist even if old users in storage lacked them
      INITIAL_USERS.forEach((seedU) => {
        if (!this.users.some((u) => u.id === seedU.id)) {
          this.users.push(seedU);
        }
      });
      // Pastikan superadmin memakai akun perdinan.moses34@guru.smp.belajar.id
      const superAdminIndex = this.users.findIndex((u) => u.role === 'SUPER_ADMIN' || u.id === 'user-superadmin');
      if (superAdminIndex >= 0) {
        this.users[superAdminIndex] = {
          ...this.users[superAdminIndex],
          name: 'Perdinan Moses (Super Admin)',
          email: 'perdinan.moses34@guru.smp.belajar.id',
          status: 'ACTIVE',
        };
      }
      // Ensure all users have a status
      this.users = this.users.map((u) => ({
        ...u,
        status: u.status || 'ACTIVE',
      }));

      this.currentUserId = this.getItem(STORAGE_KEYS.CURRENT_USER, 'user-customer');
      this.vouchers = this.getItem(STORAGE_KEYS.VOUCHERS, INITIAL_VOUCHERS);
      this.settings = this.getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

      // Ensure platformAdminFee & superadmin account and earnings
      if (this.settings.platformAdminFee === undefined) {
        this.settings.platformAdminFee = 1000;
      }
      if (!this.settings.superAdminAccount) {
        this.settings.superAdminAccount = INITIAL_SETTINGS.superAdminAccount;
      }
      if (!this.settings.superAdminEarnings) {
        this.settings.superAdminEarnings = INITIAL_SETTINGS.superAdminEarnings || {
          totalFeeAccumulated: 4000,
          currentBalance: 4000,
          totalWithdrawn: 0,
        };
      }

      // Ensure products have sellerId and sellerStoreName
      const sellers = this.users.filter((u) => (u.role === 'SELLER' || u.role === 'ADMIN') && u.storeProfile);
      this.products = this.products.map((p, idx) => {
        if (!p.sellerId && sellers.length > 0) {
          const s = sellers[idx % sellers.length];
          return {
            ...p,
            sellerId: s.id,
            sellerStoreName: s.storeProfile?.storeName || s.name,
          };
        }
        return p;
      });
      this.reviews = this.getItem(STORAGE_KEYS.REVIEWS, [
        {
          id: 'rev-1',
          orderId: 'ord-1002',
          productId: 'prod-19',
          productName: 'Isi Ulang Gas Elpiji 3 Kg Melon',
          userId: 'user-customer',
          userName: 'Ibu Ratna Dewi',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          rating: 5,
          comment: 'Pelayanan sangat memuaskan, gas diantar cepat sekali dan mas kurir bantu pasang ke kompor.',
          createdAt: '2026-09-10T15:00:00Z',
        },
      ]);
      this.wishlist = this.getItem(STORAGE_KEYS.WISHLIST, ['prod-1', 'prod-4']);
      this.notifications = this.getItem(STORAGE_KEYS.NOTIFICATIONS, [
        {
          id: 'notif-1',
          userId: 'user-customer',
          title: 'Pesanan Sedang Diantar',
          message: 'Pesanan WK-2026-000001 sedang dalam perjalanan oleh kurir Agus.',
          type: 'ORDER',
          orderId: 'ord-1001',
          read: false,
          createdAt: '2026-09-13T09:35:00Z',
        },
        {
          id: 'notif-2',
          targetRole: 'ALL',
          title: 'Promo Sembako Hemat',
          message: 'Gunakan kode GRATISONGKIR untuk belanja minimal Rp 75.000.',
          type: 'PROMO',
          read: false,
          createdAt: '2026-09-12T08:00:00Z',
        },
      ]);
      this.auditLogs = this.getItem(STORAGE_KEYS.AUDIT_LOGS, [
        {
          id: 'log-1',
          timestamp: '2026-09-13T08:30:00Z',
          userId: 'user-superadmin',
          userName: 'Budi Santoso',
          userRole: 'SUPER_ADMIN',
          action: 'UPDATE_SETTINGS',
          module: 'Pengaturan Toko',
          description: 'Mengatur jam operasional dan ongkos kirim standar',
        },
      ]);
      this.stockMovements = this.getItem(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    } catch {
      // Fallback to initial if localStorage parsing fails
      this.products = INITIAL_PRODUCTS;
      this.categories = INITIAL_CATEGORIES;
      this.cart = [];
      this.orders = INITIAL_ORDERS;
      this.users = INITIAL_USERS;
      this.settings = INITIAL_SETTINGS;
      this.vouchers = INITIAL_VOUCHERS;
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage quota or write error', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Listener notification error', err);
      }
    });
  }

  // ===================== USER & ROLE =====================

  public getUsers(): User[] {
    return [...this.users];
  }

  public getCurrentUser(): User {
    const user = this.users.find((u) => u.id === this.currentUserId);
    return user || this.users[3] || this.users[0]; // fallback
  }

  public registerUser(params: { name: string; phone: string; email: string; role?: UserRole }): { success: boolean; user?: User; message: string } {
    const cleanPhone = params.phone.trim();
    const cleanEmail = params.email.trim().toLowerCase();

    // Check if phone or email already registered
    const existing = this.users.find(
      (u) => (cleanEmail && u.email.toLowerCase() === cleanEmail) || (cleanPhone && u.phone === cleanPhone)
    );

    if (existing) {
      // Auto login to existing account
      this.currentUserId = existing.id;
      this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
      this.notify();
      return { success: true, user: existing, message: 'Akun Anda ditemukan! Berhasil masuk.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: params.name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      role: params.role || 'CUSTOMER',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      addresses: [],
      createdAt: new Date().toISOString(),
      totalSpent: 0,
      totalOrders: 0,
    };

    this.users.unshift(newUser);
    this.setItem(STORAGE_KEYS.USERS, this.users);

    this.currentUserId = newUser.id;
    this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);

    this.addNotification({
      userId: newUser.id,
      title: 'Selamat Datang di WARUNGKU! 🎉',
      message: `Hai ${newUser.name}, akun belanja Anda telah aktif. Selamat berbelanja kebutuhan sembako segar!`,
      type: 'SYSTEM',
      read: false,
    });

    this.logActivity('REGISTER_USER', 'Pengguna', `Pengguna baru mendaftar: ${newUser.name} (${newUser.email || newUser.phone})`);
    this.notify();

    return { success: true, user: newUser, message: 'Akun berhasil dibuat! Selamat berbelanja.' };
  }

  /**
   * Pendaftaran Mandiri untuk Penjual (Buka Warung)
   */
  public registerSeller(params: {
    name: string;
    phone: string;
    email: string;
    storeName: string;
    storeTagline?: string;
    storeAddress: string;
    storePhone?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  }): { success: boolean; user?: User; message: string } {
    const cleanPhone = params.phone.trim();
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanStoreName = params.storeName.trim() || `Warung ${params.name.trim()}`;

    // Check if phone or email already registered
    const existing = this.users.find(
      (u) => (cleanEmail && u.email.toLowerCase() === cleanEmail) || (cleanPhone && u.phone === cleanPhone)
    );

    if (existing) {
      if (existing.role !== 'SELLER' && existing.role !== 'ADMIN') {
        // Upgrade existing customer to seller
        existing.role = 'SELLER';
        existing.storeProfile = {
          storeName: cleanStoreName,
          storeTagline: params.storeTagline || 'Sembako Lengkap, Segar & Terpercaya',
          storeDescription: `Warung sembako resmi milik ${params.name}. Menyediakan aneka bahan pokok harian.`,
          storeAddress: params.storeAddress,
          storePhone: params.storePhone || cleanPhone,
          storeEmail: cleanEmail,
          bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
          logoUrl: existing.avatarUrl,
          isOpen: true,
          rating: 5.0,
          totalOrders: 0,
          paymentMethods: {
            codEnabled: true,
            bankTransferEnabled: true,
            ewalletEnabled: true,
          },
          bankAccounts: params.bankName && params.accountNumber ? [
            {
              id: `bank-${Date.now()}`,
              bankName: params.bankName,
              accountNumber: params.accountNumber,
              accountHolder: params.accountHolder || params.name,
            }
          ] : [
            {
              id: `bank-${Date.now()}`,
              bankName: 'BCA (Bank Central Asia)',
              accountNumber: '7140001234',
              accountHolder: params.name.toUpperCase(),
            }
          ],
          ewallets: [
            {
              id: `ew-${Date.now()}`,
              walletName: 'GoPay',
              phoneNumber: cleanPhone,
              accountHolder: params.name,
            }
          ],
          deliverySettings: {
            baseFee: 5000,
            feePerKm: 2000,
            freeShippingMinOrder: 50000,
            maxRadiusKm: 10,
            estimatedMinutesBase: 25,
            deliveryFleetName: `Kurir ${cleanStoreName}`,
          },
        };
        this.setItem(STORAGE_KEYS.USERS, this.users);
        this.currentUserId = existing.id;
        this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
        this.notify();
        return { success: true, user: existing, message: `Akun Anda berhasil ditingkatkan menjadi Penjual (${cleanStoreName})!` };
      }
      this.currentUserId = existing.id;
      this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
      this.notify();
      return { success: true, user: existing, message: 'Akun toko Anda ditemukan! Berhasil masuk.' };
    }

    const newSeller: User = {
      id: `user-seller-${Date.now()}`,
      name: params.name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      role: 'SELLER',
      avatarUrl: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80`,
      addresses: [
        {
          id: `addr-${Date.now()}`,
          label: 'Rumah',
          recipientName: params.name,
          phone: cleanPhone,
          street: params.storeAddress,
          kelurahan: 'Sukamaju',
          kecamatan: 'Cilodong',
          city: 'Depok',
          postalCode: '16415',
          isDefault: true,
        }
      ],
      createdAt: new Date().toISOString(),
      totalSpent: 0,
      totalOrders: 0,
      status: 'ACTIVE',
      storeProfile: {
        storeName: cleanStoreName,
        storeTagline: params.storeTagline || 'Sembako Lengkap, Segar & Terpercaya',
        storeDescription: `Warung sembako resmi milik ${params.name}. Menyediakan aneka bahan pokok harian langsung antar.`,
        storeAddress: params.storeAddress,
        storePhone: params.storePhone || cleanPhone,
        storeEmail: cleanEmail,
        bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        logoUrl: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80`,
        isOpen: true,
        rating: 5.0,
        totalOrders: 0,
        paymentMethods: {
          codEnabled: true,
          bankTransferEnabled: true,
          ewalletEnabled: true,
        },
        bankAccounts: params.bankName && params.accountNumber ? [
          {
            id: `bank-${Date.now()}`,
            bankName: params.bankName,
            accountNumber: params.accountNumber,
            accountHolder: params.accountHolder || params.name,
          }
        ] : [
          {
            id: `bank-${Date.now()}`,
            bankName: 'BCA (Bank Central Asia)',
            accountNumber: '7140001234',
            accountHolder: params.name.toUpperCase(),
          }
        ],
        ewallets: [
          {
            id: `ew-${Date.now()}`,
            walletName: 'GoPay',
            phoneNumber: cleanPhone,
            accountHolder: params.name,
          }
        ],
        deliverySettings: {
          baseFee: 5000,
          feePerKm: 2000,
          freeShippingMinOrder: 50000,
          maxRadiusKm: 10,
          estimatedMinutesBase: 25,
          deliveryFleetName: `Kurir ${cleanStoreName}`,
        },
      },
    };

    this.users.unshift(newSeller);
    this.setItem(STORAGE_KEYS.USERS, this.users);

    this.currentUserId = newSeller.id;
    this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);

    this.addNotification({
      userId: newSeller.id,
      title: 'Selamat! Warung Anda Resmi Dibuka 🏪',
      message: `Warung "${cleanStoreName}" berhasil didaftarkan. Anda dapat mulai menambahkan produk sembako, mengatur pembayaran, dan menerima pesanan!`,
      type: 'SYSTEM',
      read: false,
    });

    this.addNotification({
      targetRole: 'SUPER_ADMIN',
      title: 'Penjual Baru Bergabung!',
      message: `${newSeller.name} baru saja membuka warung "${cleanStoreName}".`,
      type: 'SYSTEM',
      read: false,
    });

    this.logActivity('REGISTER_SELLER', 'Penjual', `Penjual baru terdaftar: ${cleanStoreName} oleh ${newSeller.name}`);
    this.notify();

    return { success: true, user: newSeller, message: `Selamat! Warung "${cleanStoreName}" Anda telah aktif.` };
  }

  /**
   * Pendaftaran Mandiri untuk Pembeli
   */
  public registerBuyer(params: {
    name: string;
    phone: string;
    email: string;
    streetAddress?: string;
  }): { success: boolean; user?: User; message: string } {
    const res = this.registerUser({
      name: params.name,
      phone: params.phone,
      email: params.email,
      role: 'CUSTOMER',
    });

    if (res.success && res.user && params.streetAddress) {
      this.saveAddress({
        recipientName: params.name,
        phone: params.phone,
        street: params.streetAddress,
        isDefault: true,
        label: 'Rumah',
      });
    }

    return res;
  }

  /**
   * Update Profil Warung Milik Penjual
   */
  public updateSellerStoreProfile(sellerId: string, updates: Partial<SellerStoreProfile>): boolean {
    const userIndex = this.users.findIndex((u) => u.id === sellerId);
    if (userIndex < 0) return false;

    const user = this.users[userIndex];
    if (!user.storeProfile) {
      user.storeProfile = {
        storeName: user.name,
        storeTagline: 'Sembako Lengkap & Murah',
        storeAddress: user.addresses[0]?.street || 'Depok',
        storePhone: user.phone,
        isOpen: true,
        rating: 5.0,
        totalOrders: 0,
        paymentMethods: { codEnabled: true, bankTransferEnabled: true, ewalletEnabled: true },
        bankAccounts: [],
        ewallets: [],
        deliverySettings: {
          baseFee: 5000,
          feePerKm: 2000,
          freeShippingMinOrder: 50000,
          maxRadiusKm: 10,
          estimatedMinutesBase: 25,
          deliveryFleetName: `Kurir ${user.name}`,
        },
      };
    }

    user.storeProfile = {
      ...user.storeProfile,
      ...updates,
    };

    // If store name changed, update products under this seller
    if (updates.storeName) {
      this.products = this.products.map((p) => {
        if (p.sellerId === sellerId) {
          return { ...p, sellerStoreName: updates.storeName };
        }
        return p;
      });
      this.setItem(STORAGE_KEYS.PRODUCTS, this.products);
    }

    this.setItem(STORAGE_KEYS.USERS, this.users);
    this.logActivity('UPDATE_STORE', 'Warung', `Penjual ${user.name} memperbarui profil toko ${user.storeProfile.storeName}`);
    this.notify();
    return true;
  }

  /**
   * Dapatkan semua penjual terdaftar (role SELLER atau ADMIN) yang aktif
   */
  public getSellers(): User[] {
    return this.users.filter(
      (u) => (u.role === 'SELLER' || u.role === 'ADMIN') && u.status !== 'RESTRICTED'
    );
  }

  // ===================== SUPER ADMIN CAPABILITIES =====================

  /**
   * Batasi Akun (Restrict User) oleh Super Admin
   */
  public restrictUser(userId: string, reason: string): boolean {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return false;
    if (target.role === 'SUPER_ADMIN') return false; // Super admin cannot be restricted

    target.status = 'RESTRICTED';
    target.restrictedReason = reason || 'Melanggar syarat dan ketentuan komunitas WARUNGKU';

    this.setItem(STORAGE_KEYS.USERS, this.users);

    this.addNotification({
      userId: target.id,
      title: '⚠️ Akun Anda Telah Dibatasi oleh Super Admin',
      message: `Akun Anda dibatasi dengan alasan: "${target.restrictedReason}". Hubungi Super Admin untuk peninjauan kembali.`,
      type: 'SYSTEM',
      read: false,
    });

    this.logActivity('RESTRICT_USER', 'Super Admin', `Super Admin membatasi akun ${target.name} (${target.email || target.phone}): ${target.restrictedReason}`);
    this.notify();
    return true;
  }

  /**
   * Buka Batasan Akun (Unrestrict User) oleh Super Admin
   */
  public unrestrictUser(userId: string): boolean {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return false;

    target.status = 'ACTIVE';
    delete target.restrictedReason;

    this.setItem(STORAGE_KEYS.USERS, this.users);

    this.addNotification({
      userId: target.id,
      title: '✅ Pembatasan Akun Telah Dicabut',
      message: 'Akun Anda telah diaktifkan kembali oleh Super Admin. Selamat beraktivitas!',
      type: 'SYSTEM',
      read: false,
    });

    this.logActivity('UNRESTRICT_USER', 'Super Admin', `Super Admin membuka batasan akun ${target.name}`);
    this.notify();
    return true;
  }

  /**
   * Hapus Akun oleh Super Admin
   */
  public deleteUser(userId: string): boolean {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return false;
    if (target.role === 'SUPER_ADMIN') return false; // Cannot delete super admin

    this.users = this.users.filter((u) => u.id !== userId);
    this.setItem(STORAGE_KEYS.USERS, this.users);

    // If current user is deleted, switch to fallback customer
    if (this.currentUserId === userId) {
      const fallback = this.users.find((u) => u.role === 'CUSTOMER') || this.users[0];
      if (fallback) this.currentUserId = fallback.id;
      this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
    }

    this.logActivity('DELETE_USER', 'Super Admin', `Super Admin menghapus akun ${target.name} (${target.role})`);
    this.notify();
    return true;
  }

  /**
   * Tarik Saldo Keuntungan Super Admin
   */
  public withdrawSuperAdminEarnings(amount: number, note?: string): boolean {
    if (!this.settings.superAdminEarnings) return false;
    if (amount <= 0 || amount > this.settings.superAdminEarnings.currentBalance) return false;

    this.settings.superAdminEarnings.currentBalance -= amount;
    this.settings.superAdminEarnings.totalWithdrawn += amount;
    this.setItem(STORAGE_KEYS.SETTINGS, this.settings);

    this.addNotification({
      targetRole: 'SUPER_ADMIN',
      title: '💸 Penarikan Saldo Keuntungan Berhasil',
      message: `Dana Rp ${amount.toLocaleString('id-ID')} telah diproses ke rekening ${this.settings.superAdminAccount.bankName} (${this.settings.superAdminAccount.accountNumber}). ${note ? `Catatan: ${note}` : ''}`,
      type: 'SYSTEM',
      read: false,
    });

    this.logActivity('WITHDRAW_SUPERADMIN', 'Super Admin', `Super Admin menarik keuntungan potongan admin Rp ${amount.toLocaleString('id-ID')}`);
    this.notify();
    return true;
  }

  /**
   * Ubah Nominal Potongan Admin Per Transaksi
   */
  public updatePlatformAdminFee(fee: number): void {
    this.settings.platformAdminFee = Math.max(0, fee);
    this.setItem(STORAGE_KEYS.SETTINGS, this.settings);
    this.logActivity('UPDATE_ADMIN_FEE', 'Super Admin', `Super Admin mengubah biaya admin platform menjadi Rp ${fee.toLocaleString('id-ID')}`);
    this.notify();
  }

  /**
   * Update Rekening Bank Penerima Super Admin
   */
  public updateSuperAdminAccount(account: Partial<SystemSettings['superAdminAccount']>): void {
    this.settings.superAdminAccount = {
      ...this.settings.superAdminAccount,
      ...account,
    };
    this.setItem(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
  }

  public loginUser(credential: string): { success: boolean; user?: User; message: string } {
    const clean = credential.trim().toLowerCase();
    const found = this.users.find(
      (u) => u.email.toLowerCase() === clean || u.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '')
    );

    if (!found) {
      return { success: false, message: 'Akun dengan email/nomor HP tersebut belum terdaftar. Silakan buat akun baru.' };
    }

    this.currentUserId = found.id;
    this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
    this.notify();
    return { success: true, user: found, message: `Selamat datang kembali, ${found.name}!` };
  }

  public logoutUser(): void {
    // Switch to public default guest / customer
    const publicCustomer = this.users.find((u) => u.role === 'CUSTOMER') || this.users[0];
    if (publicCustomer) {
      this.currentUserId = publicCustomer.id;
      this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
      this.notify();
    }
  }

  public switchUser(userId: string): void {
    const target = this.users.find((u) => u.id === userId);
    if (target) {
      this.currentUserId = target.id;
      this.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
      this.notify();
    }
  }

  public switchUserByRole(role: UserRole): void {
    const target = this.users.find((u) => u.role === role);
    if (target) {
      this.switchUser(target.id);
    }
  }

  public updateUserProfile(updated: Partial<User>): void {
    const current = this.getCurrentUser();
    this.users = this.users.map((u) => (u.id === current.id ? { ...u, ...updated } : u));
    this.setItem(STORAGE_KEYS.USERS, this.users);
    this.notify();
  }

  public saveAddress(address: Partial<User['addresses'][0]>): void {
    const user = this.getCurrentUser();
    let newAddresses = [...user.addresses];

    if (address.id) {
      newAddresses = newAddresses.map((a) => (a.id === address.id ? ({ ...a, ...address } as any) : a));
    } else {
      const newAddr: any = {
        ...address,
        id: `addr-${Date.now()}`,
        isDefault: newAddresses.length === 0 || !!address.isDefault,
      };
      if (newAddr.isDefault) {
        newAddresses = newAddresses.map((a) => ({ ...a, isDefault: false }));
      }
      newAddresses.push(newAddr);
    }

    if (address.isDefault) {
      newAddresses = newAddresses.map((a) => (a.id === address.id ? { ...a, isDefault: true } : { ...a, isDefault: false }));
    }

    this.updateUserProfile({ addresses: newAddresses });
  }

  // ===================== PRODUCTS & CATEGORIES =====================

  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductsBySeller(sellerId: string): Product[] {
    return this.products.filter((p) => p.sellerId === sellerId);
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public saveProduct(productData: Partial<Product>): Product {
    const currentUser = this.getCurrentUser();
    
    // Determine sellerId
    let sellerId = productData.sellerId;
    let sellerStoreName = productData.sellerStoreName;
    if (!sellerId) {
      if (currentUser.role === 'SELLER' || currentUser.role === 'ADMIN') {
        sellerId = currentUser.id;
        sellerStoreName = currentUser.storeProfile?.storeName || currentUser.name;
      } else {
        sellerId = 'user-seller-1';
        sellerStoreName = 'Warung Monapa Sejahtera';
      }
    }

    // Check if seller is restricted
    const seller = this.users.find((u) => u.id === sellerId);
    if (seller && seller.status === 'RESTRICTED') {
      throw new Error(`Akun warung "${sellerStoreName || seller.name}" sedang dibatasi oleh Super Admin (${seller.restrictedReason || 'Pelanggaran ketentuan'}). Tidak dapat mengelola produk.`);
    }

    let saved: Product;
    const now = new Date().toISOString();

    if (productData.id && this.products.some((p) => p.id === productData.id)) {
      this.products = this.products.map((p) => {
        if (p.id === productData.id) {
          saved = {
            ...p,
            ...productData,
            sellerId: p.sellerId || sellerId,
            sellerStoreName: p.sellerStoreName || sellerStoreName,
            updatedAt: now,
          };
          return saved;
        }
        return p;
      });
      this.logActivity('EDIT_PRODUCT', 'Produk', `Memperbarui produk ${productData.name}`);
    } else {
      saved = {
        id: `prod-${Date.now()}`,
        name: productData.name || 'Produk Baru',
        sellerId,
        sellerStoreName,
        categoryId: productData.categoryId || 'cat-1',
        categoryName: productData.categoryName || 'Beras',
        description: productData.description || '',
        normalPrice: productData.normalPrice || 10000,
        promoPrice: productData.promoPrice,
        unit: productData.unit || 'pcs',
        stock: productData.stock ?? 10,
        minStock: productData.minStock ?? 5,
        weightGrams: productData.weightGrams || 500,
        imageUrl:
          productData.imageUrl ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        galleryUrls: productData.galleryUrls || [],
        isAvailable: productData.isAvailable ?? true,
        minPurchase: productData.minPurchase || 1,
        rating: 5.0,
        reviewCount: 0,
        soldCount: 0,
        brand: productData.brand || 'Warungku',
        sku: productData.sku || `WK-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: now,
        updatedAt: now,
      };
      this.products.unshift(saved);
      this.logActivity('ADD_PRODUCT', 'Produk', `Menambahkan produk baru: ${saved.name} untuk toko ${saved.sellerStoreName}`);
    }

    this.setItem(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
    return saved!;
  }

  public deleteProduct(id: string): void {
    const product = this.getProductById(id);
    this.products = this.products.filter((p) => p.id !== id);
    this.setItem(STORAGE_KEYS.PRODUCTS, this.products);
    if (product) {
      this.logActivity('DELETE_PRODUCT', 'Produk', `Menghapus produk: ${product.name}`);
    }
    this.notify();
  }

  public getCategories(): Category[] {
    return [...this.categories];
  }

  public saveCategory(categoryData: Partial<Category>): Category {
    let saved: Category;
    if (categoryData.id && this.categories.some((c) => c.id === categoryData.id)) {
      this.categories = this.categories.map((c) => {
        if (c.id === categoryData.id) {
          saved = { ...c, ...categoryData };
          return saved;
        }
        return c;
      });
    } else {
      saved = {
        id: `cat-${Date.now()}`,
        name: categoryData.name || 'Kategori Baru',
        slug: (categoryData.name || 'kategori-baru').toLowerCase().replace(/\s+/g, '-'),
        iconName: categoryData.iconName || 'Package',
        description: categoryData.description || '',
      };
      this.categories.push(saved);
    }
    this.setItem(STORAGE_KEYS.CATEGORIES, this.categories);
    this.notify();
    return saved!;
  }

  public deleteCategory(id: string): void {
    this.categories = this.categories.filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.CATEGORIES, this.categories);
    this.notify();
  }

  // ===================== CART =====================

  public getCart(): CartItem[] {
    return [...this.cart];
  }

  public addToCart(productId: string, quantity: number = 1): void {
    const product = this.getProductById(productId);
    if (!product || product.stock <= 0) return;

    const existingIndex = this.cart.findIndex((c) => c.productId === productId);
    if (existingIndex > -1) {
      const newQty = Math.min(this.cart[existingIndex].quantity + quantity, product.stock);
      this.cart[existingIndex].quantity = newQty;
    } else {
      this.cart.push({
        productId,
        quantity: Math.min(quantity, product.stock),
        selected: true,
      });
    }
    this.setItem(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public updateCartQuantity(productId: string, quantity: number): void {
    const product = this.getProductById(productId);
    if (!product) return;

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const item = this.cart.find((c) => c.productId === productId);
    if (item) {
      item.quantity = Math.min(quantity, product.stock);
      this.setItem(STORAGE_KEYS.CART, this.cart);
      this.notify();
    }
  }

  public toggleCartSelect(productId: string): void {
    const item = this.cart.find((c) => c.productId === productId);
    if (item) {
      item.selected = !item.selected;
      this.setItem(STORAGE_KEYS.CART, this.cart);
      this.notify();
    }
  }

  public toggleSelectAllCart(selected: boolean): void {
    this.cart.forEach((c) => (c.selected = selected));
    this.setItem(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public removeFromCart(productId: string): void {
    this.cart = this.cart.filter((c) => c.productId !== productId);
    this.setItem(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public clearCart(): void {
    this.cart = [];
    this.setItem(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public getCartCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  // ===================== ORDERS =====================

  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrdersBySeller(sellerId: string): Order[] {
    return this.orders.filter((o) => o.sellerId === sellerId);
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Order {
    // Check if buyer is restricted
    const buyer = this.users.find((u) => u.id === orderPayload.userId);
    if (buyer && buyer.status === 'RESTRICTED') {
      throw new Error(`Akun Anda telah dibatasi oleh Super Admin: "${buyer.restrictedReason || 'Pelanggaran ketentuan platform'}". Anda tidak dapat membuat pesanan.`);
    }

    const now = new Date().toISOString();
    const count = this.orders.length + 1;
    const pad = String(count).padStart(6, '0');
    const orderNumber = `WK-2026-${pad}`;

    // Resolve sellerId & sellerStoreName
    let sellerId = orderPayload.sellerId;
    let sellerStoreName = orderPayload.sellerStoreName;
    if (!sellerId && orderPayload.items.length > 0) {
      const firstItemProd = this.getProductById(orderPayload.items[0].productId);
      if (firstItemProd?.sellerId) {
        sellerId = firstItemProd.sellerId;
        sellerStoreName = firstItemProd.sellerStoreName;
      }
    }

    // Platform admin fee (deducted/allocated to superadmin)
    const adminFee = orderPayload.adminFee ?? (this.settings.platformAdminFee || 1000);

    const newOrder: Order = {
      ...orderPayload,
      id: `ord-${Date.now()}`,
      orderNumber,
      sellerId,
      sellerStoreName,
      adminFee,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: orderPayload.orderStatus,
          timestamp: now,
          note: 'Pesanan berhasil dibuat oleh pelanggan',
        },
      ],
    };

    // Credit platform fee to Super Admin earnings
    if (!this.settings.superAdminEarnings) {
      this.settings.superAdminEarnings = {
        totalFeeAccumulated: 0,
        currentBalance: 0,
        totalWithdrawn: 0,
      };
    }
    this.settings.superAdminEarnings.totalFeeAccumulated += adminFee;
    this.settings.superAdminEarnings.currentBalance += adminFee;
    this.setItem(STORAGE_KEYS.SETTINGS, this.settings);

    // Deduct stock for all items
    orderPayload.items.forEach((item) => {
      this.adjustProductStock(item.productId, -item.quantity, 'SALE', `Penjualan pesanan ${orderNumber}`);
    });

    this.orders.unshift(newOrder);
    this.setItem(STORAGE_KEYS.ORDERS, this.orders);

    // Remove ordered items from cart
    const orderedProductIds = new Set(orderPayload.items.map((i) => i.productId));
    this.cart = this.cart.filter((c) => !orderedProductIds.has(c.productId));
    this.setItem(STORAGE_KEYS.CART, this.cart);

    // Send customer notification
    this.addNotification({
      userId: newOrder.userId,
      title: 'Pesanan Berhasil Dibuat!',
      message: `Pesanan ${newOrder.orderNumber} dengan total Rp ${newOrder.grandTotal.toLocaleString('id-ID')} telah diterima. Biaya admin platform: Rp ${adminFee.toLocaleString('id-ID')}.`,
      type: 'ORDER',
      orderId: newOrder.id,
      read: false,
    });

    // Send seller notification
    if (sellerId) {
      this.addNotification({
        userId: sellerId,
        title: '🔔 Pesanan Baru Masuk!',
        message: `Toko "${sellerStoreName || 'Warung'}" menerima pesanan baru ${newOrder.orderNumber} dari ${newOrder.customerName}.`,
        type: 'ORDER',
        orderId: newOrder.id,
        read: false,
      });
    }

    // Send Super Admin notification
    this.addNotification({
      targetRole: 'SUPER_ADMIN',
      title: `💰 Keuntungan Admin Masuk (+Rp ${adminFee.toLocaleString('id-ID')})`,
      message: `Potongan pembayaran admin Rp ${adminFee.toLocaleString('id-ID')} dari transaksi ${newOrder.orderNumber} berhasil dicatat ke saldo Super Admin.`,
      type: 'SYSTEM',
      orderId: newOrder.id,
      read: false,
    });

    this.logActivity('CREATE_ORDER', 'Pesanan', `Pelanggan membuat pesanan baru ${newOrder.orderNumber}. Super Admin mendapat komisi Rp ${adminFee.toLocaleString('id-ID')}.`);

    this.notify();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, note?: string): void {
    const order = this.getOrderById(orderId);
    if (!order) return;

    const now = new Date().toISOString();
    order.orderStatus = status;
    order.updatedAt = now;

    if (status === 'COMPLETED' || status === 'ARRIVED') {
      order.paymentStatus = 'PAID';
    }

    order.statusHistory.push({
      status,
      timestamp: now,
      note: note || `Status diperbarui menjadi ${status}`,
    });

    this.setItem(STORAGE_KEYS.ORDERS, this.orders);

    // Notify customer on status update
    let customerMsg = `Pesanan ${order.orderNumber} status: ${status}.`;
    if (status === 'PROCESSING') customerMsg = `Pesanan ${order.orderNumber} sedang diproses dan disiapkan oleh tim warung.`;
    if (status === 'PACKING') customerMsg = `Pesanan ${order.orderNumber} sedang dikemas dengan rapi.`;
    if (status === 'DELIVERING') customerMsg = `Pesanan ${order.orderNumber} sedang diantar oleh kurir ${order.courierName || 'warung'}.`;
    if (status === 'ARRIVED') customerMsg = `Kurir telah sampai di lokasi alamat Anda.`;
    if (status === 'COMPLETED') customerMsg = `Pesanan ${order.orderNumber} telah selesai. Terima kasih telah berbelanja!`;
    if (status === 'CANCELLED') customerMsg = `Pesanan ${order.orderNumber} telah dibatalkan.`;

    this.addNotification({
      userId: order.userId,
      title: `Update Pesanan ${order.orderNumber}`,
      message: customerMsg,
      type: 'ORDER',
      orderId: order.id,
      read: false,
    });

    this.logActivity('UPDATE_ORDER_STATUS', 'Pesanan', `Mengubah status pesanan ${order.orderNumber} ke ${status}`);
    this.notify();
  }

  public assignCourier(orderId: string, courierId: string, courierName: string, courierPhone: string): void {
    const order = this.getOrderById(orderId);
    if (!order) return;

    order.courierId = courierId;
    order.courierName = courierName;
    order.courierPhone = courierPhone;
    order.updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.ORDERS, this.orders);

    // Notify courier
    this.addNotification({
      userId: courierId,
      title: '📦 Tugas Pengantaran Baru!',
      message: `Anda ditugaskan mengantar pesanan ${order.orderNumber} ke ${order.shippingAddress?.street || 'pelanggan'}.`,
      type: 'ORDER',
      orderId: order.id,
      read: false,
    });

    this.logActivity('ASSIGN_COURIER', 'Kurir', `Menugaskan kurir ${courierName} untuk pesanan ${order.orderNumber}`);
    this.notify();
  }

  public confirmPayment(orderId: string): void {
    const order = this.getOrderById(orderId);
    if (!order) return;

    order.paymentStatus = 'PAID';
    if (order.orderStatus === 'WAITING_PAYMENT' || order.orderStatus === 'CREATED') {
      order.orderStatus = 'PAYMENT_CONFIRMED';
      order.statusHistory.push({
        status: 'PAYMENT_CONFIRMED',
        timestamp: new Date().toISOString(),
        note: 'Pembayaran telah dikonfirmasi oleh Admin',
      });
    }

    this.setItem(STORAGE_KEYS.ORDERS, this.orders);

    this.addNotification({
      userId: order.userId,
      title: 'Pembayaran Dikonfirmasi!',
      message: `Pembayaran untuk pesanan ${order.orderNumber} telah kami terima.`,
      type: 'ORDER',
      orderId: order.id,
      read: false,
    });

    this.logActivity('CONFIRM_PAYMENT', 'Pembayaran', `Konfirmasi pembayaran untuk pesanan ${order.orderNumber}`);
    this.notify();
  }

  // ===================== INVENTORY / STOCKS =====================

  public adjustProductStock(productId: string, quantityDiff: number, type: StockMovement['type'], reason: string): void {
    const product = this.getProductById(productId);
    if (!product) return;

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + quantityDiff);
    product.stock = newStock;
    product.updatedAt = new Date().toISOString();

    const currentUser = this.getCurrentUser();
    const movement: StockMovement = {
      id: `sm-${Date.now()}-${Math.random()}`,
      productId,
      productName: product.name,
      type,
      quantity: quantityDiff,
      previousStock,
      currentStock: newStock,
      reason,
      timestamp: new Date().toISOString(),
      recordedBy: currentUser.name,
    };

    this.stockMovements.unshift(movement);
    this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, this.stockMovements);
    this.setItem(STORAGE_KEYS.PRODUCTS, this.products);

    // Low stock warning notification for admin
    if (newStock <= product.minStock) {
      this.addNotification({
        targetRole: 'ADMIN',
        title: '⚠ Peringatan Stok Menipis!',
        message: `Stok produk ${product.name} tersisa ${newStock} ${product.unit} (Batas minimum: ${product.minStock}).`,
        type: 'STOCK',
        read: false,
      });
    }

    this.notify();
  }

  public getStockMovements(): StockMovement[] {
    return [...this.stockMovements];
  }

  // ===================== VOUCHERS =====================

  public getVouchers(): PromoVoucher[] {
    return [...this.vouchers];
  }

  public saveVoucher(voucher: Partial<PromoVoucher>): PromoVoucher {
    let saved: PromoVoucher;
    if (voucher.id && this.vouchers.some((v) => v.id === voucher.id)) {
      this.vouchers = this.vouchers.map((v) => {
        if (v.id === voucher.id) {
          saved = { ...v, ...voucher } as PromoVoucher;
          return saved;
        }
        return v;
      });
    } else {
      saved = {
        id: `vch-${Date.now()}`,
        code: (voucher.code || 'HEMAT').toUpperCase().trim(),
        title: voucher.title || 'Voucher Promo',
        description: voucher.description || '',
        discountType: voucher.discountType || 'PERCENT',
        discountValue: voucher.discountValue || 10,
        minOrderAmount: voucher.minOrderAmount || 50000,
        maxDiscountAmount: voucher.maxDiscountAmount,
        validUntil: voucher.validUntil || '2026-12-31',
        isActive: voucher.isActive ?? true,
      };
      this.vouchers.push(saved);
    }
    this.setItem(STORAGE_KEYS.VOUCHERS, this.vouchers);
    this.logActivity('SAVE_VOUCHER', 'Promo', `Menyimpan voucher promo ${saved!.code}`);
    this.notify();
    return saved!;
  }

  public deleteVoucher(id: string): void {
    this.vouchers = this.vouchers.filter((v) => v.id !== id);
    this.setItem(STORAGE_KEYS.VOUCHERS, this.vouchers);
    this.notify();
  }

  public validateVoucher(code: string, orderSubtotal: number): { valid: boolean; discount: number; message: string; voucher?: PromoVoucher } {
    const voucher = this.vouchers.find((v) => v.code.toUpperCase() === code.toUpperCase().trim() && v.isActive);
    if (!voucher) {
      return { valid: false, discount: 0, message: 'Kode voucher tidak valid atau sudah kedaluwarsa' };
    }

    if (orderSubtotal < voucher.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Minimal belanja untuk voucher ini adalah Rp ${voucher.minOrderAmount.toLocaleString('id-ID')}`,
      };
    }

    let discount = 0;
    if (voucher.discountType === 'PERCENT') {
      discount = Math.round((orderSubtotal * voucher.discountValue) / 100);
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
    } else if (voucher.discountType === 'FIXED') {
      discount = voucher.discountValue;
    } else if (voucher.discountType === 'FREE_SHIPPING') {
      discount = voucher.discountValue || 10000;
    }

    return {
      valid: true,
      discount,
      message: `Voucher ${voucher.code} berhasil diterapkan! Hemat Rp ${discount.toLocaleString('id-ID')}`,
      voucher,
    };
  }

  // ===================== REVIEWS =====================

  public getReviews(productId?: string): Review[] {
    if (productId) {
      return this.reviews.filter((r) => r.productId === productId);
    }
    return [...this.reviews];
  }

  public addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(newRev);
    this.setItem(STORAGE_KEYS.REVIEWS, this.reviews);

    // Update product rating
    const prodReviews = this.reviews.filter((r) => r.productId === reviewData.productId);
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      prod.rating = Number(avgRating.toFixed(1));
      prod.reviewCount = prodReviews.length;
      this.setItem(STORAGE_KEYS.PRODUCTS, this.products);
    }

    // Mark order as rated
    const order = this.getOrderById(reviewData.orderId);
    if (order) {
      order.ratingGiven = reviewData.rating;
      this.setItem(STORAGE_KEYS.ORDERS, this.orders);
    }

    this.notify();
    return newRev;
  }

  // ===================== WISHLIST =====================

  public getWishlist(): string[] {
    return [...this.wishlist];
  }

  public isWishlisted(productId: string): boolean {
    return this.wishlist.includes(productId);
  }

  public toggleWishlist(productId: string): boolean {
    if (this.wishlist.includes(productId)) {
      this.wishlist = this.wishlist.filter((id) => id !== productId);
    } else {
      this.wishlist.push(productId);
    }
    this.setItem(STORAGE_KEYS.WISHLIST, this.wishlist);
    this.notify();
    return this.isWishlisted(productId);
  }

  // ===================== NOTIFICATIONS =====================

  public getNotifications(role?: UserRole, userId?: string): NotificationItem[] {
    return this.notifications.filter((n) => {
      if (userId && n.userId === userId) return true;
      if (role && (n.targetRole === role || n.targetRole === 'ALL')) return true;
      if (!n.userId && !n.targetRole) return true;
      return false;
    });
  }

  public getUnreadNotificationCount(role?: UserRole, userId?: string): number {
    return this.getNotifications(role, userId).filter((n) => !n.read).length;
  }

  public addNotification(notification: Omit<NotificationItem, 'id' | 'createdAt'>): void {
    const newNotif: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationRead(id: string): void {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.notify();
    }
  }

  public markAllNotificationsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // ===================== SETTINGS & AUDIT =====================

  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  public updateSettings(updated: Partial<SystemSettings>): void {
    this.settings = { ...this.settings, ...updated };
    this.setItem(STORAGE_KEYS.SETTINGS, this.settings);
    this.logActivity('UPDATE_SETTINGS', 'Sistem', 'Memperbarui konfigurasi sistem & warung');
    this.notify();
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  private logActivity(action: string, module: string, description: string): void {
    const currentUser = this.getCurrentUser();
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      description,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  public toggleCartItemSelection(productId: string): void {
    this.toggleCartSelect(productId);
  }

  public selectAllCartItems(selected: boolean): void {
    this.toggleSelectAllCart(selected);
  }

  public setDefaultAddress(addressId: string): void {
    const user = this.getCurrentUser();
    const newAddresses = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    this.updateUserProfile({ addresses: newAddresses });
  }

  public deleteAddress(addressId: string): void {
    const user = this.getCurrentUser();
    const newAddresses = user.addresses.filter((a) => a.id !== addressId);
    if (newAddresses.length > 0 && !newAddresses.some((a) => a.isDefault)) {
      newAddresses[0].isDefault = true;
    }
    this.updateUserProfile({ addresses: newAddresses });
  }

  public updateOrderPayment(orderId: string, status: 'UNPAID' | 'PAID' | 'VERIFYING', proofUrl?: string): void {
    const order = this.getOrderById(orderId);
    if (!order) return;
    order.paymentStatus = status;
    if (proofUrl) order.paymentProofUrl = proofUrl;
    order.updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
  }

  public addProduct(productData: Partial<Product>): Product {
    return this.saveProduct(productData);
  }

  public updateProduct(id: string, productData: Partial<Product>): Product {
    return this.saveProduct({ ...productData, id });
  }

  public updateStock(productId: string, newStock: number, type: 'RESTOCK' | 'CORRECTION' | 'SALE' = 'CORRECTION', reason: string = 'Penyesuaian stok'): void {
    const product = this.getProductById(productId);
    if (!product) return;
    const diff = newStock - product.stock;
    const movementType = type === 'RESTOCK' ? 'IN' : diff < 0 ? 'OUT' : 'ADJUSTMENT';
    this.adjustProductStock(productId, diff, movementType, reason);
  }

  public getStockLogs(productId?: string): StockMovement[] {
    if (productId) {
      return this.stockMovements.filter((s) => s.productId === productId);
    }
    return [...this.stockMovements];
  }

  public addVoucher(voucher: Partial<PromoVoucher>): PromoVoucher {
    return this.saveVoucher(voucher);
  }

  public toggleVoucher(id: string, active: boolean): void {
    const v = this.vouchers.find((item) => item.id === id);
    if (v) {
      v.isActive = active;
      this.setItem(STORAGE_KEYS.VOUCHERS, this.vouchers);
      this.notify();
    }
  }

  public resetToDefault(): void {
    this.resetToSeedData();
  }

  /**
   * Helper to reset to seed data for testing
   */
  public resetToSeedData(): void {
    this.products = INITIAL_PRODUCTS;
    this.categories = INITIAL_CATEGORIES;
    this.cart = [];
    this.orders = INITIAL_ORDERS;
    this.users = INITIAL_USERS;
    this.settings = INITIAL_SETTINGS;
    this.vouchers = INITIAL_VOUCHERS;
    this.wishlist = ['prod-1', 'prod-4'];
    this.notifications = [];
    this.stockMovements = [];

    this.setItem(STORAGE_KEYS.PRODUCTS, this.products);
    this.setItem(STORAGE_KEYS.CATEGORIES, this.categories);
    this.setItem(STORAGE_KEYS.CART, this.cart);
    this.setItem(STORAGE_KEYS.ORDERS, this.orders);
    this.setItem(STORAGE_KEYS.USERS, this.users);
    this.setItem(STORAGE_KEYS.SETTINGS, this.settings);
    this.setItem(STORAGE_KEYS.VOUCHERS, this.vouchers);
    this.setItem(STORAGE_KEYS.WISHLIST, this.wishlist);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, this.stockMovements);
    this.notify();
  }
}

export const store = new StoreService();
