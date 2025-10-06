// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NODE_ENV === 'development' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'https://foodshare-production-98da.up.railway.app'),
    ordersBaseUrl: process.env.NEXT_PUBLIC_ORDERS_API_URL || 'https://foodshare-production-98da.up.railway.app',
    timeout: 10000, // 10 seconds
  },
  
  // App Configuration
  app: {
    name: 'FoodShare Manager',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Feature Flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    enableDarkMode: true,
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
} as const;

// Type for configuration
export type Config = typeof config;

// Helper function to get API URL
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.api.baseUrl.endsWith('/') 
    ? config.api.baseUrl.slice(0, -1) 
    : config.api.baseUrl;
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
    
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper function to check if running in development
export const isDevelopment = () => config.app.environment === 'development';

// Helper function to check if running in production
export const isProduction = () => config.app.environment === 'production';
