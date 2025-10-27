# Select Component

React Select/Dropdown component tùy chỉnh với style đẹp và đồng bộ với theme.

## Features

- ✅ Dark theme với màu xanh lá (#54A65C)
- 🔍 Tìm kiếm nhanh (auto-enable khi > 5 options)
- ⌨️ Keyboard navigation
- 📱 Mobile responsive
- ♿ Accessibility support
- 🎨 Multiple size variants (sm, md, lg)
- ✨ Smooth animations
- 🚫 Disabled options support

## Cách sử dụng cơ bản

```tsx
import { Select } from '@/components/ui/Select';

function MyComponent() {
  const [value, setValue] = useState('1');

  return (
    <Select
      value={value}
      onChange={(newValue) => setValue(newValue)}
      options={[
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
        { value: '3', label: 'Option 3' }
      ]}
      placeholder="Chọn một tùy chọn"
    />
  );
}
```

## Props

### Required Props

- `options`: `SelectOption[]` - Danh sách các options
  ```ts
  interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }
  ```
- `value`: `string` - Giá trị hiện tại được chọn
- `onChange`: `(value: string) => void` - Callback khi value thay đổi

### Optional Props

- `placeholder`: `string` - Text hiển thị khi chưa chọn (default: "Chọn...")
- `label`: `string` - Label hiển thị phía trên select
- `disabled`: `boolean` - Disable toàn bộ select (default: false)
- `className`: `string` - Custom CSS class
- `error`: `string` - Error message hiển thị dưới select
- `size`: `'sm' | 'md' | 'lg'` - Kích thước (default: 'md')

## Ví dụ nâng cao

### With Label

```tsx
<Select
  label="Trạng thái cửa hàng *"
  value={status}
  onChange={setStatus}
  options={[
    { value: '1', label: 'Đang hoạt động' },
    { value: '0', label: 'Đóng cửa' },
    { value: '2', label: 'Chờ duyệt' }
  ]}
/>
```

### With Error

```tsx
<Select
  label="Danh mục"
  value={category}
  onChange={setCategory}
  options={categories}
  error="Vui lòng chọn danh mục"
/>
```

### With Disabled Options

```tsx
<Select
  value={value}
  onChange={setValue}
  options={[
    { value: '1', label: 'Available Option' },
    { value: '2', label: 'Disabled Option', disabled: true },
    { value: '3', label: 'Another Option' }
  ]}
/>
```

### Size Variants

```tsx
// Small
<Select size="sm" {...props} />

// Medium (default)
<Select size="md" {...props} />

// Large
<Select size="lg" {...props} />
```

### Disabled State

```tsx
<Select
  disabled={true}
  value={value}
  onChange={setValue}
  options={options}
/>
```

## Tính năng tìm kiếm

Tìm kiếm tự động kích hoạt khi có **hơn 5 options**. Người dùng có thể:
- Gõ để tìm kiếm options
- Kết quả được lọc theo label
- Không phân biệt chữ hoa/thường

## Keyboard Navigation

- `Enter` / `Space`: Mở/đóng dropdown
- `Escape`: Đóng dropdown
- `Tab`: Navigate ra ngoài component

## Style Customization

Component sử dụng CSS Modules. Bạn có thể override styles bằng cách:

```tsx
<Select
  className="myCustomSelect"
  {...props}
/>
```

Và trong CSS:

```css
.myCustomSelect {
  /* Your custom styles */
}
```

## Examples trong Project

### Seller Store Page
```tsx
// src/app/seller/store/page.tsx
<Select
  label="Trạng thái cửa hàng *"
  value={formData.status || '1'}
  onChange={(value) => onInputChange('status', value)}
  options={[
    { value: '1', label: 'Đang hoạt động' },
    { value: '0', label: 'Đóng cửa' },
    { value: '2', label: 'Chờ duyệt' }
  ]}
/>
```

### Admin Stores Filter
```tsx
// src/app/admin/stores/page.tsx
<Select
  value={statusFilter}
  onChange={handleStatusFilter}
  placeholder="Tất cả trạng thái"
  options={[
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'inactive', label: 'Tạm dừng' }
  ]}
/>
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Accessibility

- ARIA labels và roles
- Keyboard navigation
- Focus management
- Screen reader friendly

## Performance

- Optimized re-renders
- Efficient filtering
- Smooth animations
- Lazy rendering for large lists

