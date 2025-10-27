# Button Component Style Guide

## Overview

The `Button` component is the centralized, reusable button component used throughout the entire FoodShare application. It provides consistent styling, behavior, and accessibility features.

## Import

```tsx
import { Button } from '@/components/ui/Button';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'success' \| 'warning' \| 'outline' \| 'ghost'` | `'primary'` | Visual style variant |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner and disables button |
| `disabled` | `boolean` | `false` | Disables button interaction |
| `fullWidth` | `boolean` | `false` | Makes button span full width of container |
| `onClick` | `() => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Button content |

## Variant Usage Guide

### 1. **Primary** (`variant="primary"`)
**Use for:** Main actions, primary CTAs, confirm actions
```tsx
<Button variant="primary" size="lg">Tạo cửa hàng</Button>
<Button variant="primary" size="md">💾 Lưu thay đổi</Button>
<Button variant="primary" size="sm">✏️ Sửa</Button>
```

**Examples in app:**
- Create buttons (Tạo, Thêm mới)
- Save buttons (Lưu, Lưu thay đổi)
- Submit buttons in forms
- Primary navigation actions

---

### 2. **Secondary** (`variant="secondary"`)
**Use for:** Supporting actions, alternative options, view actions
```tsx
<Button variant="secondary" size="md">❌ Hủy</Button>
<Button variant="secondary" size="sm">👁️ Xem</Button>
<Button variant="secondary" size="md">📊 Excel</Button>
```

**Examples in app:**
- Cancel buttons
- View/Details buttons
- Export buttons (Excel, PDF)
- Back buttons

---

### 3. **Danger** (`variant="danger"`)
**Use for:** Destructive actions, delete operations, logout
```tsx
<Button variant="danger" size="sm">🗑️ Xóa</Button>
<Button variant="danger" size="sm">🚪 Đăng xuất</Button>
<Button variant="danger" size="sm">❌ Hủy đơn</Button>
```

**Examples in app:**
- Delete buttons
- Remove buttons
- Logout buttons
- Cancel order buttons

---

### 4. **Success** (`variant="success"`)
**Use for:** Positive actions, approve operations, confirm success
```tsx
<Button variant="success" size="sm">✅ Xác nhận</Button>
<Button variant="success" size="sm">✅ Duyệt</Button>
<Button variant="success" size="sm">🎉 Hoàn thành</Button>
```

**Examples in app:**
- Confirm order buttons
- Approve buttons
- Complete buttons
- Accept actions

---

### 5. **Warning** (`variant="warning"`)
**Use for:** Caution actions, pending states, alerts
```tsx
<Button variant="warning" size="sm">⚠️ Tạm dừng</Button>
<Button variant="warning" size="sm">⏸️ Pause</Button>
```

**Examples in app:**
- Suspend actions
- Pause operations
- Warning confirmations

---

### 6. **Outline** (`variant="outline"`)
**Use for:** Minimal actions, filters, pagination, retry operations
```tsx
<Button variant="outline" size="md">🔍 Lọc</Button>
<Button variant="outline" size="md">← Trước</Button>
<Button variant="outline" size="md">Sau →</Button>
<Button variant="outline" size="md">🔄 Thử lại</Button>
```

**Examples in app:**
- Filter buttons
- Pagination buttons (Previous/Next)
- Retry buttons
- Clear filter buttons

---

### 7. **Ghost** (`variant="ghost"`)
**Use for:** Icon buttons, close buttons, minimal interactions
```tsx
<Button variant="ghost" size="xs">×</Button>
<Button variant="ghost" size="sm">🗑️ Xóa bộ lọc</Button>
```

**Examples in app:**
- Modal close buttons (×)
- Dismiss buttons
- Minimal text buttons

---

## Size Usage Guide

| Size | Use Case | Examples |
|------|----------|----------|
| `xs` | Icon buttons, close buttons | Close (×), Small dismissals |
| `sm` | Table row actions, inline actions | Edit, Delete, View in tables |
| `md` | Standard form actions, filters | Save, Cancel, Filter (default) |
| `lg` | Page headers, important CTAs | Create New, Add Item |
| `xl` | Hero sections, landing pages | Get Started, Sign Up |

## Loading State

Use the `loading` prop for async operations. The button will:
- Show a spinner
- Disable interaction automatically
- Keep the button text visible

```tsx
<Button 
  variant="primary" 
  loading={isSubmitting}
  onClick={handleSubmit}
>
  💾 Lưu thay đổi
</Button>
```

**When loading is true:**
- Button shows "⏳" spinner icon
- Button is automatically disabled
- Text remains visible (no need for `{loading ? 'Loading...' : 'Text'}`)

## Full Width

Use `fullWidth` prop for buttons that should span the entire container width:

```tsx
<Button variant="primary" size="lg" fullWidth>
  🔐 Đăng nhập
