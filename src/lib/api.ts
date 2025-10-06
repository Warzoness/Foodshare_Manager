// Legacy API client - deprecated, use services instead
import { adminService, sellerService } from '@/services';

// Re-export services for backward compatibility
export { adminService, sellerService };

// Legacy API client methods for backward compatibility
export const apiClient = {
  // Admin methods
  getStores: adminService.getStores.bind(adminService),
  getStore: adminService.getStore.bind(adminService),
  updateStore: adminService.updateStore.bind(adminService),
  deleteStore: adminService.deleteStore.bind(adminService),
  getUsers: adminService.getUsers.bind(adminService),
  getUser: adminService.getUser.bind(adminService),
  updateUser: adminService.updateUser.bind(adminService),
  getOrders: adminService.getOrders.bind(adminService),
  getOrder: adminService.getOrder.bind(adminService),
  updateOrderStatus: adminService.updateOrderStatus.bind(adminService),
  getProducts: adminService.getProducts.bind(adminService),
  getProduct: adminService.getProduct.bind(adminService),
  getProductsByShop: adminService.getProductsByShop.bind(adminService),
  updateProduct: adminService.updateProduct.bind(adminService),
  deleteProduct: adminService.deleteProduct.bind(adminService),
  getReports: adminService.getReports.bind(adminService),
  exportData: adminService.exportData.bind(adminService),
  createAdmin: adminService.createAdmin.bind(adminService),
  updateAdmin: adminService.updateAdmin.bind(adminService),
  deleteAdmin: adminService.deleteAdmin.bind(adminService),

  // Seller methods
  getSellerShop: sellerService.getShop.bind(sellerService),
  createSellerShop: sellerService.createShop.bind(sellerService),
  updateSellerShop: sellerService.updateShop.bind(sellerService),
  getSellerProduct: sellerService.getProduct.bind(sellerService),
  getSellerShopProducts: sellerService.getShopProducts.bind(sellerService),
  createSellerProduct: sellerService.createProduct.bind(sellerService),
  updateSellerProduct: sellerService.updateProduct.bind(sellerService),
  deleteSellerProduct: sellerService.deleteProduct.bind(sellerService),
};
