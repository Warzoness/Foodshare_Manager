'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { useUsers } from '@/hooks/useApi';
import { User } from '@/types';
import styles from './page.module.css';

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  // Memoize params to avoid recreating object on every render
  const usersParams = useMemo(() => ({
    page: currentPage,
    size: pageSize,
    search: searchTerm,
    role: roleFilter,
    status: statusFilter
  }), [currentPage, pageSize, searchTerm, roleFilter, statusFilter]);

  // Use the users hook
  const { 
    data: usersResponse, 
    loading, 
    error,
    execute: refetchUsers 
  } = useUsers(usersParams);

  const users = Array.isArray(usersResponse) ? usersResponse : usersResponse?.data || [];
  const totalItems = Array.isArray(usersResponse) ? usersResponse.length : usersResponse?.pagination?.total || 0;
  const totalPages = Array.isArray(usersResponse) ? 1 : usersResponse?.pagination?.totalPages || 0;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'SELLER': return 'Người bán';
      default: return 'Không xác định';
    }
  };


  return (
    <div className={styles.usersContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Quản lý người dùng</h1>
          <p className={styles.subtitle}>
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <Button variant="primary" size="lg">+ Thêm người dùng mới</Button>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersContainer}>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="seller">Người bán</option>
          </select>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="pending">Chờ duyệt</option>
            <option value="inactive">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeader}>
                  Người dùng
                </th>
                <th className={styles.tableHeader}>
                  Vai trò
                </th>
                <th className={styles.tableHeader}>
                  Cửa hàng
                </th>
                <th className={styles.tableHeader}>
                  Trạng thái
                </th>
                <th className={styles.tableHeader}>
                  Lần đăng nhập cuối
                </th>
                <th className={styles.tableHeader}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <div className={styles.loadingMessage}>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <div className={styles.errorMessage}>
                      <p>Lỗi khi tải dữ liệu: {error}</p>
                      <Button variant="outline" size="md" onClick={() => refetchUsers()}>
                        🔄 Thử lại
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <div className={styles.emptyMessage}>
                      <p>Chưa có người dùng</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user: User) => (
                  <tr key={user.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase()]}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.storeName}>
                        {user.role === 'ADMIN' ? 'N/A' : 'Chưa có cửa hàng'}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.statusBadge} ${styles.active}`}>
                        Hoạt động
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.lastLogin}>
                        {new Date(user.updatedAt).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <Button variant="secondary" size="sm">👁️ Xem</Button>
                        <Button variant="secondary" size="sm">✏️ Sửa</Button>
                        <Button variant="danger" size="sm">🔒 Khóa</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> đến{' '}
            <span className="font-medium">
              {Math.min((currentPage + 1) * pageSize, totalItems)}
            </span>{' '}
            của <span className="font-medium">{totalItems}</span> kết quả
          </div>
          <div className={styles.paginationButtons}>
            <Button 
              variant="outline"
              size="md"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              ← Trước
            </Button>
            <span className={styles.pageInfo}>
              Trang {currentPage + 1} / {totalPages}
            </span>
            <Button 
              variant="outline"
              size="md"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Sau →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}