</Button>
```

**Use cases:**
- Form submit buttons
- Mobile responsive actions
- Auth pages (Login, Register)

## Best Practices

### ✅ DO:

1. **Use icons for better UX:**
```tsx
<Button variant="success">✅ Xác nhận</Button>
<Button variant="danger">🗑️ Xóa</Button>
<Button variant="primary">💾 Lưu</Button>
```

2. **Use appropriate variants:**
```tsx
// ✅ Good
<Button variant="danger">Xóa</Button>
<Button variant="success">Xác nhận</Button>

// ❌ Bad
<Button variant="primary">Xóa</Button>
<Button variant="danger">Lưu</Button>
```

3. **Use loading state for async operations:**
```tsx
<Button 
  variant="primary" 
  loading={isLoading}
  disabled={isLoading}
>
  Lưu
</Button>
```

4. **Use consistent sizes in similar contexts:**
```tsx
// Table actions - all use 'sm'
<Button variant="secondary" size="sm">Xem</Button>
<Button variant="secondary" size="sm">Sửa</Button>
<Button variant="danger" size="sm">Xóa</Button>
```

### ❌ DON'T:

1. **Don't use native `<button>` tags:**
```tsx
// ❌ Bad
<button className={styles.myButton}>Click</button>

// ✅ Good
<Button variant="primary">Click</Button>
```

2. **Don't mix button sizes randomly:**
```tsx
// ❌ Bad - inconsistent sizes
<Button size="lg">Save</Button>
<Button size="xs">Cancel</Button>

// ✅ Good - consistent sizes
<Button size="md">Save</Button>
<Button size="md">Cancel</Button>
```

3. **Don't manually implement loading states:**
```tsx
// ❌ Bad
<Button disabled={loading}>
  {loading ? 'Loading...' : 'Save'}
</Button>

// ✅ Good
<Button loading={loading}>Save</Button>
```

## Migration from Native Buttons

### Before (Native HTML button):
```tsx
<button 
  className={styles.customButton}
  onClick={handleClick}
  disabled={loading}
>
  {loading ? 'Loading...' : 'Click me'}
</button>
```

### After (Button component):
```tsx
<Button 
  variant="primary"
  size="md"
  onClick={handleClick}
  loading={loading}
>
  Click me
</Button>
```

## Common Patterns

### 1. Form Actions
```tsx
<div className={styles.formActions}>
  <Button variant="secondary" size="md" onClick={onCancel}>
    ❌ Hủy
  </Button>
  <Button variant="primary" size="md" loading={saving}>
    💾 Lưu
  </Button>
</div>
```

### 2. Table Row Actions (Products)
```tsx
<div className={styles.actionButtons}>
  <Button variant="secondary" size="sm">👁️ Xem</Button>
  <Button variant="secondary" size="sm">✏️ Sửa</Button>
  <Button variant="danger" size="sm" loading={deleting}>🗑️ Xóa</Button>
</div>
```

### 3. Table Row Actions (Stores)
```tsx
<div className={styles.actionButtons}>
  <Button variant="secondary" size="sm">👁️ Xem</Button>
  <Button variant="secondary" size="sm" loading={updating}>✏️ Sửa</Button>
  <Button variant="success" size="sm">✅ Duyệt</Button>
  <Button variant="danger" size="sm" loading={deleting}>🗑️ Xóa</Button>
</div>
```

### 4. Pagination
```tsx
<div className={styles.pagination}>
  <Button variant="outline" size="md" disabled={!hasPrev}>
    ← Trước
  </Button>
  <span>Trang {page} / {totalPages}</span>
  <Button variant="outline" size="md" disabled={!hasNext}>
    Sau →
  </Button>
</div>
```

### 5. Modal Actions
```tsx
<div className={styles.modalActions}>
  <Button variant="secondary" onClick={onClose}>
    ❌ Hủy
  </Button>
  <Button variant="primary" loading={submitting}>
    ✅ Xác nhận
  </Button>
</div>
```

### 6. Order Status Actions
```tsx
// Pending order
<Button variant="success" size="sm" loading={updating}>
  ✅ Xác nhận
</Button>
<Button variant="danger" size="sm" loading={updating}>
  ❌ Hủy đơn
</Button>

// Confirmed order
<Button variant="primary" size="sm" loading={updating}>
  🎉 Hoàn thành
</Button>
```

## Accessibility

The Button component automatically handles:
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Focus states (visible outline)
- ✅ Disabled states (cursor: not-allowed)
- ✅ ARIA attributes when loading
- ✅ Proper contrast ratios for all variants

## Component Location

**File:** `src/components/ui/Button.tsx`  
**Styles:** `src/components/ui/Button.module.css`

## Related Components

- `Select` - For dropdowns
- `Input` - For text inputs
- `Card` - For containers

---

**Last Updated:** January 2025  
**Maintainer:** FoodShare Team
