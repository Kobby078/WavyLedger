import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Sale, Expense, Product } from '../types';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon,
  BarChart3,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const { activeShop, user } = useAppContext();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!activeShop || !user) return;

    // Fetch products for margin analysis
    const qProducts = query(
      collection(db, 'products'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid)
    );
    onSnapshot(qProducts, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));

    // Fetch sales for current month
    const start = startOfMonth(new Date());
    const qSales = query(
      collection(db, 'sales'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(start))
    );
    onSnapshot(qSales, (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as Sale)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'sales'));

    // Fetch expenses for current month
    const qExpenses = query(
      collection(db, 'expenses'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(start))
    );
    onSnapshot(qExpenses, (snap) => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));

  }, [activeShop, user]);

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + (s.totalProfit || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netIncome = totalProfit - totalExpenses;

  // Best Selling Products (aggregated from sales items)
  const productPerformance: Record<string, {name: string, quantity: number, revenue: number}> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productPerformance[item.productId]) {
        productPerformance[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productPerformance[item.productId].quantity += item.quantity;
      productPerformance[item.productId].revenue += item.quantity * item.price;
    });
  });

  const bestSellers = Object.values(productPerformance)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Expense Breakdown by Category
  const expenseCategories: Record<string, number> = {};
  expenses.forEach(e => {
    expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
  });

  const expenseData = Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Reports</h2>
          <p className="text-slate-500">Performance for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 shadow-sm transition-all text-slate-600">
          <Download size={20} />
          Export PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Sales Revenue</p>
          <h3 className="text-3xl font-black text-slate-900">{activeShop?.baseCurrency} {totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col border-emerald-100 bg-emerald-50/20">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp size={24} />
          </div>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Gross Profit</p>
          <h3 className="text-3xl font-black text-emerald-700">{activeShop?.baseCurrency} {totalProfit.toLocaleString()}</h3>
        </div>
        <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col ${netIncome >= 0 ? 'bg-indigo-50/30' : 'bg-rose-50'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${netIncome >= 0 ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
            <BarChart3 size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Net Monthly Income</p>
          <h3 className={`text-3xl font-black ${netIncome >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {activeShop?.baseCurrency} {netIncome.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Best Selling Products</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="quantity" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Expense Distribution</h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4">
              {expenseData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-xs font-bold text-slate-600 capitalize">{item.name}</span>
                </div>
              ))}
              {expenseData.length === 0 && <p className="text-xs text-slate-400 italic">No expenses recorded</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Product Margin Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Inventory Margins Analysis</h3>
          <p className="text-xs text-slate-400 font-medium">Evaluate your pricing strategy per product.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Cost</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Selling</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Margin Per Unit</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Profit %</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const margin = p.sellingPrice - p.costPrice;
                const marginPercent = ((margin / p.sellingPrice) * 100).toFixed(1);
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/20">
                    <td className="px-8 py-5 font-bold text-slate-700">{p.name}</td>
                    <td className="px-8 py-5 text-right text-sm text-slate-500">{activeShop?.baseCurrency} {p.costPrice.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right text-sm text-slate-900 font-bold">{activeShop?.baseCurrency} {p.sellingPrice.toLocaleString()}</td>
                    <td className={`px-8 py-5 text-right text-sm font-black ${margin >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {activeShop?.baseCurrency} {margin.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className={`inline-block px-2 py-1 rounded-md text-[10px] font-black ${parseFloat(marginPercent) > 30 ? 'bg-emerald-100 text-emerald-700' : parseFloat(marginPercent) > 10 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {marginPercent}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
