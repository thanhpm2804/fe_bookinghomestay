
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
        <Route path="/confirm-booking" element={<ConfirmBookingPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
export default App;
