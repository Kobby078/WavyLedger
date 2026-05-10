import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { Sale, Product, Expense } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  PackageSearch, 
  DollarSign, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Store
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export default function Home() {
  const navigate = useNavigate();
  const { activeShop, user } = useAppContext();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (!activeShop || !user) return;

    // Fetch all products for low stock alerts
    const qProducts = query(
      collection(db, 'products'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid)
    );
    const unsubProducts = onSnapshot(qProducts, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));

    // Fetch sales for last 7 days
    const sevenDaysAgo = subDays(new Date(), 7);
    const qSales = query(
      collection(db, 'sales'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('date', 'desc')
    );
    const unsubSales = onSnapshot(qSales, (snap) => {
      const salesList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Sale));
      setSales(salesList);
      setRecentSales(salesList.slice(0, 5));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'sales'));

    // Fetch expenses for last 7 days
    const qExpenses = query(
      collection(db, 'expenses'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
    );
    const unsubExpenses = onSnapshot(qExpenses, (snap) => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));

    return () => {
      unsubProducts();
      unsubSales();
      unsubExpenses();
    };
  }, [activeShop, user]);

  const stats = {
    todaySales: sales.filter(s => {
      const d = s.date.toDate();
      return d >= startOfDay(new Date()) && d <= endOfDay(new Date());
    }).reduce((acc, s) => acc + s.totalAmount, 0),
    totalProfit: sales.reduce((acc, s) => acc + (s.totalProfit || 0), 0),
    totalExpenses: expenses.reduce((acc, e) => acc + e.amount, 0),
    lowStockCount: products.filter(p => p.stockQuantity <= p.minStockLevel).length
  };

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayName = format(date, 'EEE');
    const daySales = sales.filter(s => format(s.date.toDate(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                          .reduce((acc, s) => acc + s.totalAmount, 0);
    return { name: dayName, amount: daySales };
  });

  if (!activeShop) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6">
          <Store size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Shop Active</h2>
        <p className="text-slate-500 max-w-sm mb-8">Create or select a shop from the sidebar to start managing your business.</p>
        <button 
          onClick={() => navigate('/app/shops')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          Create My First Shop
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{activeShop.name} Dashboard</h2>
          <p className="text-slate-500">Welcome back, {user?.displayName}. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200">
          <button className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg">Overview</button>
          <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">7 Days</button>
          <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">30 Days</button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Sales", val: stats.todaySales, icon: DollarSign, color: "bg-indigo-600", trend: "+12%", up: true },
          { label: "Profit (7d)", val: stats.totalProfit, icon: TrendingUp, color: "bg-emerald-500", trend: "+5%", up: true },
          { label: "Expenses (7d)", val: stats.totalExpenses, icon: TrendingDown, color: "bg-rose-500", trend: "-2%", up: false },
          { label: "Low Stock Items", val: stats.lowStockCount, icon: AlertCircle, color: "bg-amber-500", isPlain: true }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              {!stat.isPlain && (
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {stat.trend} {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900">
              {stat.isPlain ? stat.val : `${activeShop.baseCurrency} ${stat.val.toLocaleString()}`}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Revenue Performance</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-3 h-3 bg-indigo-600 rounded-full" /> Revenue (Daily)
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} orientation="right" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Sidebar */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Inventory Alerts</h3>
            <AlertCircle size={20} className="text-amber-500" />
          </div>
          <div className="space-y-4">
            {products.filter(p => p.stockQuantity <= p.minStockLevel).length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageSearch size={24} />
                </div>
                <p className="text-sm font-medium text-slate-500">All inventory levels are healthy</p>
              </div>
            ) : (
              products.filter(p => p.stockQuantity <= p.minStockLevel).map(product => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                    <PackageSearch size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-rose-500 font-semibold">{product.stockQuantity} items left</p>
                  </div>
                  <div className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold">LOW</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Items</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Revenue</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Profit</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-500 text-sm">No sales recorded yet.</td>
                </tr>
              ) : (
                recentSales.map(sale => (
                  <tr key={sale.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-mono text-slate-400">#{sale.id.slice(0, 8)}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                          <ShoppingCart size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{sale.items.length} items</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">{format(sale.date.toDate(), 'MMM dd, HH:mm')}</td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-900">{sale.currency} {sale.totalAmount.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-emerald-600">+{sale.currency} {sale.totalProfit?.toLocaleString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
