'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useRegister } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole } from '@/lib/auth';
import { VietnameseValidator } from '@/lib/validation';
import styles from './page.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { execute: register, loading: registering, success: registerSuccess, error: registerError } = useRegister();

  // Redirect if already logged in (but not during registration process)
  useEffect(() => {
    if (!authLoading && user && !isRegistering) {
      if (hasRole(user, 'admin')) {
        router.push('/admin/dashboard');
      } else if (hasRole(user, 'seller')) {
        router.push('/seller/dashboard');
      }
    }
  }, [user, authLoading, router, isRegistering]);

  // Handle successful registration
  useEffect(() => {
    if (registerSuccess) {
      // After successful registration, redirect to login page
      // User needs to login to get proper authentication token
      router.push('/login?message=Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
      setIsRegistering(false);
    }
  }, [registerSuccess, router]);

  // Handle registration error
  useEffect(() => {
    if (registerError) {
      setError(registerError);
      setIsRegistering(false);
    }
  }, [registerError]);

  // Validation functions
  const validateName = (value: string) => {
    const result = VietnameseValidator.validateName(value);
    setNameError(result.message);
    return result.isValid;
  };

  const validateEmail = (value: string) => {
    const result = VietnameseValidator.validateEmail(value);
    setEmailError(result.message);
    return result.isValid;
  };

  const validatePassword = (value: string) => {
    const result = VietnameseValidator.validatePassword(value);
    setPasswordError(result.message);
    return result.isValid;
  };

  const validateConfirmPassword = (value: string) => {
    const result = VietnameseValidator.validateConfirmPassword(password, value);
    setConfirmPasswordError(result.message);
    return result.isValid;
  };

  const isFormValid = () => {
    return validateName(name) && 
           validateEmail(email) && 
           validatePassword(password) && 
           validateConfirmPassword(confirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsRegistering(true);

    // Validate all fields
    if (!isFormValid()) {
      setError('Vui lòng kiểm tra lại thông tin đã nhập');
      setLoading(false);
      setIsRegistering(false);
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      setIsRegistering(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Đăng ký tài khoản Seller</h1>
          <p className={styles.subtitle}>
            Tạo tài khoản để bắt đầu bán hàng trên FoodShare
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Họ và tên <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) validateName(e.target.value);
              }}
              onBlur={() => validateName(name)}
              className={`${styles.input} ${nameError ? styles.inputError : ''}`}
              placeholder="Nhập họ và tên"
              required
            />
            {nameError && <div className={styles.errorMessage}>{nameError}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              className={`${styles.input} ${emailError ? styles.inputError : ''}`}
              placeholder="Nhập email"
              required
            />
            {emailError && <div className={styles.errorMessage}>{emailError}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Mật khẩu <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
                // Re-validate confirm password when password changes
                if (confirmPassword) validateConfirmPassword(confirmPassword);
              }}
              onBlur={() => validatePassword(password)}
              className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
              placeholder="Nhập mật khẩu"
              required
              minLength={6}
            />
            {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
            <div className={styles.passwordRules}>
              <p>Quy tắc mật khẩu:</p>
              <ul>
                <li>Ít nhất 6 ký tự</li>
                <li>Ít nhất 1 chữ hoa (A-Z)</li>
                <li>Ít nhất 1 chữ thường (a-z)</li>
                <li>Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)</li>
              </ul>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Xác nhận mật khẩu <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) validateConfirmPassword(e.target.value);
              }}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              className={`${styles.input} ${confirmPasswordError ? styles.inputError : ''}`}
              placeholder="Nhập lại mật khẩu"
              required
            />
            {confirmPasswordError && <div className={styles.errorMessage}>{confirmPasswordError}</div>}
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading || registering}
            loading={loading || registering}
            className={styles.submitButton}
          >
            ✨ Đăng ký
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.loginText}>
            Đã có tài khoản?{' '}
            <Link href="/login" className={styles.loginLink}>
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
