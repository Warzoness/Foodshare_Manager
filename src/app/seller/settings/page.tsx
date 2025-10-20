'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserInfo } from '@/lib/auth';
import styles from './page.module.css';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function SellerSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getCurrentUserInfo();
        
        if (response.user) {
          setProfile(response.user as UserProfile);
          setEditForm({
            name: response.user.name || '',
            email: response.user.email || '',
          });
        } else {
          setError(response.error || 'Không thể tải thông tin người dùng');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Có lỗi xảy ra khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        name: profile.name || '',
        email: profile.email || '',
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Here you would typically call an update API
      // For now, we'll just update the local state
      if (profile) {
        const updatedProfile = {
          ...profile,
          name: editForm.name,
          email: editForm.email,
        };
        setProfile(updatedProfile);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Cài đặt tài khoản</h1>
            <p className={styles.subtitle}>Quản lý thông tin cá nhân của bạn</p>
          </div>
          <div className={styles.headerActions}>
            {!isEditing ? (
              <button 
                onClick={handleEdit}
                className={styles.editButton}
                disabled={loading}
              >
                <svg className={styles.buttonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            ) : (
              <div className={styles.editActions}>
                <button 
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSave}
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                <span className={styles.avatarText}>
                  {profile?.name?.charAt(0) || user?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div className={styles.avatarInfo}>
                <h3 className={styles.avatarName}>
                  {profile?.name || user?.name || 'Seller Account'}
                </h3>
                <p className={styles.avatarRole}>
                  {profile?.role === 'seller' ? 'Người bán hàng' : profile?.role || 'Seller'}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>Thông tin cá nhân</h4>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <div className={styles.fieldValue}>
                      {profile?.name || user?.name || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Nhập địa chỉ email"
                    />
                  ) : (
                    <div className={styles.fieldValue}>
                      {profile?.email || user?.email || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Vai trò
                  </label>
                  <div className={styles.fieldValue}>
                    <span className={styles.roleBadge}>
                      {profile?.role === 'seller' ? 'Người bán hàng' : profile?.role || 'Seller'}
                    </span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    ID tài khoản
                  </label>
                  <div className={styles.fieldValue}>
                    #{profile?.id || user?.id || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {profile?.createdAt && (
              <div className={styles.infoSection}>
                <h4 className={styles.sectionTitle}>Thông tin tài khoản</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ngày tạo:</span>
                    <span className={styles.infoValue}>
                      {profile.createdAt.toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {profile.updatedAt && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Cập nhật lần cuối:</span>
                      <span className={styles.infoValue}>
                        {profile.updatedAt.toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.securityCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Bảo mật</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.securityItem}>
              <div className={styles.securityInfo}>
                <h4 className={styles.securityTitle}>Đổi mật khẩu</h4>
                <p className={styles.securityDescription}>
                  Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                </p>
              </div>
              <button className={styles.securityButton}>
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
