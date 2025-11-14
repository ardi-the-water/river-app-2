import { parseCSV } from '../utils/helpers';
import { MenuItem } from '../types';

export const fetchMenuData = async (url: string): Promise<MenuItem[]> => {
  if (!url) {
    throw new Error('Google Sheets URL is not configured.');
  }

  if (url.includes('/edit')) {
      throw new Error('آدرس وارد شده صحیح نیست. لطفاً از منوی File -> Share -> Publish to web در گوگل شیت، لینک CSV را کپی کنید.');
  }

  let csvUrl = url;
  if (url.includes('/pubhtml')) {
    csvUrl = url.replace('/pubhtml', '/pub?output=csv');
  } else if (url.includes('/pub?') && !url.includes('output=csv')) {
    csvUrl = `${url}&output=csv`;
  }
  
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText}`);
    }
    const csvText = await response.text();
    const parsedData = parseCSV(csvText);
    
    // Validate and map to MenuItem type, handling different capitalizations
    const menuItems: MenuItem[] = parsedData
      .map((item, index) => {
        const name = item.name || item.Name;
        const price = item.price || item.Price;
        const category = item.category || item.Category;
        // Default to active=true if the column is missing
        const active = item.active ?? item.Active ?? true; 
        // Generate an id if not present
        const itemId = item.item_id || item.id || `${name}-${index}`;

        return {
          item_id: String(itemId),
          name: String(name),
          price: Number(price),
          category: String(category),
          active: String(active).toLowerCase() === 'true',
        };
      })
      .filter(item => item.name && item.name !== 'undefined' && !isNaN(item.price) && item.active);
    
    if (menuItems.length === 0 && parsedData.length > 0) {
        throw new Error('منو بارگیری شد اما ستون‌ها (name/Name, price/Price, category/Category) با فرمت مورد انتظار مطابقت ندارند.');
    }

    return menuItems;
  } catch (error) {
    console.error("Error fetching or parsing menu data:", error);
    if (error instanceof Error) {
        throw error; // Re-throw the specific error message
    }
    throw new Error('خطا در دریافت اطلاعات از گوگل شیت. از درستی لینک و اتصال اینترنت اطمینان حاصل کنید.');
  }
};