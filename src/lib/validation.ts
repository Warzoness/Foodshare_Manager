// Vietnamese validation utilities
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
}

export class VietnameseValidator {
  // Email validation
  static validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return { isValid: false, message: 'Email không được để trống' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Email không hợp lệ' };
    }

    return { isValid: true, message: '' };
  }

  // Password validation
  static validatePassword(password: string): ValidationResult {
    if (!password.trim()) {
      return { isValid: false, message: 'Mật khẩu không được để trống' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }

    if (password.length > 50) {
      return { isValid: false, message: 'Mật khẩu không được vượt quá 50 ký tự' };
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    
    if (!hasUppercase || !hasLowercase) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ thường' };
    }

    return { isValid: true, message: '' };
  }

  // Name validation (Vietnamese names)
  static validateName(name: string): ValidationResult {
    if (!name.trim()) {
      return { isValid: false, message: 'Tên không được để trống' };
    }

    if (name.trim().length < 2) {
      return { isValid: false, message: 'Tên phải có ít nhất 2 ký tự' };
    }

    if (name.trim().length > 100) {
      return { isValid: false, message: 'Tên không được vượt quá 100 ký tự' };
    }

    // Allow Vietnamese characters, spaces, and common name characters
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return { isValid: false, message: 'Tên chỉ được chứa chữ cái và khoảng trắng' };
    }

    return { isValid: true, message: '' };
  }

  // Phone number validation (Vietnamese format)
  static validatePhoneNumber(phone: string): ValidationResult {
    if (!phone.trim()) {
      return { isValid: false, message: 'Số điện thoại không được để trống' };
    }

    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Vietnamese phone number patterns
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, message: 'Số điện thoại không hợp lệ (VD: 0123456789)' };
    }

    return { isValid: true, message: '' };
  }

  // Price validation
  static validatePrice(price: string): ValidationResult {
    if (!price.trim()) {
      return { isValid: false, message: 'Giá không được để trống' };
    }

    const numValue = parseFloat(price);
    if (isNaN(numValue)) {
      return { isValid: false, message: 'Giá phải là số hợp lệ' };
    }

    if (numValue < 0) {
      return { isValid: false, message: 'Giá không được âm' };
    }

    if (numValue > 1000000000) {
      return { isValid: false, message: 'Giá không được vượt quá 1 tỷ VNĐ' };
    }

    return { isValid: true, message: '' };
  }

  // Quantity validation
  static validateQuantity(quantity: string): ValidationResult {
    if (!quantity.trim()) {
      return { isValid: false, message: 'Số lượng không được để trống' };
    }

    const numValue = parseInt(quantity);
    if (isNaN(numValue)) {
      return { isValid: false, message: 'Số lượng phải là số nguyên hợp lệ' };
    }

    if (numValue < 0) {
      return { isValid: false, message: 'Số lượng không được âm' };
    }

    if (numValue > 10000) {
      return { isValid: false, message: 'Số lượng không được vượt quá 10,000' };
    }

    return { isValid: true, message: '' };
  }

  // Store name validation
  static validateStoreName(name: string): ValidationResult {
    if (!name.trim()) {
      return { isValid: false, message: 'Tên cửa hàng không được để trống' };
    }

    if (name.trim().length < 3) {
      return { isValid: false, message: 'Tên cửa hàng phải có ít nhất 3 ký tự' };
    }

    if (name.trim().length > 200) {
      return { isValid: false, message: 'Tên cửa hàng không được vượt quá 200 ký tự' };
    }

    return { isValid: true, message: '' };
  }

  // Address validation
  static validateAddress(address: string): ValidationResult {
    if (!address.trim()) {
      return { isValid: false, message: 'Địa chỉ không được để trống' };
    }

    if (address.trim().length < 10) {
      return { isValid: false, message: 'Địa chỉ phải có ít nhất 10 ký tự' };
    }

    if (address.trim().length > 500) {
      return { isValid: false, message: 'Địa chỉ không được vượt quá 500 ký tự' };
    }

    return { isValid: true, message: '' };
  }

  // Description validation
  static validateDescription(description: string): ValidationResult {
    if (!description.trim()) {
      return { isValid: false, message: 'Mô tả không được để trống' };
    }

    if (description.trim().length < 10) {
      return { isValid: false, message: 'Mô tả phải có ít nhất 10 ký tự' };
    }

    if (description.trim().length > 1000) {
      return { isValid: false, message: 'Mô tả không được vượt quá 1000 ký tự' };
    }

    return { isValid: true, message: '' };
  }

  // Generic validation function
  static validate(value: string, rules: ValidationRule): ValidationResult {
    // Required check
    if (rules.required && !value.trim()) {
      return { isValid: false, message: 'Trường này là bắt buộc' };
    }

    // Skip other validations if value is empty and not required
    if (!value.trim() && !rules.required) {
      return { isValid: true, message: '' };
    }

    // Min length check
    if (rules.minLength && value.trim().length < rules.minLength) {
      return { isValid: false, message: `Phải có ít nhất ${rules.minLength} ký tự` };
    }

    // Max length check
    if (rules.maxLength && value.trim().length > rules.maxLength) {
      return { isValid: false, message: `Không được vượt quá ${rules.maxLength} ký tự` };
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(value)) {
      return { isValid: false, message: 'Định dạng không hợp lệ' };
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return { isValid: true, message: '' };
  }

  // Confirm password validation
  static validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
    if (!confirmPassword.trim()) {
      return { isValid: false, message: 'Xác nhận mật khẩu không được để trống' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, message: 'Mật khẩu xác nhận không khớp' };
    }

    return { isValid: true, message: '' };
  }

  // Date validation
  static validateDate(date: string): ValidationResult {
    if (!date.trim()) {
      return { isValid: false, message: 'Ngày không được để trống' };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, message: 'Ngày không hợp lệ' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
      return { isValid: false, message: 'Ngày không được là ngày trong quá khứ' };
    }

    return { isValid: true, message: '' };
  }

  // URL validation
  static validateUrl(url: string): ValidationResult {
    if (!url.trim()) {
      return { isValid: false, message: 'URL không được để trống' };
    }

    try {
      new URL(url);
      return { isValid: true, message: '' };
    } catch {
      return { isValid: false, message: 'URL không hợp lệ' };
    }
  }
}

// Form validation helper
export class FormValidator {
  private errors: Record<string, string> = {};

  validate(fieldName: string, value: string, validator: (value: string) => ValidationResult): this {
    const result = validator(value);
    if (!result.isValid) {
      this.errors[fieldName] = result.message;
    } else {
      delete this.errors[fieldName];
    }
    return this;
  }

  getErrors(): Record<string, string> {
    return { ...this.errors };
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  getError(fieldName: string): string {
    return this.errors[fieldName] || '';
  }

  clear(): this {
    this.errors = {};
    return this;
  }

  isValid(): boolean {
    return !this.hasErrors();
  }
}
