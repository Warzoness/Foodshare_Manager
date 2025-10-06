// Test file for auth functions
import { hasRole, canAccessStore } from '../auth';
import { User } from '@/types';

// Mock API response
const mockApiResponse = {
  code: "200",
  success: true,
  data: {
    id: 3,
    name: "Chien Tran",
    email: "tranminhchien@gmail.com",
    role: "ADMIN",
    accessToken: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyOjMiLCJ1aWQiOjMsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJiYWNrb2ZmaWNlIiwiZW1haWwiOiJ0cmFubWluaGNoaWVuQGdtYWlsLmNvbSIsImlhdCI6MTc1ODgwMjk1NCwiZXhwIjoxNzU5NjY2OTU0fQ.EOv6hEp6IGSmkWk090t4UrcEG4Bf314sHCSSA85AmjQ",
    tokenType: "Bearer",
    expiresAt: "2025-09-26T12:22:34.54591218",
    message: "Đăng nhập thành công"
  }
};

// Mock User objects
const adminUser = {
  id: '1',
  email: 'admin@test.com',
  name: 'Admin User',
  role: 'ADMIN' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sellerUser = {
  id: '2',
  email: 'seller@test.com',
  name: 'Seller User',
  role: 'SELLER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Auth Functions', () => {
  describe('hasRole', () => {
    it('should return true for admin user with admin role', () => {
      expect(hasRole(adminUser, 'admin')).toBe(true);
    });

    it('should return true for seller user with seller role', () => {
      expect(hasRole(sellerUser, 'seller')).toBe(true);
    });

    it('should return false for admin user with seller role', () => {
      expect(hasRole(adminUser, 'seller')).toBe(false);
    });

    it('should return false for seller user with admin role', () => {
      expect(hasRole(sellerUser, 'admin')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasRole(null, 'admin')).toBe(false);
    });

    it('should return false for user without role', () => {
      const userWithoutRole = { ...adminUser, role: undefined as never };
      expect(hasRole(userWithoutRole, 'admin')).toBe(false);
    });
  });

  describe('canAccessStore', () => {
    it('should return true for admin user', () => {
      expect(canAccessStore(adminUser, 'store1')).toBe(true);
    });

    it('should return false for seller user', () => {
      expect(canAccessStore(sellerUser, 'store1')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(canAccessStore(null, 'store1')).toBe(false);
    });
  });

  describe('API Response Parsing', () => {
    it('should correctly parse API response structure', () => {
      const { id, name, email, role, accessToken } = mockApiResponse.data;
      
      expect(id).toBe(3);
      expect(name).toBe("Chien Tran");
      expect(email).toBe("tranminhchien@gmail.com");
      expect(role).toBe("ADMIN");
      expect(accessToken).toBeDefined();
    });

    it('should create User object from API response', () => {
      const { id, name, email, role } = mockApiResponse.data;
      
      const user: User = {
        id: id.toString(),
        name,
        email,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBe("3");
      expect(user.name).toBe("Chien Tran");
      expect(user.email).toBe("tranminhchien@gmail.com");
      expect(user.role).toBe("ADMIN");
    });
  });
});
