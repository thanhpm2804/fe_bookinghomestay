# React Homestay Application

Ứng dụng tìm kiếm và đặt phòng homestay được xây dựng bằng React.

## Tính năng chính

### Toolbar Navigation
- **Logo**: Hiển thị ở góc trái, click để về trang chủ
- **Account Menu**: Icon account ở góc phải với dropdown menu
  - **Chưa đăng nhập**: Trang chủ, Đăng nhập, Đăng ký, Trợ giúp
  - **Đã đăng nhập**: Trang chủ, Thông tin cá nhân, Trợ giúp, Đăng xuất

### Authentication
- Đăng ký tài khoản mới
- Đăng nhập với email/password
- Đăng nhập bằng Google OAuth
- Quên mật khẩu và đặt lại
- Quản lý trạng thái đăng nhập với Context API

### Tìm kiếm Homestay
- Tìm kiếm theo tên, địa chỉ
- Lọc theo quận/huyện, phường/xã
- Chọn ngày check-in/check-out
- Hiển thị danh sách homestay với hình ảnh và thông tin

## Cấu trúc dự án

```
src/
├── components/
│   ├── Toolbar.jsx          # Navigation toolbar với logo và dropdown
│   ├── GuestSearchBar.jsx   # Thanh tìm kiếm
│   └── ...
├── contexts/
│   └── AuthContext.jsx      # Quản lý trạng thái đăng nhập
├── pages/
│   ├── Home.jsx            # Trang chủ với danh sách homestay
│   ├── Login.jsx           # Trang đăng nhập
│   ├── Register.jsx        # Trang đăng ký
│   ├── Profile.jsx         # Trang thông tin cá nhân
│   ├── Help.jsx            # Trang trợ giúp
│   └── ...
├── services/
│   └── auth.js             # API calls cho authentication
└── styles/
    └── Toolbar.css         # Styles cho toolbar
```

## Cài đặt và chạy

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
npm run dev
```

3. Mở trình duyệt và truy cập: `http://localhost:5173`

## API Endpoints

- Base URL: `https://localhost:7220/api`
- Homestay OData: `https://localhost:7220/odata/Homestays`

## Tính năng mới trong Toolbar

### Logo và Branding
- Logo clickable để về trang chủ
- Tên ứng dụng hiển thị bên cạnh logo
- Responsive design cho mobile

### Account Dropdown
- Icon account với hiệu ứng hover
- Dropdown menu với animation
- Tự động đóng khi click bên ngoài
- Hiển thị menu khác nhau dựa trên trạng thái đăng nhập

### Navigation
- Sử dụng React Router cho navigation
- Context API để quản lý authentication state
- LocalStorage để lưu trữ token và user data

## Styling

Toolbar sử dụng CSS custom với:
- Flexbox layout
- Smooth transitions và animations
- Box shadows và border radius
- Responsive design
- Hover effects

## Dependencies

- React 19.1.0
- React Router DOM 7.7.0
- Material-UI 7.2.0
- Axios 1.11.0
- Google OAuth
