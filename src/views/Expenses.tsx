import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { Expense } from '../types';
import { 
  Plus, 
  ReceiptJapaneseYen, 
  Trash2, 
  Calendar, 
  Tag as TagIcon,
  Search,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Expenses() {
  const { activeShop, user } = useAppContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (!activeShop || !user) return;
    const q = query(
      collection(db, 'expenses'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));
    return () => unsubscribe();
  }, [activeShop, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop || !user) return;

    try {
      await addDoc(collection(db, 'expenses'), {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: Timestamp.fromDate(new Date(formData.date)),
        shopId: activeShop.id,
        ownerId: user.uid,
        currency: activeShop.baseCurrency
      });
      setIsModalOpen(false);
      setFormData({ category: '', amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'expenses');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'expenses');
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Expenses</h2>
          <p className="text-slate-500">Keep track of your overheads.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transition-transform active:scale-95"
        >
          <Plus size={20} />
          Record Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-indigo-600 p-8 rounded-3xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <ReceiptJapaneseYen size={80} />
          </div>
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Total Monthly Spends</p>
          <h3 className="text-4xl font-black">{activeShop?.baseCurrency} {totalExpense.toLocaleString()}</h3>
        </div>
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <Search className="text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by category or description..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500">{format(e.date.toDate(), 'MMM dd')}</td>
                    <td className="px-6 py-4 capitalize font-bold text-slate-700">{e.category}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-[150px]">{e.description}</td>
                    <td className="px-6 py-4 text-sm font-black text-rose-500 text-right">{activeShop?.baseCurrency} {e.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(e.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">New Expense</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    >
                      <option value="">Select Category</option>
                      {['Rent', 'Utilities', 'Inventory Purchase', 'Wages', 'Marketing', 'Maintenance', 'Legal', 'Taxes', 'Others'].map(c => (
                        <option key={c} value={c.toLowerCase()}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Amount ({activeShop?.baseCurrency})</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00" 
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Description (Optional)</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Add more details about this expense..." 
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-black"
                  >
                    SAVE EXPENSE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
