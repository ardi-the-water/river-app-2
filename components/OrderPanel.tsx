import React, { useState, useContext, useEffect } from 'react';
import { OrderItem, Invoice } from '../types';
import { AppContext } from '../App';
import * as db from '../services/dbService';
import { toPersianDate, formatCurrency, generateInvoiceId } from '../utils/helpers';
import { Trash2Icon, PlusIcon, MinusIcon } from './icons';

interface OrderPanelProps {
  orderItems: OrderItem[];
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  invoiceToEdit: Invoice | null;
  onFinishEdit: () => void;
}

const OrderPanel: React.FC<OrderPanelProps> = ({ orderItems, setOrderItems, invoiceToEdit, onFinishEdit }) => {
  const { settings } = useContext(AppContext);
  const [discount, setDiscount] = useState(0);
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    if (invoiceToEdit) {
        setDiscount(invoiceToEdit.discount);
        setTableNumber(invoiceToEdit.tableNumber || '');
    } else {
        // This panel is reused, so reset state when not editing
        setDiscount(0);
        setTableNumber('');
    }
  }, [invoiceToEdit]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(prev => prev.filter(item => item.item_id !== itemId));
    } else {
      setOrderItems(prev => prev.map(item =>
        item.item_id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const vat = (subtotal - discount) * ((settings?.vatPercent || 0) / 100);
  const total = subtotal - discount + vat;

  const handleSaveInvoice = async () => {
    if (orderItems.length === 0) {
      alert("سبد خرید خالی است!");
      return;
    }
    
    const isEditing = !!invoiceToEdit;
    const timestamp = isEditing ? invoiceToEdit.timestamp : Date.now();

    const finalizedInvoice: Invoice = {
      id: isEditing ? invoiceToEdit.id : generateInvoiceId(),
      timestamp,
      persianDate: toPersianDate(new Date(timestamp)),
      items: orderItems,
      subtotal,
      discount,
      vat,
      total,
      tableNumber,
    };
    
    await db.saveInvoice(finalizedInvoice);
    alert(isEditing ? `فاکتور ${finalizedInvoice.id} با موفقیت ویرایش شد.` : `فاکتور ${finalizedInvoice.id} با موفقیت ثبت شد.`);
    
    setOrderItems([]);
    if (isEditing) {
      onFinishEdit();
    } else {
      setDiscount(0);
      setTableNumber('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-full max-h-[85vh]">
      <h2 className="text-xl font-bold mb-4 border-b pb-2">
        {invoiceToEdit ? `ویرایش فیش ${invoiceToEdit.id}` : 'سفارش فعلی'}
      </h2>
      <div className="flex-grow overflow-y-auto">
        {orderItems.length === 0 ? (
          <p className="text-gray-500 text-center py-10">سبد خرید خالی است.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orderItems.map(item => (
              <li key={item.item_id} className="py-3 flex items-center">
                <div className="flex-grow">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price, settings?.currency || '')}</p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button onClick={() => updateQuantity(item.item_id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><PlusIcon size={14} /></button>
                  <span className="w-8 text-center font-mono">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.item_id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><MinusIcon size={14} /></button>
                  <button onClick={() => updateQuantity(item.item_id, 0)} className="text-red-500 hover:text-red-700"><Trash2Icon size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 border-t pt-4">
        <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>جمع کل:</span><span>{formatCurrency(subtotal, settings?.currency || '')}</span></div>
            <div className="flex justify-between items-center">
                <span>تخفیف:</span>
                <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-24 p-1 border rounded text-left" dir="ltr"/>
            </div>
            <div className="flex justify-between"><span>مالیات ({settings?.vatPercent}%):</span><span>{formatCurrency(vat, settings?.currency || '')}</span></div>
            <div className="flex justify-between font-bold text-lg text-blue-700"><span>مبلغ نهایی:</span><span>{formatCurrency(total, settings?.currency || '')}</span></div>
        </div>
        <input type="text" placeholder="شماره میز (اختیاری)" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="w-full mt-4 p-2 border rounded" />
        <button
          onClick={handleSaveInvoice}
          disabled={orderItems.length === 0}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {invoiceToEdit ? 'بروزرسانی فیش' : 'ثبت فیش'}
        </button>
      </div>
    </div>
  );
};

export default OrderPanel;