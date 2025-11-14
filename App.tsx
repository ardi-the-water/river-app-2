
import React, { useState, useEffect, useCallback } from 'react';
import { View, Settings, MenuItem, OrderItem, Invoice } from './types.ts';
import Header from './components/Header.tsx';
import OrderPage from './components/OrderPage.tsx';
import InvoicesPage from './components/InvoicesPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import * as db from './services/dbService.ts';
import { fetchMenuData } from './services/googleSheetService.ts';

export const AppContext = React.createContext<{
  settings: Settings | null;
  menu: MenuItem[];
  refreshMenu: () => void;
  updateSettings: (newSettings: Settings) => Promise<void>;
}>({
  settings: null,
  menu: [],
  refreshMenu: () => {},
  updateSettings: async () => {},
});

const App: React.FC = () => {
  const [view, setView] = useState<View>('order');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await db.getSettings();
      setSettings(savedSettings);
    } catch (e) {
      setError('خطا در بارگذاری تنظیمات');
    }
  }, []);

  const refreshMenu = useCallback(async () => {
    if (!settings || !settings.googleSheetUrl) {
      console.log("URL گوگل شیت تنظیم نشده است. منو بارگذاری نمی‌شود.");
      setMenu([]);
      return;
    }
    setError(null);
    try {
      const menuData = await fetchMenuData(settings.googleSheetUrl);
      setMenu(menuData);
    } catch (err) {
      setError('خطا در بارگذاری منو از گوگل شیت. لطفاً آدرس و اینترنت خود را بررسی کنید.');
      setMenu([]);
    }
  }, [settings]);
  
  const updateSettings = async (newSettings: Settings) => {
    await db.saveSettings(newSettings);
    setSettings(newSettings);
    await refreshMenu();
  };
  
  const handleStartEdit = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setView('order');
  };
  
  const handleFinishEdit = () => {
    setInvoiceToEdit(null);
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await db.initDB();
      await loadSettings();
      setIsLoading(false);
    };
    initialize();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      refreshMenu();
      const interval = setInterval(refreshMenu, settings.syncInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings, refreshMenu]);

  const renderView = () => {
    switch (view) {
      case 'order':
        return <OrderPage invoiceToEdit={invoiceToEdit} onFinishEdit={handleFinishEdit} />;
      case 'invoices':
        return <InvoicesPage onEditInvoice={handleStartEdit} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OrderPage invoiceToEdit={invoiceToEdit} onFinishEdit={handleFinishEdit} />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-100 text-2xl">درحال بارگذاری...</div>;
  }

  return (
    <AppContext.Provider value={{ settings, menu, refreshMenu, updateSettings }}>
      <div className="min-h-screen bg-gray-50">
        <Header currentView={view} setView={setView} />
        <main className="p-4 md:p-6">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}
          {renderView()}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;