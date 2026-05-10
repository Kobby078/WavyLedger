import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ReceiptJapaneseYen, 
  Users, 
  Store, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  PieChart
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export default function Layout() {
  const { user, activeShop, shops, setActiveShop } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/app/inventory', icon: Package },
    { name: 'Sales', path: '/app/sales', icon: ShoppingCart },
    { name: 'Expenses', path: '/app/expenses', icon: ReceiptJapaneseYen },
    { name: 'Debts', path: '/app/debts', icon: CreditCard },
    { name: 'Reports', path: '/app/reports', icon: PieChart },
    { name: 'My Shops', path: '/app/shops', icon: Store },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-lg lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo & Header */}
          <div className="p-6 border-b border-slate-50">
            <Logo className="scale-90 origin-left" />
            <p className="text-[10px] text-wavy-teal font-black tracking-widest uppercase mt-2 opacity-80">Pro Bookkeeping</p>
          </div>

          {/* Shop Selector */}
          <div className="px-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 block">Active Shop</label>
              <select 
                value={activeShop?.id || ''}
                onChange={(e) => {
                  const shop = shops.find(s => s.id === e.target.value);
                  if (shop) setActiveShop(shop);
                }}
                className="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                {shops.length === 0 ? (
                  <option value="">No shops found</option>
                ) : (
                  shops.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-wavy-teal/10 text-wavy-dark shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-wavy-teal" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.name}
                  {isActive && <motion.div layoutId="nav-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-wavy-teal" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Profile */}
          <div className="p-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=00E0D1&color=fff`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 lg:hidden focus:outline-none">
            <Menu size={24} />
          </button>
          <Logo className="scale-75" />
          <div className="w-8" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-6xl mx-auto w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
