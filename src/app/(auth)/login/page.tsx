'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/auth';
import { hasRole } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, login: setUser, loading: authLoading } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.user) {
        // Update auth context
        setUser(result.user);
        
        // Redirect based on user role
        if (hasRole(result.user, 'admin')) {
          router.push('/admin/dashboard');
        } else if (hasRole(result.user, 'seller')) {
          router.push('/seller/dashboard');
        } else {
          setError('Vai trò người dùng không hợp lệ');
        }
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            FoodShare Manager
          </h2>
          <p className={styles.subtitle}>
            Sign in to your account
          </p>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading && <div className={styles.loadingSpinner}></div>}
            Sign in
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.registerText}>
            Chưa có tài khoản?{' '}
            <Link href="/register" className={styles.registerLink}>
              Đăng ký tài khoản Seller
            </Link>
          </p>
        </div>

        <div className={styles.demoAccounts}>
          <p className={styles.demoTitle}>Đăng nhập với tài khoản của bạn:</p>
          <p className={styles.demoItem}>Sử dụng email và mật khẩu đã được cấp</p>
          <p className={styles.demoItem}>Hệ thống sẽ tự động phân quyền dựa trên vai trò</p>
        </div>
      </div>
    </div>
  );
}
