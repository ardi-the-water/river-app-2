
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../App.tsx';
import * as db from '../services/dbService.ts';
import { Settings } from '../types.ts';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, refreshMenu } = useContext(AppContext);
  const [formState, setFormState] = useState<Settings | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => prev ? { ...prev, [name]: name === 'syncInterval' || name === 'vatPercent' ? Number(value) : value } : null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState) {
      await updateSettings(formState);
      alert('تنظیمات با موفقیت ذخیره شد.');
    }
  };

  const handleBackup = async () => {
    const jsonData = await db.exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fishcafe-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleRestore = () => {
    fileInputRef.current?.click();
  };
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = event.target?.result as string;
          if (window.confirm("آیا از بازگردانی اطلاعات اطمینان دارید؟ تمام اطلاعات فعلی پاک خواهد شد.")) {
            await db.importData(json);
            alert("اطلاعات با موفقیت بازگردانی شد. صفحه مجددا بارگذاری می‌شود.");
            window.location.reload();
          }
        } catch (error) {
          alert("فایل پشتیبان نامعتبر است.");
        }
      };
      reader.readAsText(file);
    }
  };
  
  if (!formState) {
    return <div>درحال بارگذاری تنظیمات...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold mb-4">تنظیمات اصلی</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="googleSheetUrl" className="block text-sm font-medium text-gray-700">آدرس گوگل شیت (CSV)</label>
                    <input type="url" id="googleSheetUrl" name="googleSheetUrl" value={formState.googleSheetUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left" dir="ltr" placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv" />
                    <p className="text-xs text-gray-500 mt-1">
                        مهم: در گوگل‌شیت از منوی File &gt; Share &gt; Publish to web، گزینه‌ی Comma-separated values (.csv) را انتخاب و لینک را اینجا کپی کنید. از کپی کردن آدرس صفحه ادیت خودداری کنید.
                    </p>
                </div>
                <div>
                    <label htmlFor="syncInterval" className="block text-sm font-medium text-gray-700">فاصله همگام‌سازی (ثانیه)</label>
                    <input type="number" id="syncInterval" name="syncInterval" value={formState.syncInterval} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left" dir="ltr" />
                </div>
                 <div>
                    <label htmlFor="cafeName" className="block text-sm font-medium text-gray-700">نام کافه/رستوران</label>
                    <input type="text" id="cafeName" name="cafeName" value={formState.cafeName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label htmlFor="cafePhone" className="block text-sm font-medium text-gray-700">تلفن</label>
                    <input type="text" id="cafePhone" name="cafePhone" value={formState.cafePhone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                 <div>
                    <label htmlFor="vatPercent" className="block text-sm font-medium text-gray-700">درصد مالیات بر ارزش افزوده</label>
                    <input type="number" id="vatPercent" name="vatPercent" value={formState.vatPercent} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-left" dir="ltr" />
                </div>
                 <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">واحد پول</label>
                    <input type="text" id="currency" name="currency" value={formState.currency} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="receiptHeader" className="block text-sm font-medium text-gray-700">متن سربرگ فیش</label>
                    <textarea id="receiptHeader" name="receiptHeader" value={formState.receiptHeader} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="receiptFooter" className="block text-sm font-medium text-gray-700">متن پاورقی فیش</label>
                    <textarea id="receiptFooter" name="receiptFooter" value={formState.receiptFooter} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
            </div>
             <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                <button type="button" onClick={refreshMenu} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">همگام‌سازی دستی منو</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">ذخیره تنظیمات</button>
            </div>
        </form>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">پشتیبان‌گیری و بازیابی</h2>
            <div className="flex items-center space-x-4 space-x-reverse">
                <button onClick={handleBackup} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">دانلود فایل پشتیبان (JSON)</button>
                <button onClick={handleRestore} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">بازیابی از فایل</button>
                <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".json" className="hidden" />
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;