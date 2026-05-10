export enum Currency {
  USD = 'USD',
  GHS = 'GHS',
  EUR = 'EUR',
  GBP = 'GBP',
  NGN = 'NGN',
  KES = 'KES',
}

export interface Shop {
  id: string;
  name: string;
  location?: string;
  baseCurrency: Currency;
  ownerId: string;
}

export interface Category {
  id: string;
  name: string;
  shopId: string;
  ownerId: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  shopId: string;
  ownerId: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  date: any; // Firestore Timestamp
  items: SaleItem[];
  totalAmount: number;
  totalProfit: number;
  currency: Currency;
  shopId: string;
  ownerId: string;
}

export interface Expense {
  id: string;
  date: any; // Firestore Timestamp
  category: string;
  amount: number;
  description?: string;
  currency: Currency;
  shopId: string;
  ownerId: string;
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: 'owe_me' | 'i_owe';
  status: 'pending' | 'cleared';
  date: any; // Firestore Timestamp
  dueDate?: any;
  currency: Currency;
  shopId: string;
  ownerId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  lastActiveShopId?: string;
}
