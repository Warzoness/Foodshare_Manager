# Hướng dẫn cấu hình Google Maps API

## Tính năng mới: Tự động lấy vị trí từ địa chỉ và bản đồ tương tác

### Cấu hình cần thiết

Để sử dụng tính năng geocoding (chuyển đổi địa chỉ thành tọa độ) và bản đồ tương tác, bạn cần cấu hình Google Maps API:

#### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có

#### Bước 2: Bật các API cần thiết
Trong Google Cloud Console, bật các API sau:
- **Places API** - để tìm kiếm và autocomplete địa chỉ (QUAN TRỌNG)
- **Geocoding API** - để chuyển đổi địa chỉ thành tọa độ
- **Maps JavaScript API** - để hiển thị bản đồ tương tác
- **Maps Embed API** - để hiển thị bản đồ embed

#### Bước 3: Tạo API Key
1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy API key được tạo

#### Bước 4: Cấu hình trong ứng dụng
Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

#### Bước 5: Bảo mật API Key (Khuyến nghị)
1. Vào Google Cloud Console > APIs & Services > Credentials
2. Click vào API key vừa tạo
3. Cấu hình "Application restrictions" để giới hạn domain
4. Cấu hình "API restrictions" để chỉ cho phép các API cần thiết

### Tính năng hoạt động như thế nào

1. **Tự động geocoding**: Khi người dùng nhập địa chỉ, hệ thống sẽ tự động tìm kiếm và hiển thị vị trí trên bản đồ
2. **Bản đồ tương tác**: Người dùng có thể click vào bản đồ để ghim vị trí mới
3. **Nhập tọa độ thủ công**: Vẫn có thể nhập tọa độ trực tiếp nếu cần

### Lưu ý bảo mật
- Không commit file `.env.local` lên Git
- Cấu hình domain restrictions cho API key
- Giới hạn API restrictions chỉ cho các API cần thiết
- Monitor usage để tránh vượt quota

### Troubleshooting
- Nếu không có API key, ứng dụng vẫn hoạt động nhưng chỉ hiển thị bản đồ công khai
- Kiểm tra console để xem lỗi API nếu có
- Đảm bảo các API đã được bật trong Google Cloud Console
