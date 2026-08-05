import { useState } from 'react';

export interface BaseItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function useDocumentItems<T extends BaseItem>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const addItem = (defaultItem?: Partial<T>) => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      ...defaultItem,
    } as T;
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = <K extends keyof T>(id: string, field: K, value: T[K]) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
  };
}
