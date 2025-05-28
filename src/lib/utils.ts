import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format dates
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Function to generate a reception number
export function generateReceptionNumber(): string {
  const prefix = 'REC-';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}

// Function to format order products for Google Sheets storage
export function formatOrderProductsForSheet(order: any): string {
  return order.products.map((p: any) => 
    `${p.product.name} (${p.paletQuantity} ${p.palet.name}, ${p.cajaQuantity} ${p.caja.name})`
  ).join('; ');
}

// Function to format quantities for Google Sheets storage
export function formatOrderQuantitiesForSheet(order: any): string {
  return order.products.map((p: any) => 
    `${p.paletQuantity} palets, ${p.cajaQuantity} cajas`
  ).join('; ');
}