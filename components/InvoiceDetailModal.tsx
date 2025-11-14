
import React, { useContext } from 'react';
import { Invoice } from '../types';
import { AppContext } from '../App';
import { formatCurrency } from '../utils/helpers';
import { XIcon, PrinterIcon } from './icons';

interface InvoiceDetailModalProps {
    invoice: Invoice;
    onClose: () => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
    const { settings } = useContext(AppContext);

    const handlePrint = () => {
        window.print();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 no-print">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">مشاهده فیش</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                </div>

                <div className="p-6 overflow-y-auto" id="printable-invoice">
                  <div className="print-area font-mono text-xs" style={{ fontFamily: 'Vazirmatn, monospace' }}>
                    <div className="text-center">
                        <h2 className="text-sm font-bold">{settings?.cafeName}</h2>
                        {settings?.receiptHeader && <p className="text-xs">{settings.receiptHeader}</p>}
                        {settings?.cafePhone && <p className="text-xs">تلفن: {settings.cafePhone}</p>}
                    </div>
                    <div className="border-t border-b border-dashed my-2 py-1 text-xs">
                        <p>شماره فیش: {invoice.id}</p>
                        <p>تاریخ: {invoice.persianDate} - {new Date(invoice.timestamp).toLocaleTimeString('fa-IR')}</p>
                        {invoice.tableNumber && <p>میز: {invoice.tableNumber}</p>}
                    </div>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-dashed">
                                <th className="text-right py-1">آیتم</th>
                                <th className="text-center py-1">تعداد</th>
                                <th className="text-left py-1">مبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map(item => (
                                <tr key={item.item_id}>
                                    <td className="py-1">{item.name}</td>
                                    <td className="text-center py-1">{item.quantity}</td>
                                    <td className="text-left py-1">{formatCurrency(item.price * item.quantity, '')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="border-t border-dashed my-2 pt-2 text-xs">
                        <p className="flex justify-between"><span>جمع کل:</span><span>{formatCurrency(invoice.subtotal, '')}</span></p>
                        <p className="flex justify-between"><span>تخفیف:</span><span>{formatCurrency(invoice.discount, '')}</span></p>
                        <p className="flex justify-between"><span>مالیات ({settings?.vatPercent}%):</span><span>{formatCurrency(invoice.vat, '')}</span></p>
                        <p className="flex justify-between font-bold text-sm mt-1"><span>مبلغ نهایی:</span><span>{formatCurrency(invoice.total, settings?.currency || 'تومان')}</span></p>
                    </div>
                    {settings?.receiptFooter && <p className="text-center text-xs mt-2">{settings.receiptFooter}</p>}
                  </div>
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <button onClick={handlePrint} className="w-full flex justify-center items-center space-x-2 space-x-reverse bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                        <PrinterIcon />
                        <span>چاپ فیش</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailModal;
