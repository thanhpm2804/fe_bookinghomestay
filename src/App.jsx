
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from './pages/Register'
import RegisterOwner from "./pages/RegisterOwner";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import Home from "./pages/Home";
import HomestayDetailPage from "./pages/homestays/HomestayDetailPage";
import ConfirmBookingPage from "./pages/bookings/ConfirmBookingPage";
import Profile from "./pages/Profile";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import RoomManagement from "./pages/owner/RoomManagement";
import HomestayUpdate from "./pages/owner/HomestayUpdate";
import Revenue from "./pages/owner/Revenue";
import BookingList from "./pages/owner/BookingList";
import OwnerWelcome from "./pages/owner/OwnerWelcome";
import PaymentSuccess from "./pages/payments/PaymentSuccess";
import CreateHomestayPage from "./pages/homestays/CreateHomestayPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-owner" element={<RegisterOwner />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/homestay-detail" element={<HomestayDetailPage />} />
        <Route path="/create-homestay" element={<CreateHomestayPage />} />
        <Route path="/confirm-booking" element={<ConfirmBookingPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/owner" element={<OwnerDashboard />}>
          <Route index element={<OwnerWelcome />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="homestay" element={<HomestayUpdate />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="bookings" element={<BookingList />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App;
