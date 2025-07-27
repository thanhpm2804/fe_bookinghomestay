// src/services/vnpayService.js
import CryptoJS from 'crypto-js';

// VNPay Configuration - Thay đổi theo thông tin thực tế
const VNPAY_CONFIG = {
  vnp_TmnCode: '4PQNSL0D', // Terminal ID do VNPay cung cấp
  vnp_HashSecret: 'CTJLJITS295MB6UQDUR0ZWOXW89BUAFP', // Secret key do VNPay cung cấp
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // Sandbox URL
  vnp_ReturnUrl: 'https://ca4cbef1d084.ngrok-free.app/api/payments/vnpay/ipn', // URL return sau khi thanh toán
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_CurrCode: 'VND'
};

// Sắp xếp object theo key
const sortObject = (obj) => {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
};

// Tạo URL thanh toán VNPay
export const createVNPayUrl = (bookingData) => {
  const createDate = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
  const orderId = `BK${Date.now()}`;
  
  // Tạo vnp_Params
  let vnp_Params = {
    vnp_Version: VNPAY_CONFIG.vnp_Version,
    vnp_Command: VNPAY_CONFIG.vnp_Command,
    vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: VNPAY_CONFIG.vnp_CurrCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan dat phong ${bookingData.homestayName}`,
    vnp_OrderType: 'other',
    vnp_Amount: bookingData.totalAmount * 100, // VNPay yêu cầu amount * 100
    vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
    vnp_IpAddr: '127.0.0.1', // IP của client
    vnp_CreateDate: createDate
  };

  // Sắp xếp params
  vnp_Params = sortObject(vnp_Params);

  // Tạo query string
  const signData = new URLSearchParams(vnp_Params).toString();
  
  // Tạo secure hash
  const hmac = CryptoJS.HmacSHA512(signData, VNPAY_CONFIG.vnp_HashSecret);
  const signed = CryptoJS.enc.Hex.stringify(hmac);
  
  // Thêm vnp_SecureHash vào params
  vnp_Params.vnp_SecureHash = signed;

  // Tạo URL cuối cùng
  const paymentUrl = VNPAY_CONFIG.vnp_Url + '?' + new URLSearchParams(vnp_Params).toString();
  
  return {
    paymentUrl,
    orderId,
    amount: bookingData.totalAmount
  };
};

// Verify return URL từ VNPay
export const verifyVNPayReturn = (params) => {
  const vnp_SecureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  // Sắp xếp params
  const sortedParams = sortObject(params);
  const signData = new URLSearchParams(sortedParams).toString();
  
  // Tạo secure hash để verify
  const hmac = CryptoJS.HmacSHA512(signData, VNPAY_CONFIG.vnp_HashSecret);
  const signed = CryptoJS.enc.Hex.stringify(hmac);

  // So sánh hash
  if (signed === vnp_SecureHash) {
    return {
      isValid: true,
      responseCode: params.vnp_ResponseCode,
      transactionId: params.vnp_TransactionNo,
      amount: params.vnp_Amount / 100,
      orderInfo: params.vnp_OrderInfo,
      payDate: params.vnp_PayDate
    };
  }
  
  return {
    isValid: false,
    message: 'Invalid signature'
  };
};