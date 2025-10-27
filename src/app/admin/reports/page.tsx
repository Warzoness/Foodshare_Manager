'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import styles from './page.module.css';
import { useReports } from '@/hooks/useApi';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('revenue');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Memoize params to avoid recreating object on every render
  const reportsParams = useMemo(() => ({
    type: reportType,
    startDate,
    endDate
  }), [reportType, startDate, endDate]);

  // Fetch reports data
  const { loading, error } = useReports(reportsParams);
  return (
    <div className={styles.reportsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Báo cáo & Thống kê</h1>
        <p className={styles.subtitle}>
          Xem các báo cáo chi tiết về hoạt động của hệ thống
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Lỗi tải dữ liệu: {error}</p>
        </div>
      )}

      {/* Report Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Loại báo cáo
            </label>
            <select 
              className={styles.filterSelect}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="revenue">Doanh thu</option>
              <option value="orders">Đơn hàng</option>
              <option value="stores">Cửa hàng</option>
              <option value="users">Người dùng</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <DatePicker
              label="Từ ngày"
              value={startDate}
              onChange={(value) => setStartDate(value)}
              placeholder="Chọn ngày bắt đầu"
            />
          </div>
          <div className={styles.filterGroup}>
            <DatePicker
              label="Đến ngày"
              value={endDate}
              onChange={(value) => setEndDate(value)}
              placeholder="Chọn ngày kết thúc"
            />
          </div>
          <div className={styles.filterGroup}>
            <Button variant="primary" size="md">📊 Tạo báo cáo</Button>
          </div>
        </div>
      </div>

      {/* Revenue Report */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Doanh thu theo tháng</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.chartPlaceholder}>
              <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>So sánh doanh thu</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.comparisonList}>
              <div className={styles.comparisonItem}>
                <span className={styles.comparisonLabel}>Tháng này</span>
                <span className={styles.comparisonValue}>125,500,000đ</span>
              </div>
              <div className={styles.comparisonItem}>
                <span className={styles.comparisonLabel}>Tháng trước</span>
                <span className={styles.comparisonValue}>118,200,000đ</span>
              </div>
              <div className={styles.comparisonItem}>
                <span className={styles.comparisonLabel}>Tăng trưởng</span>
                <span className={`${styles.comparisonValue} ${styles.positive}`}>+6.2%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Performance */}
      <div className={styles.performanceCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Hiệu suất cửa hàng</h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>
                    Cửa hàng
                  </th>
                  <th className={styles.tableHeader}>
                    Doanh thu
                  </th>
                  <th className={styles.tableHeader}>
                    Đơn hàng
                  </th>
                  <th className={styles.tableHeader}>
                    Đánh giá TB
                  </th>
                  <th className={styles.tableHeader}>
                    Tăng trưởng
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {/* Data sẽ được tải từ API */}
                <tr className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.storeName}>Đang tải dữ liệu...</div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.revenueAmount}>-</div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.orderCount}>-</div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.ratingContainer}>
                      <div className={styles.stars}>-</div>
                      {/* <span className={styles.ratingText}>-</span> */}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.growthValue}>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className={styles.exportCard}>
        <div className={styles.exportContent}>
          <div className={styles.exportInfo}>
            <h3 className={styles.exportTitle}>Xuất báo cáo</h3>
            <p className={styles.exportDescription}>Tải báo cáo dưới định dạng Excel hoặc PDF</p>
          </div>
          <div className={styles.exportButtons}>
            <Button variant="secondary" size="md">📊 Excel</Button>
            <Button variant="secondary" size="md">📄 PDF</Button>
            <Button variant="primary" size="md">📧 Gửi email</Button>
          </div>
        </div>
      </div>
    </div>
  );
}