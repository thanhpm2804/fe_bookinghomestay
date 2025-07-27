import React, { useEffect, useState } from "react";
import axios from "axios";
import Toolbar from "../components/Toolbar";
import GuestSearchBar from "../components/GuestSearchBar";
import Footer from "../components/Footer";
import styles from "./home/home.module.css";

function Home() {
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllHomestays = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Đang gọi API...");
        
        const response = await axios.get("https://localhost:7220/odata/Homestays?$expand=HomestayImages");
        console.log("Response từ API:", response.data);
        
        setHomestays(response.data.value || []);
      } catch (error) {
        console.error("Lỗi khi lấy toàn bộ homestay:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHomestays();
  }, []);

  const handleSearch = async ({ name, address, ward, district, checkIn, checkOut }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Đang tìm kiếm với params:", { name, address, ward, district, checkIn, checkOut });
      
      // Tạo params cho OData query
      const params = {};
      if (name) params.$filter = `contains(Name, '${name}')`;
      if (address) params.$filter = params.$filter ? `${params.$filter} and contains(StreetAddress, '${address}')` : `contains(StreetAddress, '${address}')`;
      
      console.log("OData params:", params);
      
      const response = await axios.get("https://localhost:7220/odata/Homestays?$expand=HomestayImages", { params });
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
                    <p className={styles.location}>{homestay.StreetAddress}</p>
                    <p className={styles.rules}>{homestay.Description}</p>
                    <div className={styles.priceSection}>
                      <span className={styles.price}>
                        {homestay.Price ? `${homestay.Price} VND` : "Liên hệ"}
                      </span>
                      <span>/đêm</span>
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
