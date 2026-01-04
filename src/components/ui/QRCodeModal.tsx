'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './Button';
import styles from './QRCodeModal.module.css';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopId: number;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  shopName,
  shopAddress,
  shopPhone,
  shopId,
}: QRCodeModalProps) {
  const qrWrapperRef = useRef<HTMLDivElement>(null);

  // Tạo URL cho QR code
  const qrUrl = `https://www.miniapp-foodshare.com/stores/${shopId}`;

  // Hàm xuất ảnh QR code sử dụng Canvas API
  const handleDownloadQR = async () => {
    try {
      // Tìm SVG element trong wrapper
      const svgElement = qrWrapperRef.current?.querySelector('svg') as SVGSVGElement;
      if (!svgElement) {
        alert('Không tìm thấy QR code. Vui lòng thử lại.');
        return;
      }

      // Tạo canvas mới
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Kích thước canvas
      const padding = 40;
      const qrSize = 300;
      const logoHeight = 60;
      const textAreaHeight = 200;
      canvas.width = qrSize + padding * 2;
      canvas.height = logoHeight + qrSize + padding * 2 + textAreaHeight;

      // Vẽ nền trắng
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ chữ FoodShare màu xanh
      ctx.fillStyle = '#54A65C';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('FoodShare', canvas.width / 2, padding, canvas.width - padding * 2);

      // Vẽ QR code từ SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Vẽ QR code vào canvas (dưới chữ FoodShare)
          ctx.drawImage(img, padding, padding + logoHeight, qrSize, qrSize);
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.onerror = reject;
        img.src = url;
      });

      // Vẽ thông tin cửa hàng
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Tên cửa hàng
      ctx.font = 'bold 24px Arial, sans-serif';
      const maxNameWidth = canvas.width - padding * 2;
      const nameY = logoHeight + qrSize + padding * 2 + 20;
      ctx.fillText(shopName, canvas.width / 2, nameY, maxNameWidth);

      // Địa chỉ
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = '#6b7280';
      const addressY = nameY + 40;
      ctx.fillText('📍 Địa chỉ:', canvas.width / 2, addressY);
      
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = '#1f2937';
      const addressTextY = addressY + 20;
      const addressLines = wrapText(ctx, shopAddress, maxNameWidth);
      addressLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, addressTextY + index * 20, maxNameWidth);
      });

      // Số điện thoại
      const phoneY = addressTextY + addressLines.length * 20 + 20;
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('📞 Số điện thoại:', canvas.width / 2, phoneY);
      
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.fillText(shopPhone, canvas.width / 2, phoneY + 20, maxNameWidth);

      // Tạo link tải xuống
      const link = document.createElement('a');
      link.download = `QR-Code-${shopName.replace(/\s+/g, '-')}-${shopId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Lỗi khi xuất ảnh QR code:', error);
      alert('Có lỗi xảy ra khi xuất ảnh QR code. Vui lòng thử lại.');
    }
  };

  // Hàm wrap text để xuống dòng khi quá dài
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>QR Code Cửa Hàng</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="xs"
            className={styles.closeButton}
          >
            ×
          </Button>
        </div>

        <div className={styles.modalBody}>
          {/* Container để xuất ảnh - ẩn border khi hiển thị */}
          <div className={styles.qrContainer}>
            <div className={styles.qrContent}>
              {/* FoodShare Logo */}
              <div className={styles.foodshareLogo}>
                <h1 className={styles.foodshareText}>FoodShare</h1>
              </div>
              
              {/* QR Code */}
              <div ref={qrWrapperRef} className={styles.qrCodeWrapper}>
                <QRCodeSVG
                  value={qrUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className={styles.qrCode}
                />
              </div>

              {/* Thông tin cửa hàng */}
              <div className={styles.shopInfo}>
                <h3 className={styles.shopName}>{shopName}</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📍 Địa chỉ:</span>
                  <span className={styles.infoValue}>{shopAddress}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>📞 Số điện thoại:</span>
                  <span className={styles.infoValue}>{shopPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hướng dẫn */}
          <p className={styles.instruction}>
            Quét mã QR để truy cập cửa hàng trực tuyến
          </p>
        </div>

        <div className={styles.modalFooter}>
          <Button
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            Đóng
          </Button>
          <Button
            onClick={handleDownloadQR}
            variant="primary"
            size="md"
          >
            📥 Tải ảnh QR Code
          </Button>
        </div>
      </div>
    </div>
  );
}

