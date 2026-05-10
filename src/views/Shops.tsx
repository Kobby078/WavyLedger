import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { Shop, Currency, Category } from '../types';
import { Plus, Store, MapPin, Coins, Trash2, Edit, X, Layers, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LocationInput from '../components/LocationInput';

export default function Shops() {
  const { shops, user, setActiveShop, activeShop } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [managingCategoriesShop, setManagingCategoriesShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    baseCurrency: Currency.GHS
  });

  // Listen for categories when a shop is selected for management
  useEffect(() => {
    if (!managingCategoriesShop || !user) {
      setCategories([]);
      return;
    }

    const q = query(
      collection(db, 'categories'),
      where('shopId', '==', managingCategoriesShop.id),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'categories');
    });

    return () => unsubscribe();
  }, [managingCategoriesShop, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      name: formData.name,
      location: formData.location,
      baseCurrency: formData.baseCurrency,
      ownerId: user.uid,
      createdAt: editingShop ? (editingShop as any).createdAt : new Date().toISOString()
    };

    try {
      if (editingShop) {
        await updateDoc(doc(db, 'shops', editingShop.id), payload);
      } else {
        await addDoc(collection(db, 'shops'), payload);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, editingShop ? OperationType.UPDATE : OperationType.CREATE, 'shops');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !managingCategoriesShop || !newCategoryName.trim()) return;

    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        shopId: managingCategoriesShop.id,
        ownerId: user.uid
      });
      setNewCategoryName('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'categories');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', catId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'categories');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', baseCurrency: Currency.GHS });
    setEditingShop(null);
  };

  const handleEdit = (s: Shop) => {
    setEditingShop(s);
    setFormData({
      name: s.name,
      location: s.location || '',
      baseCurrency: s.baseCurrency
    });
    setIsModalOpen(true);
  };

  const openCategoryManagement = (s: Shop) => {
    setManagingCategoriesShop(s);
    setIsCategoryModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shop? All its inventory and data will be detached.')) return;
    try {
      await deleteDoc(doc(db, 'shops', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'shops');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Shops</h2>
          <p className="text-slate-500">Register new locations and manage product categories.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          Register New Shop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map(shop => (
          <motion.div 
            layout
            key={shop.id}
            className={`p-8 rounded-3xl border-2 transition-all relative group overflow-hidden ${activeShop?.id === shop.id ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-slate-100 bg-white shadow-sm hover:border-slate-200'}`}
          >
            {activeShop?.id === shop.id && (
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest">Active</div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${activeShop?.id === shop.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                <Store size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{shop.name}</h3>
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 font-medium">
                  <MapPin size={12} /> {shop.location || 'No location set'}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm">
                  <Coins size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Currency</p>
                  <p className="text-sm font-bold text-slate-700">{shop.baseCurrency}</p>
                </div>
              </div>

              <button 
                onClick={() => openCategoryManagement(shop)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                    <Layers size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">Organization</p>
                    <p className="text-sm font-bold text-slate-700">Manage Categories</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
              <button 
                onClick={() => setActiveShop(shop)}
                disabled={activeShop?.id === shop.id}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeShop?.id === shop.id ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-sm'}`}
              >
                {activeShop?.id === shop.id ? 'Current Active' : 'Set Active'}
              </button>
              <button onClick={() => handleEdit(shop)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Edit size={18} /></button>
              <button onClick={() => handleDelete(shop.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"><Trash2 size={18} /></button>
            </div>
          </motion.div>
        ))}

        {shops.length === 0 && (
          <div className="lg:col-span-3 py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-4xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-6 shadow-sm">
              <Plus size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Shops Registered</h3>
            <p className="text-slate-500 max-w-xs mb-8 text-sm font-medium">WavyLedger works best when you organize your storefronts separately.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Add Your First Shop
            </button>
          </div>
        )}
      </div>

      {/* Shop Modal */}
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
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">{editingShop ? 'Edit Shop' : 'Register New Shop'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Business Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Wavy Electronics" 
                    className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Location (AI Suggestions)</label>
                  <LocationInput 
                    value={formData.location}
                    onChange={val => setFormData({...formData, location: val})}
                    placeholder="Search for your shop address..."
                    className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Base Currency</label>
                  <select 
                    value={formData.baseCurrency}
                    onChange={e => setFormData({...formData, baseCurrency: e.target.value as Currency})}
                    className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
                  >
                    {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-5 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                  >
                    {editingShop ? 'Update Details' : 'Create Wavy Shop'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && managingCategoriesShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Manage Categories</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{managingCategoriesShop.name}</p>
                </div>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Add new category (e.g. Electronics)" 
                    className="flex-1 bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <button 
                    type="submit"
                    className="p-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <Plus size={24} />
                  </button>
                </form>

                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                      <span className="font-bold text-slate-700">{cat.name}</span>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                      <Layers size={32} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-400 text-sm font-medium">No categories created yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
