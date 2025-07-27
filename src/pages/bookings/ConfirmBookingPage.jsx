import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ConfirmBooking.module.css';
import { createBooking, getUserInfor } from '../../services/bookingService';
import { createVNPayUrl } from '../../services/vnpayService';

const ConfirmBookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Lấy booking data từ navigation state
    const bookingData = location.state?.bookingData;

    // Guest information form - Chỉ yêu cầu đặc biệt (có thể chỉnh sửa)
    const [guestInfo, setGuestInfo] = useState({
        fullName: '',
        phone: ''
    });
    // Redirect nếu không có booking data
    useEffect(() => {
        console.log('Received booking data:', bookingData);
        const loadUserInfor = async () => {
            const userInfoData = await getUserInfor();
            if (userInfoData) {
                setGuestInfo({
                    fullName: `${userInfoData.lastName} ${userInfoData.fistName}`,
                    phone: userInfoData.phoneNumber
                })
            }
        }
        loadUserInfor()
        if (!bookingData) {
            console.log('No booking data found, redirecting to home...');
            navigate('/');
            return;
        }

        // Validate booking data structure
        if (!bookingData.rooms || bookingData.rooms.length === 0) {
            console.log('Invalid booking data: no rooms');
            navigate('/');
            return;
        }

        // Validate room data structure
        const hasValidRoomData = bookingData.rooms.every(room =>
            room.price && typeof room.price === 'number' &&
            room.nights && typeof room.nights === 'number'
        );

        if (!hasValidRoomData) {
            console.log('Invalid room data: missing price or nights');
            navigate('/');
            return;
        }

        if (!bookingData.checkIn || !bookingData.checkOut) {
            console.log('Invalid booking data: missing dates');
            navigate('/');
            return;
        }
    }, [bookingData, navigate]);

    if (!bookingData) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.cardContent}>
                        <p>Không tìm thấy thông tin đặt phòng. Vui lòng thử lại.</p>
                        <button
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            onClick={() => navigate('/')}
                        >
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate totals - TÍNH Ở ĐÂY (chỉ tính subtotal)
    const calculateSubtotal = () => {
        return bookingData.rooms.reduce((sum, room) => {
            return sum + (room.price * room.nights);
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const total = subtotal;

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

    // Validate form - Không cần validate vì không có field bắt buộc
    const validateForm = () => {
        // Không có validation vì chỉ có yêu cầu đặc biệt (optional)
        return true;
    };



    // Handle back to homestay
    const handleBack = () => {
        navigate(-1);
    };

    // Handle confirm booking
    const handleConfirmBooking = async () => {
        setLoading(true);
        try {
            const roomIds = bookingData.rooms.map((room) => {
                return room.id
            })
            /*console.log('Booking data: ', {
                homestayId: bookingData.homestayId,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                roomIds: roomIds
            })*/
            const response = await createBooking(bookingData.homestayId, bookingData.checkIn, bookingData.checkOut, roomIds)
            console.log('Create booking successfully with bookingId: ', response.bookingId)
            if (response.error) {
                console.log('Create booking error: ', response.error)
                throw new Error(`${response.error}`);
            }
            const paymentBookingData = {
                homestayName: bookingData.homestayName,
                totalAmount: response.totalAmount,
            }
            // Tạo VNPay URL
            const vnpayResult = createVNPayUrl(paymentBookingData);

            console.log('VNPay URL:', vnpayResult.paymentUrl);

            // Chuyển hướng đến VNPay
            window.location.href = vnpayResult.paymentUrl;

        } catch (error) {
            console.error('Booking error:', error);
            alert('Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Xác nhận đặt phòng</h1>
                <p className={styles.subtitle}>Vui lòng kiểm tra lại thông tin trước khi xác nhận</p>
            </div>

            {/* Homestay Information */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    Thông tin chỗ nghỉ
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.homestayInfo}>
                        <img
                            src={bookingData.homestayImageUrl}
                            alt={bookingData.homestayName}
                            className={styles.homestayImage}
                        />
                        <div className={styles.homestayDetails}>
                            <h3>{bookingData.homestayName}</h3>
                            <p>Homestay • Đà Nẵng</p>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className={styles.dateRow}>
                        <div className={styles.dateItem}>
                            <div className={styles.dateLabel}>Ngày nhận phòng</div>
                            <div className={styles.dateValue}>{formatDate(bookingData.checkIn)}</div>
                        </div>
                        <div className={styles.dateItem}>
                            <div className={styles.dateLabel}>Ngày trả phòng</div>
                            <div className={styles.dateValue}>{formatDate(bookingData.checkOut)}</div>
                        </div>
                        <div className={styles.dateItem}>
                            <div className={styles.dateLabel}>Số đêm</div>
                            <div className={styles.dateValue}>{bookingData.nights} đêm</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms Information */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    Chi tiết phòng ({bookingData.rooms.length} phòng)
                </div>
                <div className={styles.cardContent}>
                    {bookingData.rooms.map((room, index) => (
                        <div key={room.id} className={styles.roomItem}>
                            <div className={styles.roomHeader}>
                                <h4 className={styles.roomName}>{room.name}</h4>
                                <span className={styles.roomPrice}>
                                    {formatPrice(room.price * room.nights)}
                                </span>
                            </div>
                            <div className={styles.roomDetails}>
                                {formatPrice(room.price)}/đêm × {room.nights} đêm
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Guest Information - Họ tên và SĐT read-only, chỉ yêu cầu đặc biệt editable */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    Thông tin khách hàng
                </div>
                <div className={styles.cardContent}>
                    <form className={styles.guestForm}>
                        {/* Họ tên - Read only */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                value={guestInfo.fullName}
                                className={`${styles.formInput} ${styles.readOnlyInput}`}
                                readOnly
                                disabled
                            />
                            <small className={styles.helpText}>
                                Thông tin này sẽ được sử dụng khi check-in
                            </small>
                        </div>

                        {/* Số điện thoại - Read only */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={guestInfo.phone}
                                className={`${styles.formInput} ${styles.readOnlyInput}`}
                                readOnly
                                disabled
                            />
                            <small className={styles.helpText}>
                                Homestay sẽ liên hệ qua số này nếu cần thiết
                            </small>
                        </div>

                    </form>
                </div>
            </div>

            {/* Total Cost */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    Chi tiết thanh toán
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.totalSection}>
                        <div className={`${styles.totalRow} ${styles.main}`}>
                            <span>Tổng cộng ({bookingData.nights} đêm):</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>


                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
                <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={handleBack}
                    disabled={loading}
                >
                    ← Quay lại
                </button>
                <button
                    type="button"
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    onClick={handleConfirmBooking}
                    disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
                </button>
            </div>
        </div>
    );
};

export default ConfirmBookingPage;