// src/services/paymentService.js

import { API_BASE_URL } from "../configs/apiConfig";

  // Tạo payment URL từ backend
export const createVNPayPayment = async (bookingData) => {
  //console.log('Create payment data: ', bookingData)
    try {
      const requestData = {
        bookingId: bookingData.bookingId ,
        homestayId: bookingData.homestayId,
        homestayName: bookingData.homestayName,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: bookingData.nights,
        amount: bookingData.amount,
        roomIds: bookingData.roomIds || [],
      };

      const response = await fetch(`${API_BASE_URL}api/payments/vnpay/create-vnpay-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      //console.log('URL create payment:', `${API_BASE_URL}api/payments/vnpay/create-vnpay-payment`)
      const result = await response.json();
      console.log('Create payment response: ', result)
      if (response.ok && result.Success) {
        return {
          success: true,
          paymentUrl: result.PaymentUrl,
          bookingId: result.BookingId,
          message: result.Message
        };
      } else {
        return {
          success: false,
          error: result.message || 'Không thể tạo liên kết thanh toán'
        };
      }
    } catch (error) {
      console.error('Error creating VNPay payment:', error);
      return {
        success: false,
        error: 'Lỗi kết nối server'
      };
    }
  }

  // Xác nhận thanh toán với backend
  const  confirmPayment = async (bookingId, vnpayParams = {})  => {
    try {
      const requestData = {
        bookingId: bookingId,
        vnpayParams: vnpayParams
      };

      const response = await fetch(`${API_BASE_URL}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: result.success,
          bookingId: result.bookingId,
          status: result.status,
          paymentStatus: result.paymentStatus,
          transactionId: result.transactionId,
          message: result.message
        };
      } else {
        return {
          success: false,
          error: result.message || 'Lỗi xác nhận thanh toán'
        };
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: 'Lỗi kết nối server'
      };
    }
  }

  // Lấy trạng thái booking
  const  getBookingStatus = async(bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking-status/${bookingId}`);
      
      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          data: result
        };
      } else {
        return {
          success: false,
          error: 'Không tìm thấy booking'
        };
      }
    } catch (error) {
      console.error('Error getting booking status:', error);
      return {
        success: false,
        error: 'Lỗi kết nối server'
      };
    }
  }

  // Xử lý thanh toán tiền mặt
  const createCashPayment =(bookingData) => {
    const bookingId = bookingData.bookingId || `BK${Date.now()}`;
    
    const cashBookingData = {
      ...bookingData,
      bookingId,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      data: cashBookingData,
      message: 'Đặt phòng thành công! Bạn sẽ thanh toán tại homestay.'
    };
  }

  // Parse VNPay return URL params
  const parseVNPayReturnParams = (urlSearchParams) => {
    const params = {};
    for (let [key, value] of urlSearchParams.entries()) {
      params[key] = value;
    }
    return params;
  }

  // Format currency
  const formatCurrency =(amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Validate booking data
  const validateBookingData = (bookingData) => {
    const errors = [];

    if (!bookingData.homestayName) {
      errors.push('Thiếu tên homestay');
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      errors.push('Thiếu ngày check-in hoặc check-out');
    }

    if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
      errors.push('Số tiền không hợp lệ');
    }

    if (!bookingData.rooms || bookingData.rooms.length === 0) {
      errors.push('Chưa chọn phòng');
    }

    if (!bookingData.guestInfo?.fullName || !bookingData.guestInfo?.phone) {
      errors.push('Thiếu thông tin khách hàng');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get available payment methods
  const getAvailablePaymentMethods = () => {
    return [
      {
        id: 'vnpay',
        name: 'Thanh toán qua VNPay',
        description: 'Thẻ ATM, Internet Banking, Ví điện tử',
        logo: 'https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png',
        enabled: true
      },
      {
        id: 'cash',
        name: 'Thanh toán tại homestay',
        description: 'Thanh toán bằng tiền mặt khi nhận phòng',
        icon: '💵',
        enabled: true
      }
    ];
  }
