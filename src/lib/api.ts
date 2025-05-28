import { Client, Product, Palet, Caja, Order, ProductLine } from '@/types';
import { sheetsApi } from './sheets';

// Fetch clients from the "CLIENTES" sheet
export const fetchClientes = async (): Promise<Client[]> => {
  try {
    const lastRow = await sheetsApi.getLastRowWithData('CLIENTES');
    const values = await sheetsApi.fetchSheet(`CLIENTES!A2:E${lastRow}`);
    
    return values.filter(row => row[0]).map((row: any[]) => ({
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
    const lastRow = await sheetsApi.getLastRowWithData('PRODUCTOS');
    const values = await sheetsApi.fetchSheet(`PRODUCTOS!A2:B${lastRow}`);
    
    return values.filter(row => row[0]).map((row: any[]) => ({
      id: String(row[0]).trim(),
      name: row[1]
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Fetch palets from the "PALETS" sheet
export const fetchPalets = async (): Promise<Palet[]> => {
  try {
    const lastRow = await sheetsApi.getLastRowWithData('PALETS');
    const values = await sheetsApi.fetchSheet(`PALETS!A2:B${lastRow}`);
    
    return values.filter(row => row[0]).map((row: any[]) => ({
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
    const lastRow = await sheetsApi.getLastRowWithData('CAJAS');
    const values = await sheetsApi.fetchSheet(`CAJAS!A2:B${lastRow}`);
    
    return values.filter(row => row[0]).map((row: any[]) => ({
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
    const values = order.products.map(product => [
      order.receptionNumber,      // N SOLICITUD
      order.clientCIF,           // CIF_CLIENTE
      order.clientName,          // NOMBRE_CLIENTE
      product.product.name,      // PRODUCTOS
      product.palet.name,        // PALET
      product.paletQuantity,     // CANT (Palet)
      product.caja.name,         // CAJAS
      product.cajaQuantity,      // CANT (Cajas)
      order.status,             // Status
      order.orderNumber,        // N Pedido
      order.provider,           // Proveedor
      order.createdAt           // Fecha
    ]);

    await sheetsApi.appendToSheet('PEDIDOS!A2:L', values);
    return order;
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
      order.status,
      order.orderNumber,
      order.provider,
      order.createdAt
    ]);

    await sheetsApi.appendToSheet('PEDIDOS!A2:L', values);
    return order;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Fetch orders - groups rows by receptionNumber and clientCIF
export const fetchPedidos = async (): Promise<Order[]> => {
  try {
    const lastRow = await sheetsApi.getLastRowWithData('PEDIDOS');
    const values = await sheetsApi.fetchSheet(`PEDIDOS!A2:L${lastRow}`);
    
    // Group rows by receptionNumber and clientCIF
    const orderMap = new Map<string, Order>();
    
    values.filter(row => row[0]).forEach((row: any[]) => {
      const key = `${row[0]}_${row[1]}`; // receptionNumber_clientCIF
      
      const productLine: ProductLine = {
        product: { id: '', name: row[3] },
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
          createdAt: row[11] || new Date().toISOString()
        });
      }
    });
    
    return Array.from(orderMap.values());
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};