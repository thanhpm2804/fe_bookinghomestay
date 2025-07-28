import React from "react";
import styles from "./PaymentSuccess.module.css";
import { Home, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/home");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <svg
            className={styles.checkIcon}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Thanh toán thành công!</h1>
        <p className={styles.message}>
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
        </p>

        <div className={styles.heartWrapper}>
          <Heart className={styles.heartIcon} />
        </div>

        <button className={styles.backButton} onClick={handleBackHome}>
          <Home size={20} />
          <span>Về trang chủ</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
