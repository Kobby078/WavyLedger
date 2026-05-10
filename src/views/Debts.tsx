import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { Debt } from '../types';
import { 
  Plus, 
  CreditCard, 
  Trash2, 
  User, 
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  X,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Debts() {
  const { activeShop, user } = useAppContext();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    type: 'owe_me' as 'owe_me' | 'i_owe',
    date: format(new Date(), 'yyyy-MM-dd'),
    dueDate: ''
  });

  useEffect(() => {
    if (!activeShop || !user) return;
    const q = query(
      collection(db, 'debts'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setDebts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Debt)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'debts'));
    return () => unsubscribe();
  }, [activeShop, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop || !user) return;

    try {
      await addDoc(collection(db, 'debts'), {
        personName: formData.personName,
        amount: parseFloat(formData.amount),
        type: formData.type,
        status: 'pending',
        date: Timestamp.fromDate(new Date(formData.date)),
        dueDate: formData.dueDate ? Timestamp.fromDate(new Date(formData.dueDate)) : null,
        shopId: activeShop.id,
        ownerId: user.uid,
        currency: activeShop.baseCurrency
      });
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'debts');
    }
  };

  const markAsCleared = async (id: string) => {
    try {
      await updateDoc(doc(db, 'debts', id), { status: 'cleared' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'debts');
    }
  };

  const resetForm = () => {
    setFormData({ personName: '', amount: '', type: 'owe_me', date: format(new Date(), 'yyyy-MM-dd'), dueDate: '' });
  };

  const filteredDebts = debts.filter(d => 
    d.personName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    oweMe: filteredDebts.filter(d => d.type === 'owe_me' && d.status === 'pending').reduce((acc, d) => acc + d.amount, 0),
    iOwe: filteredDebts.filter(d => d.type === 'i_owe' && d.status === 'pending').reduce((acc, d) => acc + d.amount, 0)
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Debt Tracker</h2>
          <p className="text-slate-500">Manage money owed and payables.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transition-transform active:scale-95"
        >
          <Plus size={20} />
          New Entry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ArrowDownRight size={80} /></div>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Customers Owe Me</p>
          <h3 className="text-4xl font-black text-emerald-700">{activeShop?.baseCurrency} {stats.oweMe.toLocaleString()}</h3>
        </div>
        <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ArrowUpRight size={80} /></div>
          <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest mb-1">I Owe (Payables)</p>
          <h3 className="text-4xl font-black text-rose-700">{activeShop?.baseCurrency} {stats.iOwe.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by person's name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-bold text-slate-700">All Status</button>
            <button className="px-4 py-2 text-sm font-bold text-slate-400">Pending</button>
            <button className="px-4 py-2 text-sm font-bold text-slate-400">Cleared</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium italic">No debt records found. Click "New Entry" to start.</td>
                </tr>
              ) : (
                filteredDebts.map(d => (
                  <tr key={d.id} className={`transition-all hover:bg-slate-50/30 ${d.status === 'cleared' ? 'opacity-50' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${d.type === 'owe_me' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {d.personName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700">{d.personName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${d.type === 'owe_me' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {d.type === 'owe_me' ? 'Receivable' : 'Payable'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-400">{format(d.date.toDate(), 'MMM dd, yyyy')}</td>
                    <td className={`px-8 py-5 text-sm font-black text-right ${d.type === 'owe_me' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {d.currency} {d.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-center">
                      {d.status === 'cleared' ? (
                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 size={14} /> Cleared
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xs">
                          <Clock size={14} /> Pending
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {d.status === 'pending' && (
                          <button 
                            onClick={() => markAsCleared(d.id)}
                            className="bg-emerald-50 text-emerald-600 p-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                            title="Mark as Cleared"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button className="text-slate-300 hover:text-rose-600 p-2 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
                <h3 className="text-2xl font-bold text-slate-900">Record New Debt</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, type: 'owe_me'})}
                      className={`flex-1 py-3 items-center justify-center gap-2 rounded-xl text-sm font-bold flex transition-all ${formData.type === 'owe_me' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}
                    >
                      <ArrowDownRight size={18} /> Someone Owes Me
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, type: 'i_owe'})}
                      className={`flex-1 py-3 items-center justify-center gap-2 rounded-xl text-sm font-bold flex transition-all ${formData.type === 'i_owe' ? 'bg-white shadow text-rose-600' : 'text-slate-400'}`}
                    >
                      <ArrowUpRight size={18} /> I Owe Someone
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Person's Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.personName}
                      onChange={e => setFormData({...formData, personName: e.target.value})}
                      placeholder="e.g. John Doe / Supplier Name" 
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Date</label>
                      <input 
                        required
                        type="date" 
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Due Date (Optional)</label>
                      <input 
                        type="date" 
                        value={formData.dueDate}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all font-black"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-black"
                  >
                    SAVE ENTRY
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
