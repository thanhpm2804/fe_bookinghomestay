import React, { useState } from 'react';
import styles from './BookingSummary.module.css';

const BookingSummary = ({
  isVisible = false,
  checkInDate,
  checkOutDate,
  selectedRooms = [],
  onRemoveRoom,
  onBook,
  onClose
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isVisible) return null;

  // Tính tổng số tiền
  const totalPrice = selectedRooms.reduce((total, room) => {
    return total + (room.price * room.nights);
  }, 0);

  // Format currency VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Tính số đêm
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${styles.summaryContainer} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Toggle Button */}
      <button 
        className={styles.toggleButton}
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Mở rộng" : "Thu gọn"}
      >
        <i className={`bi bi-chevron-${isCollapsed ? 'up' : 'down'}`}></i>
      </button>

      <div className={styles.summaryContent}>
        {/* Header */}
        <div className={styles.summaryHeader}>
          <h3 className={styles.summaryTitle}>
            Booking ({selectedRooms.length} phòng)
          </h3>
        </div>

        {/* Collapsible Content */}
        <div className={`${styles.collapsibleContent} ${isCollapsed ? styles.hidden : ''}`}>
          {/* Date Information */}
          <div className={styles.dateInfo}>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Ngày nhận phòng</span>
              <span className={styles.dateValue}>
                {checkInDate ? formatDate(checkInDate) : '--'}
              </span>
            </div>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Ngày trả phòng</span>
              <span className={styles.dateValue}>
                {checkOutDate ? formatDate(checkOutDate) : '--'}
              </span>
            </div>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Số đêm</span>
              <span className={styles.dateValue}>{nights} đêm</span>
            </div>
          </div>

          {/* Rooms List */}
          <div className={styles.roomsList}>
            {selectedRooms.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Chưa có phòng nào được chọn</p>
              </div>
            ) : (
              selectedRooms.map((room) => (
                <div key={room.id} className={styles.roomItem}>
                  <div className={styles.roomInfo}>
                    <div className={styles.roomName}>{room.name}</div>
                  </div>
                  <div className={styles.roomPrice}>
                    {formatPrice(room.price)} /đêm
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => onRemoveRoom(room.id)}
                    aria-label={`Xóa ${room.name}`}
                  >
                    Xóa
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={styles.summaryFooter}>
            <div>
              <div className={styles.totalLabel}>Tổng cộng</div>
              <div className={styles.totalPrice}>{formatPrice(totalPrice)}</div>
            </div>
            <button
              className={styles.bookButton}
              onClick={onBook}
              disabled={selectedRooms.length === 0}
            >
              Đặt phòng
            </button>
          </div>
        </div>

        {/* Collapsed Summary */}
        {isCollapsed && (
          <div className={styles.collapsedSummary}>
            <div className={styles.collapsedInfo}>
              <span className={styles.collapsedText}>
                {selectedRooms.length} phòng • {nights} đêm
              </span>
              <span className={styles.collapsedPrice}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              className={styles.collapsedBookButton}
              onClick={onBook}
              disabled={selectedRooms.length === 0}
            >
              Đặt phòng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;