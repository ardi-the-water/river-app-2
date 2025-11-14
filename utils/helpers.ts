import { Invoice } from '../types';

export const parseCSV = (csvText: string): Record<string, any>[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      let value: any = values[index];
      if (!isNaN(Number(value)) && value !== '') {
        value = Number(value);
      } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        value = value.toLowerCase() === 'true';
      }
      row[header] = value;
    });
    rows.push(row);
  }
  return rows;
};

export const toPersianDate = (gregorianDate: Date): string => {
    const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    let gy = gregorianDate.getFullYear();
    let gm = gregorianDate.getMonth() + 1;
    let gd = gregorianDate.getDate();

    let jy, jm, jd;
    let g_day_no, j_day_no;
    let j_np;

    let i;

    gy = gy - 1600;
    gd = gd - 1;

    g_day_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);

    for (i = 0; i < gm - 1; ++i)
        g_day_no += g_days_in_month[i];
    if (gm > 2 && ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)))
        g_day_no++;
    g_day_no += gd;

    j_day_no = g_day_no - 79;

    j_np = Math.floor(j_day_no / 12053);
    j_day_no %= 12053;

    jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);

    j_day_no %= 1461;

    if (j_day_no >= 366) {
        jy += Math.floor((j_day_no - 1) / 365);
        j_day_no = (j_day_no - 1) % 365;
    }

    for (i = 0; i < 11 && j_day_no >= j_days_in_month[i]; ++i) {
        j_day_no -= j_days_in_month[i];
    }
    jm = i + 1;
    jd = j_day_no + 1;

    return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
};

export const generateInvoiceId = (): string => {
    const d = new Date();
    const year = d.getFullYear().toString().slice(-2);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

export const exportInvoicesToCSV = (invoices: Invoice[]) => {
  const headers = [
    "شماره فیش", "تاریخ", "زمان", "میز", 
    "نام آیتم", "دسته", "تعداد", "قیمت واحد", "جمع آیتم",
    "جمع کل", "تخفیف", "مالیات", "مبلغ نهایی"
  ];

  const rows = invoices.flatMap(invoice => 
    invoice.items.map(item => [
      `"${invoice.id}"`, // Enclose in quotes to ensure it's treated as text
      invoice.persianDate,
      new Date(invoice.timestamp).toLocaleTimeString('fa-IR'),
      invoice.tableNumber || '',
      `"${item.name.replace(/"/g, '""')}"`, // Handle quotes in item name
      `"${item.category.replace(/"/g, '""')}"`,
      item.quantity,
      item.price,
      item.price * item.quantity,
      invoice.subtotal,
      invoice.discount,
      invoice.vat.toFixed(2),
      invoice.total.toFixed(2)
    ].join(','))
  );

  const csvString = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `invoices-export-${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fa-IR')} ${currency}`;
};