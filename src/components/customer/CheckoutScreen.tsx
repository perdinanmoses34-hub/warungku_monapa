import React, { useState } from 'react';
import {
  Address,
  CartItem,
  DeliveryMethod,
  Order,
  PaymentMethod,
  Product,
  PromoVoucher,
  SystemSettings,
  User,
} from '../../types';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import { PaymentService } from '../../services/paymentService';
import { store } from '../../services/storeService';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Plus,
  Truck,
  Store,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  Check,
  AlertCircle,
  Upload,
  Copy,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  X,
} from 'lucide-react';

interface Props {
  currentUser: User;
  cart: CartItem[];
  products: Product[];
  settings: SystemSettings;
  onOrderSuccess: (order: Order) => void;
  onBackToCart: () => void;
}

export const CheckoutScreen: React.FC<Props> = ({
  currentUser,
  cart,
  products,
  settings,
  onOrderSuccess,
  onBackToCart,
}) => {
  // Filter only selected items
  const selectedItems = cart.filter((c) => c.selected);
  const itemsWithProduct = selectedItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      name: product?.name || 'Produk Sembako',
      price: product ? (product.promoPrice || product.normalPrice) : 0,
      quantity: item.quantity,
      unit: product?.unit || 'pcs',
      weightGrams: product?.weightGrams || 500,
      subtotal: (product ? (product.promoPrice || product.normalPrice) : 0) * item.quantity,
      imageUrl: product?.imageUrl || '',
    };
  });

  const subtotal = itemsWithProduct.reduce((sum, i) => sum + i.subtotal, 0);
  const totalWeight = itemsWithProduct.reduce((sum, i) => sum + i.weightGrams * i.quantity, 0);

  // Delivery Method state
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');

  // Address selection
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    currentUser.addresses.find((a) => a.isDefault)?.id || currentUser.addresses[0]?.id || ''
  );
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState<Partial<Address>>({
    label: 'Rumah',
    recipientName: currentUser.name,
    phone: currentUser.phone,
    street: '',
    kelurahan: 'Sukamaju',
    kecamatan: 'Cilodong',
    city: 'Depok',
    postalCode: '16415',
    notes: '',
  });

  // Scheduled order
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('Besok Pagi');
  const [scheduledSlot, setScheduledSlot] = useState<string>('08:00 - 10:00 WIB');

  // Courier Note
  const [courierNote, setCourierNote] = useState<string>('Rumah pagar hitam di samping warung sate, ada bel di tiang.');

  // Voucher
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<PromoVoucher | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [voucherError, setVoucherError] = useState<string>('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [selectedBankId, setSelectedBankId] = useState<string>(settings.bankAccounts[0]?.id || '');
  const [selectedWalletName, setSelectedWalletName] = useState<string>(settings.ewallets[0]?.walletName || 'GoPay');
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery fee calculation
  const isFreeDelivery = subtotal >= settings.deliverySettings.freeShippingMinOrder || appliedVoucher?.discountType === 'FREE_SHIPPING';
  const deliveryFee = deliveryMethod === 'PICKUP' ? 0 : isFreeDelivery ? 0 : settings.deliverySettings.baseFee;
  const grandTotal = Math.max(0, subtotal + deliveryFee - voucherDiscount);

  const currentAddress = currentUser.addresses.find((a) => a.id === selectedAddressId) || currentUser.addresses[0];
  const selectedBank = settings.bankAccounts.find((b) => b.id === selectedBankId) || settings.bankAccounts[0];
  const selectedWallet = settings.ewallets.find((w) => w.walletName === selectedWalletName) || settings.ewallets[0];

  // Apply voucher code
  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || voucherInput).trim();
    if (!code) return;

    const result = store.validateVoucher(code, subtotal);
    if (result.valid && result.voucher) {
      setAppliedVoucher(result.voucher);
      setVoucherDiscount(result.discount);
      setVoucherError('');
    } else {
      setAppliedVoucher(null);
      setVoucherDiscount(0);
      setVoucherError(result.message);
    }
  };

  // Add new address
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.street) return;

    store.saveAddress(newAddressForm);
    setShowAddAddressModal(false);
    // select the newly added address
    const updatedUser = store.getCurrentUser();
    const latestAddr = updatedUser.addresses[updatedUser.addresses.length - 1];
    if (latestAddr) {
      setSelectedAddressId(latestAddr.id);
    }
  };

  // Simulate payment proof file selection
  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle final checkout submission
  const handleCreateOrder = async () => {
    if (deliveryMethod === 'DELIVERY' && !currentAddress) {
      alert('Silakan pilih atau tambahkan alamat pengantaran terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process payment through modular service
      const paymentResult = await PaymentService.processPayment(paymentMethod, {
        order: { subtotal, grandTotal },
        bank: selectedBank,
        ewallet: selectedWallet,
        proofUrl: paymentProofPreview,
        customerPhone: currentUser.phone,
      });

      // Construct order
      const newOrder = store.createOrder({
        userId: currentUser.id,
        customerName: currentAddress ? currentAddress.recipientName : currentUser.name,
        customerPhone: currentAddress ? currentAddress.phone : currentUser.phone,
        deliveryMethod,
        shippingAddress: deliveryMethod === 'DELIVERY' ? currentAddress : undefined,
        items: itemsWithProduct,
        subtotal,
        deliveryFee,
        discount: voucherDiscount,
        voucherCode: appliedVoucher?.code,
        grandTotal,
        paymentMethod,
        paymentStatus: paymentResult.paymentStatus,
        paymentProofUrl: paymentProofPreview || undefined,
        paymentChannelInfo: paymentResult.paymentChannelInfo,
        orderStatus: paymentMethod === 'COD' ? 'CREATED' : paymentMethod === 'EWALLET' ? 'PAYMENT_CONFIRMED' : 'WAITING_PAYMENT',
        deliveryNotes: courierNote,
        isScheduled,
        scheduledDate: isScheduled ? scheduledDate : undefined,
        scheduledTimeSlot: isScheduled ? scheduledSlot : undefined,
        estimatedDeliveryMinutes: settings.deliverySettings.estimatedMinutesBase,
      });

      // Trigger festive celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      onOrderSuccess(newOrder);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pesanan.';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyBankAccount = () => {
    if (selectedBank) {
      navigator.clipboard.writeText(selectedBank.accountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  // Open WhatsApp for support / order fallback
  const handleOpenWhatsAppSupport = () => {
    const text = encodeURIComponent(
      `Halo WARUNGKU, saya ingin bertanya mengenai pesanan sembako saya atas nama ${currentUser.name}. Total belanja: ${formatRupiah(grandTotal)}.`
    );
    window.open(`https://wa.me/${settings.storePhone}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 pb-28 space-y-4">
      {/* Header back & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToCart}
          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
            Checkout Pesanan Sembako
          </h1>
          <p className="text-xs text-stone-500">Pilih opsi pengiriman dan metode pembayaran</p>
        </div>
      </div>

      {/* 1. OPSI PENGIRIMAN: ANTAR KE ALAMAT vs AMBIL DI WARUNG */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          1. Metode Pengantaran
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeliveryMethod('DELIVERY')}
            className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
              deliveryMethod === 'DELIVERY'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${deliveryMethod === 'DELIVERY' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Antar ke Alamat</div>
              <div className="text-[11px] text-stone-500 mt-0.5">Kurir warung antar langsung</div>
              <div className="text-[11px] font-bold text-emerald-700 mt-1">
                {isFreeDelivery ? 'GRATIS ONGKIR' : formatRupiah(settings.deliverySettings.baseFee)}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryMethod('PICKUP')}
            className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition cursor-pointer ${
              deliveryMethod === 'PICKUP'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${deliveryMethod === 'PICKUP' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Ambil di Warung</div>
              <div className="text-[11px] text-stone-500 mt-0.5">Siap diambil saat selesai dikemas</div>
              <div className="text-[11px] font-bold text-emerald-700 mt-1">Bebas Biaya (Rp 0)</div>
            </div>
          </button>
        </div>

        {/* Delivery Address Details */}
        {deliveryMethod === 'DELIVERY' && (
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Alamat Pengantaran
              </span>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Alamat
              </button>
            </div>

            {/* Address cards */}
            <div className="space-y-2">
              {currentUser.addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    selectedAddressId === addr.id
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{addr.recipientName} ({addr.label})</span>
                    <span className="text-stone-500">{addr.phone}</span>
                  </div>
                  <p className="text-stone-600 mt-1">
                    {addr.street}, Kel. {addr.kelurahan}, Kec. {addr.kecamatan}, {addr.city}
                  </p>
                  {addr.notes && (
                    <p className="text-amber-700 text-[11px] mt-0.5 font-medium">
                      Patokan: {addr.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Note for courier */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Catatan Tambahan untuk Kurir:
              </label>
              <input
                type="text"
                value={courierNote}
                onChange={(e) => setCourierNote(e.target.value)}
                placeholder="Contoh: Rumah pagar hitam, dekat masjid, tolong panggil nama Bu Ratna"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              />
            </div>
          </div>
        )}

        {/* Pickup address info */}
        {deliveryMethod === 'PICKUP' && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <p className="font-bold text-stone-900">{settings.storeName}</p>
            <p>{settings.storeAddress}</p>
            <p className="text-emerald-700 font-medium">
              Silakan ambil pesanan Anda setelah status berubah menjadi "Sedang Dikemas / Siap Diambil".
            </p>
          </div>
        )}
      </div>

      {/* 2. PESANAN TERJADWAL (SCHEDULED ORDERS) */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="text-xs font-bold text-stone-800">Waktu Pengantaran</h2>
              <p className="text-[11px] text-stone-400">Pesan sekarang atau jadwalkan untuk nanti</p>
            </div>
          </div>

          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setIsScheduled(false)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                !isScheduled ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-500'
              }`}
            >
              Kirim Sekarang
            </button>
            <button
              onClick={() => setIsScheduled(true)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                isScheduled ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-500'
              }`}
            >
              Pesan untuk Nanti
            </button>
          </div>
        </div>

        {isScheduled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Pilih Hari:</label>
              <select
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Hari Ini (Sore / Malam)">Hari Ini (Sore / Malam)</option>
                <option value="Besok Pagi">Besok Pagi</option>
                <option value="Besok Siang">Besok Siang</option>
                <option value="Lusa">Lusa</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Pilihan Slot Jam Pengantaran:</label>
              <select
                value={scheduledSlot}
                onChange={(e) => setScheduledSlot(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="07:00 - 09:00 WIB (Pagi Banget)">07:00 - 09:00 WIB (Pagi Banget)</option>
                <option value="09:00 - 11:00 WIB (Pagi Siang)">09:00 - 11:00 WIB (Pagi Siang)</option>
                <option value="13:00 - 15:00 WIB (Siang)">13:00 - 15:00 WIB (Siang)</option>
                <option value="16:00 - 18:00 WIB (Sore Masak)">16:00 - 18:00 WIB (Sore Masak)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. VOUCHER & DISKON */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-2">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-emerald-600" />
          Voucher & Promo Hemat
        </h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
            placeholder="Masukkan kode voucher (e.g. WARUNGHEMAT, GRATISONGKIR)"
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs uppercase focus:ring-2 focus:ring-emerald-600 outline-none"
          />
          <button
            onClick={() => handleApplyVoucher()}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Terapkan
          </button>
        </div>

        {/* Quick voucher chip suggestions */}
        <div className="flex gap-2 overflow-x-auto pt-1 no-scrollbar">
          {store.getVouchers().map((vch) => (
            <button
              key={vch.id}
              onClick={() => {
                setVoucherInput(vch.code);
                handleApplyVoucher(vch.code);
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer"
            >
              🏷️ {vch.code} ({vch.title})
            </button>
          ))}
        </div>

        {appliedVoucher && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <div>
              <span className="font-bold">✓ Voucher {appliedVoucher.code} Aktif!</span>
              <p className="text-[11px] text-emerald-600 mt-0.5">{appliedVoucher.description}</p>
            </div>
            <button
              onClick={() => {
                setAppliedVoucher(null);
                setVoucherDiscount(0);
                setVoucherInput('');
              }}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {voucherError && (
          <p className="text-xs text-rose-600 font-medium">{voucherError}</p>
        )}
      </div>

      {/* 4. METODE PEMBAYARAN */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          2. Metode Pembayaran
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* COD */}
          <button
            type="button"
            onClick={() => setPaymentMethod('COD')}
            className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition cursor-pointer ${
              paymentMethod === 'COD'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Banknote className={`w-5 h-5 ${paymentMethod === 'COD' ? 'text-emerald-600' : 'text-stone-500'}`} />
            <div>
              <div className="text-xs font-bold text-stone-900">Bayar Tunai (COD)</div>
              <div className="text-[10px] text-stone-500">Bayar langsung saat barang tiba</div>
            </div>
          </button>

          {/* Transfer Bank */}
          <button
            type="button"
            onClick={() => setPaymentMethod('BANK_TRANSFER')}
            className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition cursor-pointer ${
              paymentMethod === 'BANK_TRANSFER'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <CreditCard className={`w-5 h-5 ${paymentMethod === 'BANK_TRANSFER' ? 'text-emerald-600' : 'text-stone-500'}`} />
            <div>
              <div className="text-xs font-bold text-stone-900">Transfer Bank</div>
              <div className="text-[10px] text-stone-500">BCA, Mandiri, BRI</div>
            </div>
          </button>

          {/* E-Wallet */}
          <button
            type="button"
            onClick={() => setPaymentMethod('EWALLET')}
            className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition cursor-pointer ${
              paymentMethod === 'EWALLET'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <QrCode className={`w-5 h-5 ${paymentMethod === 'EWALLET' ? 'text-emerald-600' : 'text-stone-500'}`} />
            <div>
              <div className="text-xs font-bold text-stone-900">E-Wallet / QRIS</div>
              <div className="text-[10px] text-stone-500">GoPay, OVO, DANA, ShopeePay</div>
            </div>
          </button>
        </div>

        {/* Bank Transfer Details */}
        {paymentMethod === 'BANK_TRANSFER' && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
            <p className="font-bold text-stone-800">Pilih Rekening Tujuan Transfer:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {settings.bankAccounts.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBankId(b.id)}
                  className={`p-2.5 rounded-xl border bg-white cursor-pointer transition ${
                    selectedBankId === b.id ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-stone-200'
                  }`}
                >
                  <div className="font-black text-stone-900">{b.bankName}</div>
                  <div className="font-mono text-[11px] text-stone-600">{b.accountNumber}</div>
                  <div className="text-[10px] text-stone-400">a.n {b.accountHolder}</div>
                </div>
              ))}
            </div>

            {selectedBank && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-700 block">No. Rekening {selectedBank.bankName}:</span>
                  <span className="font-mono text-sm font-black text-emerald-900">
                    {selectedBank.accountNumber}
                  </span>
                  <span className="text-[11px] text-emerald-700 block">a.n {selectedBank.accountHolder}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBankAccount}
                  className="px-3 py-1.5 bg-white text-emerald-800 rounded-lg font-bold shadow-2xs border border-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            )}

            {/* Proof of payment upload simulation */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Upload Bukti Transfer (Opsional):
              </label>
              <div className="flex items-center gap-3">
                <label className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-700 text-xs font-semibold cursor-pointer hover:bg-stone-50 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Foto Bukti</span>
                  <input type="file" accept="image/*" onChange={handleUploadProof} className="hidden" />
                </label>
                {paymentProofPreview && (
                  <div className="flex items-center gap-2">
                    <img src={paymentProofPreview} alt="Bukti" className="w-9 h-9 object-cover rounded-lg border border-stone-300" />
                    <span className="text-emerald-600 text-xs font-bold">Bukti terlampir!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* E-Wallet QR Code simulation */}
        {paymentMethod === 'EWALLET' && (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-3">
            <p className="font-bold text-stone-800">Pilih Dompet Digital:</p>
            <div className="flex flex-wrap gap-2">
              {settings.ewallets.map((ew) => (
                <button
                  key={ew.id}
                  type="button"
                  onClick={() => setSelectedWalletName(ew.walletName)}
                  className={`px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                    selectedWalletName === ew.walletName
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {ew.walletName}
                </button>
              ))}
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WARUNGKU-${selectedWalletName}-${grandTotal}`}
                alt="QRIS Warungku"
                className="w-28 h-28 border border-stone-200 rounded-lg p-1"
              />
              <div className="space-y-1 text-center sm:text-left">
                <span className="font-bold text-stone-900 block text-sm">QRIS {selectedWalletName} Warungku</span>
                <p className="text-stone-500 text-[11px]">
                  Buka aplikasi {selectedWalletName} di smartphone Anda, pilih scan QRIS, lalu konfirmasi pembayaran.
                </p>
                <p className="font-black text-emerald-800 text-base mt-1">
                  {formatRupiah(grandTotal)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. ITEM SUMMARY & FINAL BILL */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3 text-xs">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          3. Rincian Belanja ({itemsWithProduct.length} Produk)
        </h2>

        <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto pr-1">
          {itemsWithProduct.map((item) => (
            <div key={item.productId} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-stone-100" />
                <div>
                  <p className="font-bold text-stone-800 line-clamp-1">{item.name}</p>
                  <p className="text-[11px] text-stone-400">
                    {item.quantity} {item.unit} x {formatRupiah(item.price)}
                  </p>
                </div>
              </div>
              <span className="font-extrabold text-stone-900">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-100 pt-3 space-y-1.5">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal Belanja</span>
            <span className="font-bold text-stone-900">{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Biaya Pengantaran ({deliveryMethod === 'DELIVERY' ? 'Antar Alamat' : 'Ambil di Warung'})</span>
            <span className={`font-bold ${deliveryFee === 0 ? 'text-emerald-600' : 'text-stone-900'}`}>
              {deliveryFee === 0 ? 'GRATIS' : formatRupiah(deliveryFee)}
            </span>
          </div>
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Diskon Voucher ({appliedVoucher?.code})</span>
              <span>- {formatRupiah(voucherDiscount)}</span>
            </div>
          )}

          <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-black text-stone-900">Total Tagihan</span>
              <span className="block text-[10px] text-stone-400">Termasuk pajak & layanan antar</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-emerald-800">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>

        {/* WhatsApp Order Fallback (Section 46 requirement) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpenWhatsAppSupport}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Butuh Bantuan? Hubungi Warung via WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Sticky Bottom "Buat Pesanan" Button */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 sm:p-4 shadow-xl z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-stone-400 block">Total yang Harus Dibayar:</span>
            <span className="text-base sm:text-xl font-black text-emerald-800">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={isSubmitting || itemsWithProduct.length === 0}
            className="px-6 sm:px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Memproses Pesanan...</span>
            ) : (
              <>
                <span>Buat Pesanan Sekarang</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Tambah Alamat Baru */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <h3 className="font-bold text-sm text-stone-900">Tambah Alamat Pengiriman Baru</h3>
              <button onClick={() => setShowAddAddressModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAddress} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Label Alamat:</label>
                <select
                  value={newAddressForm.label}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, label: e.target.value as any })}
                  className="w-full p-2 border border-stone-300 rounded-xl outline-none"
                >
                  <option value="Rumah">Rumah</option>
                  <option value="Kantor">Kantor</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Penerima:</label>
                <input
                  type="text"
                  required
                  value={newAddressForm.recipientName}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, recipientName: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">No. HP / WhatsApp:</label>
                <input
                  type="tel"
                  required
                  value={newAddressForm.phone}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Alamat Lengkap (Jalan, RT/RW, No. Rumah):</label>
                <textarea
                  required
                  rows={2}
                  value={newAddressForm.street}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                  placeholder="Jl. Sukamaju No. 12 RT 02/04"
                  className="w-full p-2 border border-stone-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Kecamatan:</label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.kecamatan}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, kecamatan: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Kelurahan:</label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.kelurahan}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, kelurahan: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Patokan Rumah untuk Kurir:</label>
                <input
                  type="text"
                  value={newAddressForm.notes}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, notes: e.target.value })}
                  placeholder="Pagar cat hijau, samping bengkel motor"
                  className="w-full p-2 border border-stone-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
