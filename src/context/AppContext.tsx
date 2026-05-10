import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { UserProfile, Shop } from '../types';

interface AppContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  shops: Shop[];
  activeShop: Shop | null;
  setActiveShop: (shop: Shop) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShopState] = useState<Shop | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Sync Profile
        const userRef = doc(db, 'users', u.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || '',
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userSnap.data() as UserProfile);
          }
        } catch (e) {
          console.error("Error fetching profile", e);
        }
      } else {
        setProfile(null);
        setShops([]);
        setActiveShopState(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'shops'), where('ownerId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const shopsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
        setShops(shopsList);
        
        // Auto-select shop if none active or active shop id not in list
        if (shopsList.length > 0) {
          if (!activeShop || !shopsList.find(s => s.id === activeShop.id)) {
            setActiveShopState(shopsList[0]);
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'shops');
      });
      return unsubscribe;
    }
  }, [user, activeShop]);

  const setActiveShop = (shop: Shop) => {
    setActiveShopState(shop);
  };

  return (
    <AppContext.Provider value={{ user, loading, profile, shops, activeShop, setActiveShop }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
