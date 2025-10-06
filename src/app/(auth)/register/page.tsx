'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole } from '@/lib/auth';
import styles from './page.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, login: setUser, loading: authLoading } = useAuth();
  const { execute: register, loading: registering, success: registerSuccess, data: registerData, error: registerError } = useRegister();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (hasRole(user, 'admin')) {
        router.push('/admin/dashboard');
      } else if (hasRole(user, 'seller')) {
        router.push('/seller/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // Handle successful registration
  useEffect(() => {
    if (registerSuccess) {
      // Get the user data from the register response
      const userData = registerData as { id: number; name: string; email: string; role: string };
      if (userData) {
        const fullUserData = {
          ...userData,
          id: userData.id.toString(),
          role: userData.role as 'ADMIN' | 'SELLER',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setUser(fullUserData);
        router.push('/seller/dashboard');
      }
    }
  }, [registerSuccess, registerData, setUser, router]);

  // Handle registration error
  useEffect(() => {
    if (registerError) {
      setError(registerError);
    }
  }, [registerError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Vui lòng nhập tên');
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    // Validate password complexity - must have at least 1 uppercase and 1 lowercase
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    
    if (!hasUppercase || !hasLowercase) {
      setError('Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ thường');
      setLoading(false);
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
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
              Họ và tên
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Nhập mật khẩu"
              required
              minLength={6}
            />
            <div className={styles.passwordRules}>
              <p>Quy tắc mật khẩu:</p>
              <ul>
                <li>Ít nhất 6 ký tự</li>
                <li>Ít nhất 1 chữ hoa (A-Z)</li>
                <li>Ít nhất 1 chữ thường (a-z)</li>
              </ul>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || registering}
          >
            {loading || registering ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
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
