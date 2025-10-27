'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { adminManagementService, Admin, CreateAdminRequest } from '../../../services/adminManagementService';
import { userService, CurrentUser } from '../../../services/userService';

interface NewAdminForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export default function SettingsPage() {

  // Current user state
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  
  // General settings form
  const [generalForm, setGeneralForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Admin management state
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAdmin, setNewAdmin] = useState<NewAdminForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN'
  });

  const [showAddAdminForm, setShowAddAdminForm] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadCurrentUser();
    loadAdmins();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setUserLoading(true);
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
      setGeneralForm({
        name: user.name,
        email: user.email,
        phoneNumber: '', // API doesn't return phone, will be empty
        address: '' // API doesn't return address, will be empty
      });
    } catch (_err) {
      setError('Không thể tải thông tin người dùng.');
    } finally {
      setUserLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminManagementService.getAdmins();
      setAdmins(response.content);
    } catch (_err) {
      setError('Không thể tải danh sách admin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };


  // General form handlers
  const handleGeneralFormChange = (field: string, value: string) => {
    setGeneralForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneralFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setUserLoading(true);
      
      // Update user info via API
      await userService.updateMyProfile({
        name: generalForm.name,
        email: generalForm.email,
        phoneNumber: generalForm.phoneNumber,
        profilePictureUrl: '' // Empty for now
      });
      
      // Reload current user info
      await loadCurrentUser();
      alert('Cập nhật thông tin thành công!');
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thông tin';
      alert(errorMessage);
    } finally {
      setUserLoading(false);
    }
  };

  // Password form handlers
  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setUserLoading(true);
      
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      alert('Thay đổi mật khẩu thành công!');
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thay đổi mật khẩu';
      alert(errorMessage);
    } finally {
      setUserLoading(false);
    }
  };

  // Admin management functions
  const handleNewAdminChange = (field: string, value: string) => {
    setNewAdmin(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    if (admins?.some(admin => admin.email === newAdmin.email)) {
      alert('Email này đã được sử dụng');
      return;
    }

    try {
      setLoading(true);
      
      const createRequest: CreateAdminRequest = {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password,
        role: newAdmin.role
      };

      await adminManagementService.createAdmin(createRequest);
      
      // Reload admins list
      await loadAdmins();
      
      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ADMIN'
      });
      
      setShowAddAdminForm(false);
      alert('Thêm admin thành công!');
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm admin';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    // Check if it's super admin (assuming id 1 is super admin)
    const admin = admins?.find(a => a.id === adminId);
    if (admin?.role === 'SUPER_ADMIN') {
      alert('Không thể xóa Super Admin');
      return;
    }
    
    if (confirm('Bạn có chắc chắn muốn xóa admin này?')) {
      try {
        setLoading(true);
        await adminManagementService.deleteAdmin(adminId);
        await loadAdmins(); // Reload list
        alert('Xóa admin thành công!');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa admin';
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAdminStatus = async (adminId: number) => {
    const admin = admins?.find(a => a.id === adminId);
    if (!admin) return;
    
    if (admin.role === 'SUPER_ADMIN') {
      alert('Không thể thay đổi trạng thái Super Admin');
      return;
    }
    
    try {
      setLoading(true);
      await adminManagementService.toggleAdminStatus(adminId, admin.status);
      await loadAdmins(); // Reload list
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi thay đổi trạng thái admin';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const handleSave = () => {
  //   // Tạm thời chỉ log ra console
  //   ('Saving settings:', settings);
  //   alert('Cài đặt đã được lưu! (Dữ liệu cứng)');
  // };
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cài đặt hệ thống</h1>
        <p className={styles.subtitle}>
          Quản lý cài đặt và cấu hình hệ thống
        </p>
      </div>

      <div className={styles.settingsGrid}>
        {/* General Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Cài đặt chung</h3>
          </div>
          <div className={styles.cardContent}>
            {userLoading ? (
              <div className={styles.loadingMessage}>Đang tải thông tin...</div>
            ) : (
              <form onSubmit={handleGeneralFormSubmit} className={styles.settingsForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên người dùng</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={generalForm.name}
                    onChange={(e) => handleGeneralFormChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={generalForm.email}
                    onChange={(e) => handleGeneralFormChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Số điện thoại</label>
                  <input
                    type="tel"
                    className={styles.input}
                    value={generalForm.phoneNumber}
                    onChange={(e) => handleGeneralFormChange('phoneNumber', e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Địa chỉ</label>
                  <textarea
                    className={styles.textarea}
                    value={generalForm.address}
                    onChange={(e) => handleGeneralFormChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ"
                    rows={3}
                  />
                </div>

                {currentUser && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Vai trò</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={currentUser.role}
                      disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>
                )}

                <div className={styles.buttonGroup}>
                  <Button 
                    type="button" 
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      if (currentUser) {
                        setGeneralForm({
                          name: currentUser.name,
                          email: currentUser.email,
                          phoneNumber: '',
                          address: ''
                        });
                      }
                    }}
                    disabled={userLoading}
                  >
                    ❌ Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    size="md"
                    disabled={userLoading}
                    loading={userLoading}
                  >
                    💾 Lưu thay đổi
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* System Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Cài đặt hệ thống</h3>
          </div>
          <div className={styles.cardContent}>
            <form className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Thời gian timeout (phút)</label>
                <input
                  type="number"
                  className={styles.input}
                  defaultValue="30"
                  min="5"
                  max="120"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Số lượng bản ghi mỗi trang</label>
                <select className={styles.select} defaultValue="25">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ngôn ngữ mặc định</label>
                <select className={styles.select} defaultValue="vi">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Múi giờ</label>
                <select className={styles.select} defaultValue="Asia/Ho_Chi_Minh">
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className={styles.buttonGroup}>
                <Button type="button" variant="secondary" size="md">
                  ❌ Hủy
                </Button>
                <Button type="submit" variant="primary" size="md">
                  💾 Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Notification Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Cài đặt thông báo</h3>
          </div>
          <div className={styles.cardContent}>
            <form className={styles.settingsForm}>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} defaultChecked />
                  <span className={styles.checkboxText}>Thông báo đơn hàng mới</span>
                </label>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} defaultChecked />
                  <span className={styles.checkboxText}>Thông báo cửa hàng mới đăng ký</span>
                </label>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxText}>Thông báo báo cáo hàng ngày</span>
                </label>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} defaultChecked />
                  <span className={styles.checkboxText}>Thông báo lỗi hệ thống</span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email thông báo</label>
                <input
                  type="email"
                  className={styles.input}
                  defaultValue="admin@foodshare.com"
                />
              </div>

              <div className={styles.buttonGroup}>
                <Button type="button" variant="secondary" size="md">
                  ❌ Hủy
                </Button>
                <Button type="submit" variant="primary" size="md">
                  💾 Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Bảo mật</h3>
          </div>
          <div className={styles.cardContent}>
            <form onSubmit={handlePasswordFormSubmit} className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mật khẩu mới</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Xác thực 2 yếu tố</label>
                <div className={styles.toggleGroup}>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" className={styles.toggle} disabled />
                    <span className={styles.toggleSlider}></span>
                    <span className={styles.toggleText}>Bật xác thực 2 yếu tố (Sắp có)</span>
                  </label>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Button 
                  type="button" 
                  variant="secondary"
                  size="md"
                  onClick={() => setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  })}
                  disabled={userLoading}
                >
                  ❌ Hủy
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  size="md"
                  disabled={userLoading}
                  loading={userLoading}
                >
                  🔒 Cập nhật bảo mật
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Admin Management */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Quản lý Admin</h3>
            <Button 
              type="button" 
              variant={showAddAdminForm ? "secondary" : "primary"}
              size="md"
              onClick={() => setShowAddAdminForm(!showAddAdminForm)}
            >
              {showAddAdminForm ? '❌ Hủy' : '➕ Thêm Admin'}
            </Button>
          </div>
          <div className={styles.cardContent}>
            {/* Add Admin Form */}
            {showAddAdminForm && (
              <form onSubmit={handleAddAdmin} className={styles.settingsForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ và tên</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Nhập họ và tên"
                    value={newAdmin.name}
                    onChange={(e) => handleNewAdminChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Nhập email"
                    value={newAdmin.email}
                    onChange={(e) => handleNewAdminChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Vai trò</label>
                  <select 
                    className={styles.select}
                    value={newAdmin.role}
                    onChange={(e) => handleNewAdminChange('role', e.target.value)}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MODERATOR">Moderator</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Mật khẩu</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Nhập mật khẩu"
                    value={newAdmin.password}
                    onChange={(e) => handleNewAdminChange('password', e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    value={newAdmin.confirmPassword}
                    onChange={(e) => handleNewAdminChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <Button 
                    type="button" 
                    variant="secondary"
                    size="md"
                    onClick={() => setShowAddAdminForm(false)}
                  >
                    ❌ Hủy
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    ➕ Thêm Admin
                  </Button>
                </div>
              </form>
            )}

            {/* Admin List */}
            {!showAddAdminForm && (
              <div className={styles.adminList}>
                <div className={styles.adminHeader}>
                  <h4 className={styles.adminListTitle}>Danh sách Admin ({admins?.length || 0})</h4>
                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={loadAdmins}
                        disabled={loading}
                        loading={loading}
                      >
                        🔄 Thử lại
                      </Button>
                    </div>
                  )}
                </div>
                
                {loading ? (
                  <div className={styles.loadingMessage}>Đang tải...</div>
                ) : (
                  <div className={styles.adminTable}>
                    {!admins || admins.length === 0 ? (
                      <div className={styles.emptyMessage}>
                        Chưa có admin nào. Hãy thêm admin đầu tiên!
                      </div>
                    ) : (
                      admins.map((admin) => (
                        <div key={admin.id} className={styles.adminRow}>
                          <div className={styles.adminInfo}>
                            <div className={styles.adminName}>{admin.name}</div>
                            <div className={styles.adminEmail}>{admin.email}</div>
                            <div className={styles.adminMeta}>
                              <span className={styles.adminRole}>{admin.role}</span>
                              <span className={styles.adminDate}>Tạo: {new Date(admin.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                          
                          <div className={styles.adminActions}>
                            <button
                              className={`${styles.statusButton} ${admin.status === 'ACTIVE' ? styles.active : styles.inactive}`}
                              onClick={() => toggleAdminStatus(admin.id)}
                              disabled={admin.role === 'SUPER_ADMIN' || loading}
                            >
                              {admin.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                            </button>
                            
                            {admin.role !== 'SUPER_ADMIN' && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteAdmin(admin.id)}
                                disabled={loading}
                                loading={loading}
                              >
                                🗑️ Xóa
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
