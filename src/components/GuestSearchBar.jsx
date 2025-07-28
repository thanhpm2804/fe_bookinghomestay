import React, { useState, useEffect } from "react";
import "../styles/GuestSearchBar.css";
import { fetchDistricts, fetchWards } from "../services/location";

const GuestSearchBar = ({ onSearch }) => {
  const [name, setName] = useState("");
  // Đã xóa: const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  // State cho dữ liệu từ API
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  // Lấy ngày hôm nay (YYYY-MM-DD)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Lấy danh sách quận/huyện khi component mount
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const data = await fetchDistricts();
        setDistricts(data.value || data); // Tùy theo cấu trúc API response
      } catch (error) {
        console.error("Lỗi khi lấy danh sách quận/huyện:", error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    loadDistricts();
  }, []);

  // Lấy danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    const loadWards = async () => {
      if (!district) {
        setWards([]);
        return;
      }

      try {
        setLoadingWards(true);
        const data = await fetchWards(district);
        setWards(data.value || data); // Tùy theo cấu trúc API response
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phường/xã:", error);
        setWards([]);
      } finally {
        setLoadingWards(false);
      }
    };
    loadWards();
  }, [district]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // Validate ngày checkin >= hôm nay
    if (checkIn && checkIn < todayStr) {
      setError("Ngày nhận phòng không được nhỏ hơn hôm nay.");
      return;
    }
    // Validate ngày checkout > checkin
    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Ngày trả phòng phải lớn hơn ngày nhận phòng.");
      return;
    }
    if (onSearch) {
      onSearch({ name, district, ward, checkIn, checkOut });
    }
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setWard(""); // Reset ward khi đổi district
  };

  return (
    <form className="guest-search-bar" onSubmit={handleSubmit}>
      {error && <div style={{color: 'red', marginBottom: 8, fontWeight: 500}}>{error}</div>}
      {/* Hàng đầu tiên: Quận/Huyện, Phường/Xã, Check-in, Check-out */}
      <div className="search-row">
        <select
          className="search-input"
          value={district}
          onChange={handleDistrictChange}
          disabled={loadingDistricts}
        >
          <option value="">
            {loadingDistricts ? "Đang tải..." : "Chọn Quận/Huyện"}
          </option>
          {districts.map(dist => (
            <option key={dist.DistrictId || dist.id} value={dist.DistrictId || dist.id}>
              {dist.Name || dist.name}
            </option>
          ))}
        </select>
        <select
          className="search-input"
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          disabled={!district || loadingWards}
        >
          <option value="">
            {loadingWards ? "Đang tải..." : "Chọn Phường/Xã"}
          </option>
          {wards.map(w => (
            <option key={w.WardId || w.id} value={w.WardId || w.id}>
              {w.Name || w.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="date-input"
          value={checkIn}
          min={todayStr}
          onChange={(e) => setCheckIn(e.target.value)}
        />
        <input
          type="date"
          className="date-input"
          value={checkOut}
          min={checkIn ? getNextDay(checkIn) : todayStr}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>

      {/* Hàng thứ hai: Tên homestay và nút tìm kiếm */}
      <div className="search-row">
        <input
          type="text"
          className="search-input wide"
          placeholder="Tên homestay"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="search-button">Tìm kiếm</button>
      </div>
    </form>
  );
};

// Hàm lấy ngày tiếp theo (YYYY-MM-DD)
function getNextDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default GuestSearchBar;
