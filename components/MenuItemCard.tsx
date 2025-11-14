
import React, { useContext } from 'react';
import { MenuItem } from '../types';
import { AppContext } from '../App';
import { formatCurrency } from '../utils/helpers';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToOrder }) => {
  const { settings } = useContext(AppContext);

  return (
    <button
      onClick={() => onAddToOrder(item)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden text-center p-3 flex flex-col justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
    >
      <h3 className="font-semibold text-gray-800 text-sm md:text-base leading-tight mb-2">{item.name}</h3>
      <p className="text-blue-600 font-bold text-xs md:text-sm">
        {formatCurrency(item.price, settings?.currency || '')}
      </p>
    </button>
  );
};

export default MenuItemCard;
