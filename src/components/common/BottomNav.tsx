import React from 'react';
import { Home, Grid, ShoppingBag, ShoppingCart, User, Truck, Shield } from 'lucide-react';
import { UserRole } from '../../types';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cartCount: number;
  activeOrdersCount: number;
  userRole: UserRole;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  cartCount,
  activeOrdersCount,
  userRole,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-2 py-1.5 md:hidden w-full max-w-full overflow-hidden pb-[calc(0.375rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Beranda */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'home' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </button>

        {/* Kategori */}
        <button
          onClick={() => onSelectTab('categories')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'categories' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Grid className={`w-5 h-5 ${activeTab === 'categories' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Kategori</span>
        </button>

        {/* Pesanan / Tracking */}
        <button
          onClick={() => onSelectTab('orders')}
          className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'orders' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Pesanan</span>
        </button>

        {/* Keranjang */}
        <button
          onClick={() => onSelectTab('cart')}
          className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'cart' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 ${activeTab === 'cart' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Keranjang</span>
        </button>

        {/* Akun or Role specific screen */}
        {userRole === 'COURIER' ? (
          <button
            onClick={() => onSelectTab('courier')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition cursor-pointer ${
              activeTab === 'courier' ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Truck className={`w-5 h-5 ${activeTab === 'courier' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5">Kurir</span>
          </button>
        ) : userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ? (
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition cursor-pointer ${
              activeTab === 'admin' ? 'text-purple-600 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Shield className={`w-5 h-5 ${activeTab === 'admin' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition cursor-pointer ${
              activeTab === 'profile' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5">Akun</span>
          </button>
        )}
      </div>
    </nav>
  );
};
