
export interface Settings {
  id: number;
  cafeName: string;
  cafePhone: string;
  googleSheetUrl: string;
  syncInterval: number;
  currency: string;
  receiptHeader: string;
  receiptFooter: string;
  vatPercent: number;
}

export interface MenuItem {
  item_id: string;
  name: string;
  price: number;
  category: string;
  active: boolean;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  discount: number; // as a percentage
}

export interface Invoice {
  id: string;
  timestamp: number;
  persianDate: string;
  items: OrderItem[];
  subtotal: number;
  discount: number; // overall invoice discount value
  vat: number;
  total: number;
  tableNumber?: string;
}

export type View = 'order' | 'invoices' | 'settings';
