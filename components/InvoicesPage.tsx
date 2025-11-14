
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as db from '../services/dbService.ts';
import { Invoice } from '../types.ts';
import { formatCurrency, exportInvoicesToCSV } from '../utils/helpers.ts';
import { PrinterIcon, Trash2Icon, EditIcon } from './icons.tsx';
import InvoiceDetailModal from './InvoiceDetailModal.tsx';

interface InvoicesPageProps {
    onEditInvoice: (invoice: Invoice) => void;
}

const InvoicesPage: React.FC<InvoicesPageProps> = ({ onEditInvoice }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const fetchInvoices = useCallback(async () => {
        const data = await db.getInvoices();
        setInvoices(data);
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleDelete = async (id: string) => {
        if (window.confirm('آیا از حذف این فاکتور اطمینان دارید؟')) {
            await db.deleteInvoice(id);
            await fetchInvoices();
        }
    };
    
    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => 
            invoice.id.includes(searchTerm) || 
            (invoice.tableNumber && invoice.tableNumber.includes(searchTerm))
        );
    }, [invoices, searchTerm]);

    const handleExport = async () => {
        const allInvoices = await db.getInvoices();
        if (allInvoices.length === 0) {
            alert("هیچ فاکتوری برای خروجی گرفتن وجود ندارد.");
            return;
        }
        exportInvoicesToCSV(allInvoices);
    };
    
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">لیست فاکتورها</h2>
              <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                خروجی CSV
              </button>
            </div>
            <input 
                type="text"
                placeholder="جستجو بر اساس شماره فیش یا میز..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md mb-4"
            />
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">شماره فیش</th>
                            <th className="p-3">تاریخ</th>
                            <th className="p-3">زمان</th>
                            <th className="p-3">مبلغ کل</th>
                            <th className="p-3">میز</th>
                            <th className="p-3">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(invoice => (
                            <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono text-sm">{invoice.id}</td>
                                <td className="p-3">{invoice.persianDate}</td>
                                <td className="p-3">{new Date(invoice.timestamp).toLocaleTimeString('fa-IR')}</td>
                                <td className="p-3">{formatCurrency(invoice.total, '')}</td>
                                <td className="p-3">{invoice.tableNumber || '-'}</td>
                                <td className="p-3 flex space-x-2 space-x-reverse">
                                    <button onClick={() => setSelectedInvoice(invoice)} className="text-blue-600 hover:text-blue-800" title="چاپ/مشاهده"><PrinterIcon /></button>
                                    <button onClick={() => onEditInvoice(invoice)} className="text-yellow-600 hover:text-yellow-800" title="ویرایش"><EditIcon /></button>
                                    <button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:text-red-800" title="حذف"><Trash2Icon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredInvoices.length === 0 && <p className="text-center py-8 text-gray-500">هیچ فاکتوری یافت نشد.</p>}
            </div>
            {selectedInvoice && (
                <InvoiceDetailModal 
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
};

export default InvoicesPage;