import{API_BASE_URL} from '../configs/apiConfig';
import { Typography, Box, Container, Paper, Grid, Card, CardContent } from '@mui/material';
import Navigation from '../components/Navigation';
import React, { useEffect, useState } from "react";
import axios from "axios";
import Toolbar from "../components/Toolbar";
import GuestSearchBar from "../components/GuestSearchBar";
import Footer from "../components/Footer";
import { fetchDistricts, fetchWards } from "../services/location";
import styles from "./home/home.module.css";

function Home() {
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Đang gọi API...");
        
        // Lấy danh sách homestay và location data song song
        const [homestayResponse, districtsData] = await Promise.all([
          axios.get(`${API_BASE_URL}odata/Homestays?$expand=HomestayImages`),
          fetchDistricts()
        ]);
        
        console.log("Response từ API:", homestayResponse.data);
        console.log("Districts data:", districtsData);
        
        setHomestays(homestayResponse.data.value || []);
        setDistricts(districtsData.value || districtsData || []);
        
        // Lấy tất cả wards cho tất cả districts
        const allWards = [];
        for (const district of districtsData.value || districtsData || []) {
          try {
            const wardsData = await fetchWards(district.DistrictId || district.id);
            const districtWards = (wardsData.value || wardsData || []).map(ward => ({
              ...ward,
              districtId: district.DistrictId || district.id
            }));
            allWards.push(...districtWards);
          } catch (error) {
            console.error(`Lỗi khi lấy wards cho district ${district.DistrictId}:`, error);
          }
        }
        setWards(allWards);
        
      } catch (error) {
        console.error("Lỗi khi lấy toàn bộ homestay:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleSearch = async ({ name, address, ward, district, checkIn, checkOut }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Đang tìm kiếm với params:", { name, address, ward, district, checkIn, checkOut });
      
      // Tạo params cho OData query
      const params = {};
      let filterConditions = [];
      
      if (name) {
        const lowerName = name.toLowerCase();
        filterConditions.push(`contains(tolower(Name), '${lowerName}')`);
      }
      
      if (address) {
        filterConditions.push(`contains(StreetAddress, '${address}')`);
      }
      
      if (district) {
        // Tìm tất cả wards thuộc district này
        const districtWards = wards.filter(w => w.districtId === district);
        const wardIds = districtWards.map(w => w.WardId || w.id);
        
        if (wardIds.length > 0) {
          const wardFilter = wardIds.map(id => `WardId eq ${id}`).join(' or ');
          filterConditions.push(`(${wardFilter})`);
        }
      }
      
      if (ward) {
        filterConditions.push(`WardId eq ${ward}`);
      }
      
      // Kết hợp tất cả điều kiện
      if (filterConditions.length > 0) {
        params.$filter = filterConditions.join(' and ');
      }
      
      console.log("OData params:", params);
      
      const response = await axios.get(`${API_BASE_URL}odata/Homestays?$expand=HomestayImages`, { params });
      console.log("Kết quả tìm kiếm:", response.data);
      
      setHomestays(response.data.value || []);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm homestay:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy ảnh đầu tiên từ HomestayImages array
  const getFirstImage = (homestay) => {
    if (homestay.HomestayImages && homestay.HomestayImages.length > 0) {
      // Sắp xếp theo SortOrder và lấy ảnh đầu tiên
      const sortedImages = homestay.HomestayImages.sort((a, b) => a.SortOrder - b.SortOrder);
      return sortedImages[0].ImageUrl;
    }
    return null;
  };

  // Hàm tạo địa chỉ hoàn chỉnh
  const getFullAddress = (homestay) => {
    const streetAddress = homestay.StreetAddress || '';
    
    // Tìm ward (phường/xã)
    const ward = wards.find(w => w.WardId === homestay.WardId || w.id === homestay.WardId);
    const wardName = ward ? (ward.Name || ward.name) : '';
    
    // Tìm district (quận/huyện) từ ward hoặc trực tiếp
    let districtName = '';
    if (ward && ward.districtId) {
      const district = districts.find(d => d.DistrictId === ward.districtId || d.id === ward.districtId);
      districtName = district ? (district.Name || district.name) : '';
    }
    
    // Ghép địa chỉ hoàn chỉnh
    const addressParts = [streetAddress, wardName, districtName].filter(part => part);
    return addressParts.join(', ');
  };

  // Hàm hiển thị trạng thái hoạt động
  const getStatusDisplay = (homestay) => {
    // Kiểm tra trường Status từ API (boolean value)
    const isActive = homestay.Status === true;
    
    return (
      <div className={styles.statusSection}>
        <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
          {isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.homeContainer}>
      <Toolbar />
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <GuestSearchBar onSearch={handleSearch} />
          
          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <p style={{color: 'red'}}>Lỗi: {error}</p>}
          
          <div className={styles.homestayList}>
            {homestays.length > 0 ? (
              homestays.map((homestay, index) => (
                <div key={homestay.HomestayId || index} className={styles.homestayCard}>
                  <div className={styles.cardImage}>
                    <img 
                      src={getFirstImage(homestay) || "/placeholder-image.svg"} 
                      alt={homestay.Name || "Homestay"}
                      onError={(e) => {
                        e.target.src = "/placeholder-image.svg";
                      }}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h3>{homestay.Name}</h3>
                    <p className={styles.location}>{getFullAddress(homestay)}</p>
                    <p className={styles.rules}>{homestay.Description}</p>
                    <div className={styles.priceSection}>
                      {getStatusDisplay(homestay)}
                      <button className={styles.bookButton}>Đặt ngay</button>
                    </div>
                  </div>
                </div>
              ))
            ) : !loading && (
              <p>Không có kết quả tìm kiếm</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
