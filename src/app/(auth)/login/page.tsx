'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { login } from '@/lib/auth';
import { hasRole } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login: setUser, loading: authLoading } = useAuth();

  // Check for success message from URL params
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

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
            Đăng nhập vào tài khoản của bạn
          </p>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Địa chỉ Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
              autoComplete="email"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Mật khẩu</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu của bạn"
              autoComplete="current-password"
            />
          </div>

          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            loading={loading}
            className={styles.submitButton}
          >
            🔐 Đăng nhập
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.registerText}>
            Chưa có tài khoản?{' '}
            <Link href="/register" className={styles.registerLink}>
              Đăng ký tài khoản Seller
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
