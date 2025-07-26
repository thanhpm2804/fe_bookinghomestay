// Toolbar.js
import React from "react";
import "../styles/Toolbar.css";

const Toolbar = () => {
  return (
    <nav className="toolbar">
      <div className="toolbar-links">
        <a href="/home" className="toolbar-link">Trang chủ</a>
        <a href="/signup" className="toolbar-link">Đăng ký</a>
        <a href="/login" className="toolbar-link">Đăng nhập</a>
        <a href="/help" className="toolbar-link">Trợ giúp</a>
      </div>
    </nav>
  );
};

export default Toolbar;