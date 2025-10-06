import { ApiClient } from './baseService';
import { AdminService } from './adminService';
import { SellerService } from './sellerService';
import { imageUploadService } from './imageUploadService';
import { adminManagementService } from './adminManagementService';
import { userService } from './userService';
import { storeManagementService } from './storeManagementService';
import { dashboardService } from './dashboardService';
import { config } from '@/lib/config';

// Create API client instance
const apiClient = new ApiClient(config.api.baseUrl);

// Create service instances
export const adminService = new AdminService(apiClient);
export const sellerService = new SellerService(apiClient);

// Export services
export { 
  imageUploadService, 
  adminManagementService, 
  userService,
  storeManagementService,
  dashboardService
};

// Export the base API client for direct use if needed
export { apiClient };

// Export service classes for custom instances
export { ApiClient, AdminService, SellerService };
