// Client type - represents a row in the CLIENTES sheet
export interface Client {
  cif: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

// Product type - represents a row in the PRODUCTOS sheet
export interface Product {
  id: string;
  name: string;
  category?: string;
}

// Palet type - represents a row in the PALETS sheet
export interface Palet {
  id: string;
  name: string;
}

// Caja type - represents a row in the CAJAS sheet
export interface Caja {
  id: string;
  name: string;
}

// ProductLine type - represents a product line in an order
export interface ProductLine {
  product: Product;
  palet: Palet;
  paletQuantity: number;
  caja: Caja;
  cajaQuantity: number;
}

// Order type - represents a group of rows in the PEDIDOS sheet
export interface Order {
  receptionNumber: string;  // N SOLICITUD
  clientCIF: string;       // CIF_CLIENTE
  clientName: string;      // NOMBRE_CLIENTE
  products: ProductLine[]; // Cada producto será una fila en la hoja
  status: string;         // Status
  orderNumber: string;    // N Pedido
  provider: string;       // Proveedor
  createdAt: string;      // Fecha
}