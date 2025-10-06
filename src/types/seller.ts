// Seller Shop types
export interface SellerShop {
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
}

export interface CreateSellerShopRequest {
  name: string;
  address: string;
  phone: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  rating?: number;
  status?: string; // "1" for active, "0" for inactive
}

export interface UpdateSellerShopRequest {
  name?: string;
  address?: string;
  phone?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  rating?: number;
  status?: string;
}

// Seller Product types
export interface SellerProduct {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  detailImageUrl: string;
  detailImages?: string[];
  quantityAvailable: number;
  quantityPending: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSellerProductRequest {
  shopId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  detailImageUrl: string;
  detailImages?: string[];
  quantityAvailable: number;
  quantityPending: number;
  status: string;
}

export interface UpdateSellerProductRequest {
  shopId?: number;
  categoryId?: number;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  imageUrl?: string;
  detailImageUrl?: string;
  detailImages?: string[];
  quantityAvailable?: number;
  quantityPending?: number;
  status?: string;
}
