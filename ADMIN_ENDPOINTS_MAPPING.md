# Admin Manager - API Endpoints Mapping

Dựa trên [Swagger UI Documentation](https://foodshare-production-98da.up.railway.app/swagger-ui/index.html)

## 🏪 **1. Dashboard (Tổng quan)**
**Trang:** `/admin/dashboard`

### Endpoints cần thiết:
```
GET /api/back-office/dashboard/stats
- Tổng số cửa hàng
- Cửa hàng hoạt động  
- Tổng số seller
- Doanh thu tháng

GET /api/back-office/dashboard/recent-activities
- Hoạt động gần đây
- Đơn hàng mới
- Cửa hàng mới đăng ký
```

---

## 🏪 **2. Quản lý Cửa hàng**
**Trang:** `/admin/stores`

### Endpoints (Đã cập nhật theo backend thực tế):
```
GET /api/admin/shops
- Lấy danh sách cửa hàng
- Params: page, size, search, status

GET /api/admin/shops/{id}
- Chi tiết cửa hàng

PUT /api/admin/shops/{id}
- Cập nhật thông tin cửa hàng
- Thay đổi trạng thái (ACTIVE/INACTIVE)

DELETE /api/admin/shops/{id}
- Xóa cửa hàng

POST /api/admin/shops/{id}/approve
- Duyệt cửa hàng

POST /api/admin/shops/{id}/reject
- Từ chối cửa hàng
```

---

## 🍕 **3. Quản lý Sản phẩm**
**Trang:** `/admin/products`

### Endpoints (Có thể cần cập nhật):
```
GET /api/admin/products
- Lấy danh sách sản phẩm
- Params: page, size, search, category, status

GET /api/admin/products/{id}
- Chi tiết sản phẩm

PUT /api/admin/products/{id}
- Cập nhật sản phẩm

DELETE /api/admin/products/{id}
- Xóa sản phẩm

POST /api/admin/products/{id}/approve
- Duyệt sản phẩm

POST /api/admin/products/{id}/reject
- Từ chối sản phẩm
```

---

## 👥 **4. Quản lý Người dùng**
**Trang:** `/admin/users`

### Endpoints đã cập nhật:
```
GET /api/back-office/users
- Lấy danh sách users (admin, seller, user)
- Params: page, size, search, role, status

GET /api/back-office/users/{id}
- Chi tiết user

POST /api/back-office/users
- Tạo user mới

PUT /api/back-office/users/{id}
- Cập nhật thông tin user
- Thay đổi role, status

DELETE /api/back-office/users/{id}
- Xóa user

POST /api/back-office/users/{id}/activate
- Kích hoạt user

POST /api/back-office/users/{id}/deactivate
- Vô hiệu hóa user
```

---

## 📈 **5. Báo cáo**
**Trang:** `/admin/reports`

### Endpoints cần thiết:
```
GET /api/back-office/reports/sales
- Báo cáo doanh thu
- Params: startDate, endDate, storeId

GET /api/back-office/reports/orders
- Báo cáo đơn hàng
- Params: startDate, endDate, status

GET /api/back-office/reports/users
- Báo cáo người dùng
- Params: startDate, endDate, role

GET /api/back-office/reports/stores
- Báo cáo cửa hàng
- Params: startDate, endDate, status

GET /api/back-office/reports/export
- Xuất báo cáo
- Params: type, format (pdf, excel)
```

---

## ⚙️ **6. Cài đặt**
**Trang:** `/admin/settings`

### Endpoints đã cập nhật:
```
GET /api/back-office/auth/me
- Lấy thông tin admin hiện tại

PUT /api/back-office/users/{id}
- Cập nhật thông tin cá nhân

POST /api/back-office/auth/change-password
- Thay đổi mật khẩu

GET /api/back-office/users?role=ADMIN
- Lấy danh sách admin

POST /api/back-office/users
- Tạo admin mới

DELETE /api/back-office/users/{id}
- Xóa admin

GET /api/back-office/settings
- Lấy cài đặt hệ thống

PUT /api/back-office/settings
- Cập nhật cài đặt hệ thống
```

---

## 🔐 **7. Authentication**
**Các trang auth:** `/login`, `/register`

### Endpoints đã cập nhật:
```
POST /api/back-office/auth/login
- Đăng nhập admin

POST /api/back-office/auth/logout
- Đăng xuất

POST /api/back-office/auth/register
- Đăng ký admin mới

GET /api/back-office/auth/me
- Lấy thông tin user hiện tại

POST /api/back-office/auth/change-password
- Thay đổi mật khẩu

POST /api/back-office/auth/forgot-password
- Quên mật khẩu

POST /api/back-office/auth/reset-password
- Reset mật khẩu
```

---

## 📦 **8. Đơn hàng (Orders)**
**Chức năng:** Quản lý đơn hàng

### Endpoints cần thiết:
```
GET /api/back-office/orders
- Lấy danh sách đơn hàng
- Params: page, size, search, status, storeId

GET /api/back-office/orders/{id}
- Chi tiết đơn hàng

PUT /api/back-office/orders/{id}/status
- Cập nhật trạng thái đơn hàng

POST /api/back-office/orders/{id}/cancel
- Hủy đơn hàng

GET /api/back-office/orders/{id}/history
- Lịch sử đơn hàng
```

---

## 🖼️ **9. Upload & Media**
**Chức năng:** Upload hình ảnh

### Endpoints:
```
POST /api/images/upload
- Upload single image

POST /api/images/upload-multiple
- Upload multiple images

DELETE /api/images/{id}
- Xóa image

GET /api/images/{id}
- Lấy image info
```

---

## 📊 **10. Analytics & Statistics**
**Chức năng:** Thống kê và phân tích

### Endpoints cần thiết:
```
GET /api/back-office/analytics/overview
- Tổng quan hệ thống

GET /api/back-office/analytics/revenue
- Thống kê doanh thu

GET /api/back-office/analytics/users
- Thống kê người dùng

GET /api/back-office/analytics/stores
- Thống kê cửa hàng

GET /api/back-office/analytics/products
- Thống kê sản phẩm
```

---

## 🛒 **11. Seller Management**
**Chức năng:** Quản lý seller và cửa hàng của họ

### Endpoints đã cập nhật:
```
GET /api/seller/shops
- Lấy danh sách cửa hàng của seller

GET /api/seller/shops/{id}
- Chi tiết cửa hàng

POST /api/seller/shops
- Tạo cửa hàng mới

PUT /api/seller/shops/{id}
- Cập nhật cửa hàng

DELETE /api/seller/shops/{id}
- Xóa cửa hàng

GET /api/seller/products/{id}
- Chi tiết sản phẩm

GET /api/seller/shops/{shopId}/products
- Lấy sản phẩm của cửa hàng

POST /api/seller/products
- Tạo sản phẩm mới

PUT /api/seller/products/{id}
- Cập nhật sản phẩm

DELETE /api/seller/products/{id}
- Xóa sản phẩm

GET /orders
- Lấy đơn hàng (sử dụng ordersBaseUrl riêng)

GET /orders/{id}
- Chi tiết đơn hàng

PUT /orders/{id}/status
- Cập nhật trạng thái đơn hàng
```

---

## 🔧 **Trạng thái Implementation:**

✅ **Đã hoàn thành:**
- Authentication endpoints
- User management endpoints  
- Admin management trong settings
- Image upload endpoints
- Seller management endpoints (đã thêm /api prefix)

🚧 **Cần cập nhật:**
- Store management endpoints
- Product management endpoints
- Order management endpoints
- Reports & Analytics endpoints
- Dashboard statistics endpoints

❌ **Chưa có:**
- System settings endpoints
- Notification endpoints
- Audit log endpoints
