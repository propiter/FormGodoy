import { Client, Product, Palet, Caja, Order, ProductLine } from '@/types';
import { sheetsApi } from './sheets';

// Fetch clients from the "CLIENTES" sheet
export const fetchClientes = async (): Promise<Client[]> => {
  try {
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
    const values = await sheetsApi.fetchSheet('PRODUCTOS!A2:C1000');
    
    return values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map((row: any[]) => ({
        id: String(row[0]).trim(),
        name: String(row[1]).trim(), // Ensure name is trimmed for matching
        category: row[2] ? String(row[2]).trim() : 'Sin Categoría'
      }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Fetch palets from the "PALETS" sheet
export const fetchPalets = async (): Promise<Palet[]> => {
  try {
    const values = await sheetsApi.fetchSheet('PALETS!A2:B1000');
    
    return values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map((row: any[]) => ({
        id: String(row[0]).trim(),
        name: String(row[1]).trim() // Ensure name is trimmed for matching
    }));
  } catch (error) {
    console.error('Error fetching palets:', error);
    return [];
  }
};

// Fetch cajas from the "CAJAS" sheet
export const fetchCajas = async (): Promise<Caja[]> => {
  try {
    const values = await sheetsApi.fetchSheet('CAJAS!A2:B1000');
    
    return values
      .filter(row => row[0] && row[0].toString().trim() !== '')
      .map((row: any[]) => ({
        id: String(row[0]).trim(),
        name: String(row[1]).trim() // Ensure name is trimmed for matching
    }));
  } catch (error) {
    console.error('Error fetching cajas:', error);
    return [];
  }
};

// Save a new order - uses the original structure for "Pedidos"
// NUM_PEDIDO | CIF_CLIENTE | NOMBRE_CLIENTE | PRODUCTOS | PALET | CANT_PALETS | CAJAS | CANT_CAJAS | STATUS | FECHA
export const saveOrder = async (order: Order): Promise<Order> => {
  try {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const values = order.products.map(productLine => [
      order.receptionNumber,        // NUM_PEDIDO
      order.clientCIF,             // CIF_CLIENTE
      order.clientName,            // NOMBRE_CLIENTE
      productLine.product.name,    // PRODUCTOS (name only)
      productLine.palet.name,      // PALET (name only)
      productLine.paletQuantity,   // CANT_PALETS
      productLine.caja.name,       // CAJAS (name only)
      productLine.cajaQuantity,    // CANT_CAJAS
      'Pendiente',                // STATUS
      currentDate                 // FECHA
    ]);

    // Rango para 10 columnas (A hasta J)
    await sheetsApi.appendToSheet('PEDIDOS!A2:J', values); 
    
    return {
      ...order,
      status: 'Pendiente',
      orderNumber: order.orderNumber || '', 
      provider: order.provider || '',
      createdAt: currentDate
    };
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

// Update an existing order (flujo antiguo de Google Sheets, si aún se usa)
// This function would also need to be aware of the name-based matching if it were to
// correctly reconstruct orders for updating the sheet directly.
// However, the primary update flow is via webhook.
export const updateOrder = async (order: Order): Promise<Order> => {
  try {
    console.warn("updateOrder (Google Sheets direct) is using names. The webhook flow is preferred for updates.");

    await sheetsApi.deleteOrderRows(order.receptionNumber, order.clientCIF);
    
    const currentDate = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const values = order.products.map(productLine => [
      order.receptionNumber,
      order.clientCIF,
      order.clientName,
      productLine.product.name,    // PRODUCTOS (name)
      productLine.palet.name,      // PALET (name)
      productLine.paletQuantity,   // CANT_PALETS
      productLine.caja.name,       // CAJAS (name)
      productLine.cajaQuantity,    // CANT_CAJAS
      order.status || 'Pendiente',
      currentDate
    ]);

    await sheetsApi.appendToSheet('PEDIDOS!A2:J', values); // Rango para 10 columnas
    return {
      ...order,
      createdAt: currentDate
    };
  } catch (error) {
    console.error('Error updating order (Google Sheets direct):', error);
    throw error;
  }
};

// Fetch orders - groups rows by receptionNumber and clientCIF
// Enriches product lines with IDs and category by matching names.
// "Pedidos" sheet structure:
// 0:NUM_PEDIDO | 1:CIF_CLIENTE | 2:NOMBRE_CLIENTE | 3:PRODUCTOS (name) | 4:PALET (name) | 
// 5:CANT_PALETS | 6:CAJAS (name) | 7:CANT_CAJAS | 8:STATUS | 9:FECHA
export const fetchPedidos = async (): Promise<Order[]> => {
  try {
    // Fetch all master data for lookups
    const [allProducts, allPalets, allCajas, pedidoValues] = await Promise.all([
      fetchProductos(),
      fetchPalets(),
      fetchCajas(),
      sheetsApi.fetchSheet('PEDIDOS!A2:J1000') // 10 columnas (A to J)
    ]);

    // Create lookup maps for efficient searching (name -> object)
    // Normalize names to uppercase for robust matching
    const productMap = new Map(allProducts.map(p => [p.name.toUpperCase(), p]));
    const paletMap = new Map(allPalets.map(p => [p.name.toUpperCase(), p]));
    const cajaMap = new Map(allCajas.map(c => [c.name.toUpperCase(), c]));
    
    const orderMap = new Map<string, Order>();
    
    pedidoValues.filter(row => row[0] && row[0].toString().trim() !== '').forEach((row: any[]) => {
      const key = `${String(row[0]).trim()}_${String(row[1]).trim()}`; // NUM_PEDIDO_CIF_CLIENTE
      
      const productNameFromSheet = String(row[3]).trim().toUpperCase();
      const paletNameFromSheet = String(row[4]).trim().toUpperCase();
      const cajaNameFromSheet = String(row[6]).trim().toUpperCase();

      const matchedProduct = productMap.get(productNameFromSheet);
      const matchedPalet = paletMap.get(paletNameFromSheet);
      const matchedCaja = cajaMap.get(cajaNameFromSheet);

      if (!matchedProduct) {
        console.warn(`Product not found in master data for name: "${String(row[3]).trim()}" in order ${String(row[0]).trim()}`);
      }
      if (!matchedPalet) {
        console.warn(`Palet not found in master data for name: "${String(row[4]).trim()}" in order ${String(row[0]).trim()}`);
      }
      if (!matchedCaja) {
        console.warn(`Caja not found in master data for name: "${String(row[6]).trim()}" in order ${String(row[0]).trim()}`);
      }

      const productLine: ProductLine = {
        product: { 
          id: matchedProduct?.id || '',       // ID from lookup
          name: String(row[3]).trim(),        // Original name from Pedidos
          category: matchedProduct?.category || '' // Category from lookup
        },
        palet: { 
          id: matchedPalet?.id || '',         // ID from lookup
          name: String(row[4]).trim()         // Original name from Pedidos
        },
        paletQuantity: Number(row[5]),        // CANT_PALETS
        caja: { 
          id: matchedCaja?.id || '',          // ID from lookup
          name: String(row[6]).trim()         // Original name from Pedidos
        },
        cajaQuantity: Number(row[7])          // CANT_CAJAS
      };
      
      if (orderMap.has(key)) {
        const order = orderMap.get(key)!;
        order.products.push(productLine);
      } else {
        orderMap.set(key, {
          receptionNumber: String(row[0]).trim(), // NUM_PEDIDO
          clientCIF: String(row[1]).trim(),       // CIF_CLIENTE
          clientName: String(row[2]).trim(),      // NOMBRE_CLIENTE
          products: [productLine],
          status: String(row[8]).trim() || 'Pendiente', // STATUS
          orderNumber: '', 
          provider: '',    
          createdAt: String(row[9]).trim() || new Date().toLocaleDateString('es-ES') // FECHA
        });
      }
    });
    
    return Array.from(orderMap.values());
  } catch (error) {
    console.error('Error fetching orders with name matching:', error);
    return [];
  }
};
