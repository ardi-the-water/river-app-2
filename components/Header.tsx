
import React from 'react';
import { View } from '../types';
import { CoffeeIcon, FileTextIcon, SettingsIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'order', label: 'سفارش‌گیری', icon: <CoffeeIcon /> },
    { view: 'invoices', label: 'فاکتورها', icon: <FileTextIcon /> },
    { view: 'settings', label: 'تنظیمات', icon: <SettingsIcon /> },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-10 no-print">
      <nav className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">فیش‌کافه</h1>
        <div className="flex items-center space-x-2 space-x-reverse">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg text-sm md:text-base transition-colors duration-200 ${
                currentView === item.view
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
