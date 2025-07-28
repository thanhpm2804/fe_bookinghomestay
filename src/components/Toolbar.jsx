// Toolbar.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Toolbar.css";

const Toolbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();
  console.log('isAuthenticated:', isAuthenticated, 'user:', user);
  const navigate = useNavigate();

  // Đóng dropdown khi click bên ngoài
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setIsDropdownOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  const handleLogout = () => {
    logout();
    navigate("/home");
    setIsDropdownOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="toolbar">
      {/* Logo bên trái */}
      <div className="toolbar-logo">
        <img 
          src="https://img.freepik.com/premium-vector/hotel-homestay-logo-with-shape-house-tree-homestay-natural-logo-simple-icon-vector_150826-265.jpg?w=2000" 
          alt="Homestay Booking Logo" 
          className="logo-image large-logo"
          onClick={() => navigate("/home")}
        />
        <span className="logo-title">HealingLand</span>
      </div>

      {/* Dropdown menu bên phải */}
      <div className="toolbar-account" ref={dropdownRef}>
        <div 
          className="account-icon"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
          </svg>
        </div>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div 
              className="dropdown-item"
              onClick={() => handleNavigation("/home")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
              </svg>
              Trang chủ
            </div>
            
            {!isAuthenticated ? (
              <>
                <div 
                  className="dropdown-item"
                  onClick={() => handleNavigation("/login")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7ZM20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" fill="currentColor"/>
                  </svg>
                  Đăng nhập
                </div>
                <div 
                  className="dropdown-item"
                  onClick={() => handleNavigation("/register")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 4A4 4 0 0 0 15 12A4 4 0 0 0 15 4M15 5.8C16.68 5.8 18 7.08 18 8.8C18 10.52 16.68 11.8 15 11.8A2.8 2.8 0 0 1 12.2 8.8A2.8 2.8 0 0 1 15 5.8M4 7V10H1V12H4V15H6V12H9V10H6V7H4M15 13C12.33 13 7 14.33 7 17V20H23V17C23 14.33 17.67 13 15 13M15 14.9C17.97 14.9 21.1 16.36 21.1 17V18.1H8.9V17C8.9 16.36 12 14.9 15 14.9Z" fill="currentColor"/>
                  </svg>
                  Đăng ký
                </div>
              </>
            ) : (
              <>
                <div 
                  className="dropdown-item"
                  onClick={() => handleNavigation("/profile")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                  </svg>
                  Thông tin cá nhân
                </div>
                <div 
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                  </svg>
                  Đăng xuất
                </div>
              </>
            )}
            
            <div 
              className="dropdown-item"
              onClick={() => handleNavigation("/help")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" fill="currentColor"/>
              </svg>
              Trợ giúp
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Toolbar;