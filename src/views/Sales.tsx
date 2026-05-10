import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, Timestamp, writeBatch } from 'firebase/firestore';
import { Product, SaleItem, Sale } from '../types';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Sales() {
  const { activeShop, user } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  useEffect(() => {
    if (!activeShop || !user) return;
    const q = query(
      collection(db, 'products'),
      where('shopId', '==', activeShop.id),
      where('ownerId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));
    return () => unsubscribe();
  }, [activeShop, user]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (product.stockQuantity <= currentQtyInCart) {
      alert("Insufficient stock available!");
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.sellingPrice,
        cost: product.costPrice
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.productId === productId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(item => 
        item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      setCart(cart.filter(item => item.productId !== productId));
    }
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalProfit = cart.reduce((acc, item) => acc + ((item.price - item.cost) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0 || !activeShop || !user) return;
    setIsProcessing(true);

    try {
      const batch = writeBatch(db);
      
      // 1. Create Sale Document
      const saleRef = doc(collection(db, 'sales'));
      batch.set(saleRef, {
        date: Timestamp.now(),
        items: cart,
        totalAmount,
        totalProfit,
        currency: activeShop.baseCurrency,
        shopId: activeShop.id,
        ownerId: user.uid
      });

      // 2. Update Product Stocks
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const productRef = doc(db, 'products', product.id);
          batch.update(productRef, {
            stockQuantity: product.stockQuantity - item.quantity,
            updatedAt: new Date().toISOString()
          });
        }
      }

      await batch.commit();
      setOrderComplete(saleRef.id);
      setCart([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'sales');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stockQuantity > 0
  );

  if (orderComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Sale Recorded!</h2>
        <p className="text-slate-500 mb-8 font-medium">Transaction #{orderComplete.slice(0, 8)} was successful.</p>
        <div className="flex gap-4">
          <button 
            onClick={() => setOrderComplete(null)}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Record New Sale
          </button>
          <button 
            onClick={() => window.location.href = '/inventory'}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
          >
            View Inventory
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
      {/* Left: Product Selector */}
      <div className="flex-1 space-y-6 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Record Sale</h2>
            <p className="text-slate-500">Pick items from your inventory.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Active Shop</p>
            <p className="font-bold text-slate-700">{activeShop?.name}</p>
          </div>
        </div>

        <div className="relative shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search for a product..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
          {filteredProducts.map(product => {
            const inCart = cart.find(i => i.productId === product.id)?.quantity || 0;
            const remaining = product.stockQuantity - inCart;
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={remaining <= 0}
                className={`p-6 rounded-3xl border text-left transition-all ${remaining <= 0 ? 'bg-slate-50 opacity-50 cursor-not-allowed grayscale' : 'bg-white border-slate-100 hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 group'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${remaining <= 0 ? 'bg-slate-200 text-slate-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                    <PackageCheck size={20} />
                  </div>
                  {inCart > 0 && <div className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-100">{inCart}</div>}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest truncate">{product.category}</p>
                  <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{product.name}</h4>
                  <p className="text-lg font-black text-slate-900 mt-2">{activeShop?.baseCurrency} {product.sellingPrice.toLocaleString()}</p>
                  <p className={`text-[10px] font-bold mt-1 ${remaining <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                    {remaining} IN STOCK
                  </p>
                </div>
              </button>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 font-medium italic">
              No products available in stock or matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col min-h-[400px]">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full">
          <div className="p-6 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Shopping Bag</h3>
              <span className="ml-auto bg-white/20 px-2 py-1 rounded-md text-[10px] font-black">{cart.length} ITEMS</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale blur-[1px]">
                <ShoppingCart size={48} className="mb-4" />
                <p className="text-sm font-bold">Your bag is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex gap-4 items-center group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{activeShop?.baseCurrency} {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-2 py-1 rounded-xl group-hover:bg-indigo-50 transition-colors">
                    <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-rose-500 transition-colors"><Minus size={16} /></button>
                    <span className="text-sm font-black text-slate-700 w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => {
                        const product = products.find(p => p.id === item.productId);
                        if (product) addToCart(product);
                      }} 
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>{activeShop?.baseCurrency} {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Due</span>
              <span className="text-2xl font-black text-indigo-600">{activeShop?.baseCurrency} {totalAmount.toLocaleString()}</span>
            </div>
            
            <button
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black disabled:bg-slate-200 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group overflow-hidden"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  COMPLETE TRANSACTION
                  <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
