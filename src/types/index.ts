export interface Client {
  cif: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  category: string; 
}

export interface Palet {
  id: string;
  name: string;
}

export interface Caja {
  id: string;
  name: string;
}

export interface ProductLine {
  product: Product;
  palet: Palet;
  paletQuantity: number;
  caja: Caja;
  cajaQuantity: number;
}

export interface Order {
  receptionNumber: string;
  clientCIF: string;
  clientName: string;
  products: ProductLine[];
  status: string;
  orderNumber: string; // External order number, if any
  provider: string; // Supplier, if any
  createdAt: string; // ISO date string or formatted date string
  client?: Partial<Client>; // Optional: if client details are embedded or fetched with order
}
