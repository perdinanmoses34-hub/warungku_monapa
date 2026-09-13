import React, { useState, useEffect } from 'react';
import {
  CartItem,
  Category,
  Order,
  Product,
  PromoVoucher,
  SystemSettings,
  User,
} from './types';
import { store } from './services/storeService';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { OfflineBanner } from './components/common/OfflineBanner';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { HomeScreen } from './components/customer/HomeScreen';
import { CategoryScreen } from './components/customer/CategoryScreen';
import { CartScreen } from './components/customer/CartScreen';
import { CheckoutScreen } from './components/customer/CheckoutScreen';
import { OrderConfirmationModal } from './components/customer/OrderConfirmationModal';
import { OrdersScreen } from './components/customer/OrdersScreen';
import { ProfileScreen } from './components/customer/ProfileScreen';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { SearchModal } from './components/customer/SearchModal';
import { CourierScreen } from './components/courier/CourierScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Tag, X, Check } from 'lucide-react';
import { formatRupiah } from './utils/formatters';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [categories, setCategories] = useState<Category[]>(store.getCategories());
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [cart, setCart] = useState<CartItem[]>(store.getCart());
  const [settings, setSettings] = useState<SystemSettings>(store.getSettings());
  const [vouchers, setVouchers] = useState<PromoVoucher[]>(store.getVouchers());
  const [wishlist, setWishlist] = useState<string[]>(store.getWishlist());

  // Screen navigation: 'home' | 'categories' | 'cart' | 'checkout' | 'orders' | 'profile' | 'courier' | 'admin'
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');

  // Modals & Drawers
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setProducts(store.getProducts());
      setCategories(store.getCategories());
      setOrders(store.getOrders());
      setCart(store.getCart());
      setSettings(store.getSettings());
      setVouchers(store.getVouchers());
      setWishlist(store.getWishlist());
    });

    return () => unsubscribe();
  }, []);

  // Sync role changes
  useEffect(() => {
    if (currentUser.role === 'COURIER' && activeScreen === 'admin') {
      setActiveScreen('courier');
    } else if (currentUser.role === 'CUSTOMER' && (activeScreen === 'admin' || activeScreen === 'courier')) {
      setActiveScreen('home');
    }
  }, [currentUser.role]);

  // Derived state
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart
    .filter((c) => c.selected)
    .reduce((sum, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const price = p ? (p.promoPrice || p.normalPrice) : 0;
      return sum + price * item.quantity;
    }, 0);

  const cartMap = cart.reduce<Record<string, number>>((acc, item) => {
    acc[item.productId] = item.quantity;
    return acc;
  }, {});

  const wishlistSet = new Set(wishlist);
  const wishlistProducts = products.filter((p) => wishlistSet.has(p.id));

  const unreadNotifs = store.getNotifications(currentUser.role, currentUser.id).filter((n) => !n.read).length;

  const activeOrdersCount = orders.filter((o) =>
    o.userId === currentUser.id &&
    ['CREATED', 'WAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PACKING', 'READY_FOR_PICKUP', 'ON_DELIVERY', 'ARRIVED'].includes(o.orderStatus)
  ).length;

  // Toast Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Cart actions
  const handleAddToCart = (productId: string, quantity: number = 1) => {
    const prod = products.find((p) => p.id === productId);
    store.addToCart(productId, quantity);
    showToast(`✓ ${prod?.name || 'Produk'} ditambahkan ke keranjang!`);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    store.updateCartQuantity(productId, quantity);
  };

  const handleRemoveFromCart = (productId: string) => {
    store.removeFromCart(productId);
  };

  const handleToggleSelectCart = (productId: string) => {
    store.toggleCartItemSelection(productId);
  };

  const handleToggleSelectAllCart = (selected: boolean) => {
    store.selectAllCartItems(selected);
  };

  const handleInstantBuy = (productId: string, quantity: number) => {
    store.addToCart(productId, quantity);
    setSelectedProductDetail(null);
    setActiveScreen('checkout');
  };

  const handleToggleWishlist = (productId: string) => {
    store.toggleWishlist(productId);
  };

  const handleSelectCategoryFromHome = (catId: string) => {
    setSelectedCategoryTab(catId);
    setActiveScreen('categories');
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setActiveScreen('home');
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col selection:bg-emerald-200">
      {/* Offline Alert Indicator */}
      <OfflineBanner />

      {/* Main Header with Store Name, Role Switcher, Address, Search trigger, Cart & Notifications */}
      <Header
        currentUser={currentUser}
        cartCount={cartCount}
        unreadNotifsCount={unreadNotifs}
        settings={settings}
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCart={() => setActiveScreen('cart')}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Screen Router */}
      <main className="flex-1">
        {activeScreen === 'home' && (
          <HomeScreen
            products={products}
            categories={categories}
            settings={settings}
            cartCount={cartCount}
            cartTotal={cartTotal}
            cartMap={cartMap}
            wishlistSet={wishlistSet}
            onOpenProductDetail={(prod) => setSelectedProductDetail(prod)}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onToggleWishlist={handleToggleWishlist}
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectCategory={handleSelectCategoryFromHome}
            onOpenCart={() => setActiveScreen('cart')}
            onOpenVoucherModal={() => setShowVoucherModal(true)}
          />
        )}

        {activeScreen === 'categories' && (
          <CategoryScreen
            categories={categories}
            products={products}
            selectedCategoryId={selectedCategoryTab}
            onSelectCategory={(catId) => setSelectedCategoryTab(catId)}
            onOpenProductDetail={(prod) => setSelectedProductDetail(prod)}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            cartMap={cartMap}
            wishlistSet={wishlistSet}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activeScreen === 'cart' && (
          <CartScreen
            cart={cart}
            products={products}
            settings={settings}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveFromCart}
            onToggleSelect={handleToggleSelectCart}
            onToggleSelectAll={handleToggleSelectAllCart}
            onProceedCheckout={() => setActiveScreen('checkout')}
            onContinueShopping={() => setActiveScreen('home')}
          />
        )}

        {activeScreen === 'checkout' && (
          <CheckoutScreen
            currentUser={currentUser}
            cart={cart}
            products={products}
            settings={settings}
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => setActiveScreen('cart')}
          />
        )}

        {activeScreen === 'orders' && (
          <OrdersScreen
            orders={orders}
            settings={settings}
            userRole={currentUser.role}
            currentUserId={currentUser.id}
          />
        )}

        {activeScreen === 'profile' && (
          <ProfileScreen
            user={currentUser}
            settings={settings}
            wishlistProducts={wishlistProducts}
            onOpenProductDetail={(prod) => setSelectedProductDetail(prod)}
            onNavigateOrders={() => setActiveScreen('orders')}
          />
        )}

        {activeScreen === 'courier' && (
          <CourierScreen
            currentUser={currentUser}
            settings={settings}
            orders={orders}
          />
        )}

        {activeScreen === 'admin' && (
          <AdminDashboard
            orders={orders}
            products={products}
            categories={categories}
            settings={settings}
            vouchers={vouchers}
            userRole={currentUser.role}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav
        activeTab={activeScreen}
        onSelectTab={(tab) => setActiveScreen(tab)}
        cartCount={cartCount}
        activeOrdersCount={activeOrdersCount}
        userRole={currentUser.role}
      />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* In-App Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        role={currentUser.role}
        userId={currentUser.id}
        onSelectOrder={(orderId) => {
          setActiveScreen('orders');
        }}
      />

      {/* Search and Filter Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenProductDetail={(prod) => setSelectedProductDetail(prod)}
        onAddToCart={handleAddToCart}
        onUpdateCartQty={handleUpdateCartQty}
        cartMap={cartMap}
        wishlistSet={wishlistSet}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
          onAddToCart={handleAddToCart}
          onInstantBuy={handleInstantBuy}
          isWishlisted={wishlistSet.has(selectedProductDetail.id)}
          onToggleWishlist={handleToggleWishlist}
          onSelectRelatedProduct={(rel) => setSelectedProductDetail(rel)}
        />
      )}

      {/* Order Confirmation Modal after checkout */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onViewOrderDetails={() => {
            setConfirmedOrder(null);
            setActiveScreen('orders');
          }}
          onGoHome={() => {
            setConfirmedOrder(null);
            setActiveScreen('home');
          }}
        />
      )}

      {/* Promo Vouchers Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-stone-900">Voucher & Promo Sembako</h3>
              </div>
              <button onClick={() => setShowVoucherModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {vouchers.map((vch) => (
                <div key={vch.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-amber-950 text-sm">{vch.code}</span>
                    <p className="font-bold text-stone-800 text-xs mt-0.5">{vch.title}</p>
                    <p className="text-[11px] text-stone-600">{vch.description}</p>
                    <span className="text-[10px] text-stone-400 block mt-1">
                      Min. Belanja {formatRupiah(vch.minOrderAmount)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(vch.code);
                      showToast(`Kode voucher ${vch.code} tersalin!`);
                      setShowVoucherModal(false);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-xs cursor-pointer text-xs"
                  >
                    Salin Kode
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
