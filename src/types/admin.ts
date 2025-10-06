// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SELLER';
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  id: number;
  shopId: number;
  shopName: string;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  detailImageUrl: string | null;
  quantityAvailable: number;
  quantityPending: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Product Detail type (includes shop information)
export interface ProductDetail extends Product {
  shopId: number;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
}

// Update Product Request type
export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  detailImageUrl: string;
  quantityAvailable: number;
  quantityPending: number;
  status: string;
  categoryId: number;
}

// Store types
export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalProducts: number;
}

// Store Detail types (includes products)
export interface StoreDetail extends Store {
  products: Product[];
}

// Update Store Request type
export interface UpdateStoreRequest {
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  status: string;
}

// API Response types for stores - actual response structure
export interface StoreApiResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Store[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// API Response types for products - actual response structure
export interface ProductsApiResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Product[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}


// Order types
export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

// API Order types (matching actual API response)
export interface ApiOrder {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shopId: number;
  shopName: string;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  status: string;
  statusDescription: string;
  pickupTime: string;
  expiresAt: string;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrderResponse {
  code: string;
  success: boolean;
  data: {
    content: ApiOrder[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}