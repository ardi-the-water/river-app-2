import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../App';
import { MenuItem, OrderItem, Invoice } from '../types';
import MenuItemCard from './MenuItemCard';
import OrderPanel from './OrderPanel';

interface OrderPageProps {
  invoiceToEdit: Invoice | null;
  onFinishEdit: () => void;
}

const OrderPage: React.FC<OrderPageProps> = ({ invoiceToEdit, onFinishEdit }) => {
  const { menu } = useContext(AppContext);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (invoiceToEdit) {
      // When starting an edit, populate the order
      setCurrentOrder(invoiceToEdit.items);
    } else {
      // When not in edit mode (or after finishing), clear the order
      setCurrentOrder([]);
    }
  }, [invoiceToEdit]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(menu.map(item => item.category))];
    return ['all', ...uniqueCategories];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, searchTerm, selectedCategory]);

  const addToOrder = (item: MenuItem) => {
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(orderItem => orderItem.item_id === item.item_id);
      if (existingItem) {
        return prevOrder.map(orderItem =>
          orderItem.item_id === item.item_id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        return [...prevOrder, { ...item, quantity: 1, discount: 0 }];
      }
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="جستجوی آیتم..."
            className="flex-grow p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="all">همه‌ی دسته‌بندی‌ها</option>
            {categories.slice(1).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMenu.length > 0 ? (
            filteredMenu.map(item => (
              <MenuItemCard key={item.item_id} item={item} onAddToOrder={addToOrder} />
            ))
          ) : (
             <div className="col-span-full text-center py-10 text-gray-500">
                <p>موردی یافت نشد. لطفاً تنظیمات گوگل شیت را بررسی کنید.</p>
             </div>
          )}
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <div className="sticky top-20">
          <OrderPanel
            orderItems={currentOrder}
            setOrderItems={setCurrentOrder}
            invoiceToEdit={invoiceToEdit}
            onFinishEdit={onFinishEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderPage;