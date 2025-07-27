import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import Home from "./pages/Home";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import RoomManagement from "./pages/owner/RoomManagement";
import HomestayUpdate from "./pages/owner/HomestayUpdate";
import Revenue from "./pages/owner/Revenue";
import BookingList from "./pages/owner/BookingList";
import OwnerWelcome from "./pages/owner/OwnerWelcome";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={<Home />} />
      {/* Owner routes */}
      <Route path="/owner" element={<OwnerDashboard />}>
        <Route index element={<OwnerWelcome />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="homestay" element={<HomestayUpdate />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="bookings" element={<BookingList />} />
      </Route>
    </Routes>
  );
}
export default App;
