import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import Home from "./pages/Home";
import HomestayDetailPage from "./pages/homestays/HomestayDetailPage";
import ConfirmBookingPage from "./pages/bookings/ConfirmBookingPage";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={<Home />} />
      <Route path="/homestay-detail" element={<HomestayDetailPage/>} />
      <Route path="/confirm-booking" element={<ConfirmBookingPage />} />
    </Routes>
  );
}
export default App;
