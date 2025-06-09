import { Client, Product, Palet, Caja, Order, ProductLine } from '@/types';
import { sheetsApi } from './sheets';

// Fetch clients from the "CLIENTES" sheet
export const fetchClientes = async (): Promise<Client[]> => {
  try {
    // Usar un rango fijo grande (ej: hasta fila 1000) en lugar de lastRow
    const values = await sheetsApi.fetchSheet('CLIENTES!A2:E1000');
    
    return values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map((row: any[]) => ({
        cif: String(row[0]).trim().toUpperCase(),
        name: row[1],
      address: row[2] || '',
      phone: row[3] || '',
      email: row[4] || ''
    }));
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

// Fetch products from the "PRODUCTOS" sheet
export const fetchProductos = async (): Promise<Product[]> => {
  try {
    // Usar un rango fijo grande (ej: hasta fila 1000) para incluir la nueva columna CATEGORIA
    const values = await sheetsApi.fetchSheet('PRODUCTOS!A2:C1000');
    
    return values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map((row: any[]) => ({
        id: String(row[0]).trim(),
        name: row[1],
        category: row[2] ? String(row[2]).trim() : 'OTROS' // New category column
      }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Fetch palets from the "PALETS" sheet
export const fetchPalets = async (): Promise<Palet[]> => {
  try {
    // Usar un rango fijo grande (ej: hasta fila 1000) en lugar de lastRow
    const values = await sheetsApi.fetchSheet('PALETS!A2:B1000');
    
    return values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map((row: any[]) => ({
        id: String(row[0]).trim(),
        name: row[1]
    }));
  } catch (error) {
    console.error('Error fetching palets:', error);
    return [];
  }
};

// Fetch cajas from the "CAJAS" sheet
export const fetchCajas = async (): Promise<Caja[]> => {
  try {
      // Usar un rango fijo grande (ej: hasta fila 1000) en lugar de lastRow
    const values = await sheetsApi.fetchSheet('CAJAS!A2:B1000');
    
    return values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map((row: any[]) => ({
        id: String(row[0]).trim(),
        name: row[1]
    }));
  } catch (error) {
    console.error('Error fetching cajas:', error);
    return [];
  }
};

// Save a new order - creates one row per product
export const saveOrder = async (order: Order): Promise<Order> => {
  try {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Para usar formato 24 horas
    });

    const values = order.products.map(product => [
      order.receptionNumber,      // N SOLICITUD
      order.clientCIF,           // CIF_CLIENTE
      order.clientName,          // NOMBRE_CLIENTE
      product.product.name,      // PRODUCTOS
      product.palet.name,        // PALET
      product.paletQuantity,     // CANT (Palet)
      product.caja.name,         // CAJAS
      product.cajaQuantity,      // CANT (Cajas)
      'Pendiente',              // Status (default)
      '',                       // N Pedido (empty)
      '',                       // Proveedor (empty)
      currentDate               // Fecha actual
    ]);

    await sheetsApi.appendToSheet('PEDIDOS!A2:L', values);
    return {
      ...order,
      status: 'Pendiente',
      orderNumber: '',
      provider: '',
      createdAt: currentDate
    };
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

// Update an existing order
export const updateOrder = async (order: Order): Promise<Order> => {
  try {
    // First, delete all rows for this order
    await sheetsApi.deleteOrderRows(order.receptionNumber, order.clientCIF);
    
    const currentDate = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Then insert new rows for each product
    const values = order.products.map(product => [
      order.receptionNumber,
      order.clientCIF,
      order.clientName,
      product.product.name,
      product.palet.name,
      product.paletQuantity,
      product.caja.name,
      product.cajaQuantity,
      order.status || 'Pendiente',
      order.orderNumber || '',
      order.provider || '',
      currentDate
    ]);

    await sheetsApi.appendToSheet('PEDIDOS!A2:L', values);
    return {
      ...order,
      createdAt: currentDate
    };
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Fetch orders - groups rows by receptionNumber and clientCIF
export const fetchPedidos = async (): Promise<Order[]> => {
  try {
    const values = await sheetsApi.fetchSheet('PEDIDOS!A2:L1000');
    
    // Group rows by receptionNumber and clientCIF
    const orderMap = new Map<string, Order>();
    
    values.filter(row => row[0] && row[0].toString().trim() !== '').forEach((row: any[]) => {
      const key = `${row[0]}_${row[1]}`; // receptionNumber_clientCIF
      
      const productLine: ProductLine = {
        product: { id: '', name: row[3], category: '' }, // Category not stored in PEDIDOS sheet
        palet: { id: '', name: row[4] },
        paletQuantity: Number(row[5]),
        caja: { id: '', name: row[6] },
        cajaQuantity: Number(row[7])
      };
      
      if (orderMap.has(key)) {
        const order = orderMap.get(key)!;
        order.products.push(productLine);
      } else {
        orderMap.set(key, {
          receptionNumber: row[0],
          clientCIF: row[1],
          clientName: row[2],
          products: [productLine],
          status: row[8] || 'Pendiente',
          orderNumber: row[9] || '',
          provider: row[10] || '',
          createdAt: row[11] || new Date().toLocaleDateString('es-ES')
        });
      }
    });
    
    return Array.from(orderMap.values());
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};
