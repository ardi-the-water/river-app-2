
import { openDB, IDBPDatabase } from 'idb';
import { Settings, Invoice } from '../types.ts';

const DB_NAME = 'FishCafeDB';
const DB_VERSION = 1;
const SETTINGS_STORE = 'settings';
const INVOICES_STORE = 'invoices';

let db: IDBPDatabase;

const defaultSettings: Settings = {
    id: 1,
    cafeName: 'کافه شما',
    cafePhone: '021-12345678',
    googleSheetUrl: '',
    syncInterval: 30,
    currency: 'تومان',
    receiptHeader: 'به فیش‌کافه خوش آمدید',
    receiptFooter: 'متشکریم از انتخاب شما',
    vatPercent: 9,
};

export const initDB = async () => {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        const settingsStore = db.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
        settingsStore.put(defaultSettings);
      }
      if (!db.objectStoreNames.contains(INVOICES_STORE)) {
        db.createObjectStore(INVOICES_STORE, { keyPath: 'id' });
      }
    },
  });
};

export const getSettings = async (): Promise<Settings> => {
  if (!db) await initDB();
  const settings = await db.get(SETTINGS_STORE, 1);
  return settings || defaultSettings;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  if (!db) await initDB();
  await db.put(SETTINGS_STORE, { ...settings, id: 1 });
};

export const saveInvoice = async (invoice: Invoice): Promise<void> => {
  if (!db) await initDB();
  await db.put(INVOICES_STORE, invoice);
};

export const getInvoices = async (): Promise<Invoice[]> => {
  if (!db) await initDB();
  const invoices = await db.getAll(INVOICES_STORE);
  return invoices.sort((a, b) => b.timestamp - a.timestamp);
};

export const deleteInvoice = async (id: string): Promise<void> => {
  if (!db) await initDB();
  await db.delete(INVOICES_STORE, id);
};

export const exportData = async (): Promise<string> => {
  if (!db) await initDB();
  const settings = await db.getAll(SETTINGS_STORE);
  const invoices = await db.getAll(INVOICES_STORE);
  const data = {
    settings,
    invoices,
  };
  return JSON.stringify(data, null, 2);
};

export const importData = async (json: string): Promise<void> => {
    if (!db) await initDB();
    const data = JSON.parse(json);

    if (data.settings && Array.isArray(data.settings)) {
        const tx = db.transaction(SETTINGS_STORE, 'readwrite');
        await tx.store.clear();
        for (const setting of data.settings) {
            await tx.store.put(setting);
        }
        await tx.done;
    }

    if (data.invoices && Array.isArray(data.invoices)) {
        const tx = db.transaction(INVOICES_STORE, 'readwrite');
        await tx.store.clear();
        for (const invoice of data.invoices) {
            await tx.store.put(invoice);
        }
        await tx.done;
    }
};