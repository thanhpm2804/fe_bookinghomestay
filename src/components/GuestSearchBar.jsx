import React, { useState, useEffect } from "react";
import "../styles/GuestSearchBar.css";
import { fetchDistricts, fetchWards } from "../services/location";

const GuestSearchBar = ({ onSearch }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // State cho dữ liệu từ API
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

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
    console.log("GuestSearchBar - Submitting:", { name, address, district, ward, checkIn, checkOut });
    
    if (onSearch) {
      onSearch({ name, address, district, ward, checkIn, checkOut });
    }
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setWard(""); // Reset ward khi đổi district
  };

  return (
    <form className="guest-search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Tên homestay"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        className="search-input"
        placeholder="Địa chỉ"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      
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
        onChange={(e) => setCheckIn(e.target.value)}
      />
      <input
        type="date"
        className="date-input"
        value={checkOut}
        onChange={(e) => setCheckOut(e.target.value)}
      />
      <button type="submit" className="search-button">Tìm kiếm</button>
    </form>
  );
};

export default GuestSearchBar;
