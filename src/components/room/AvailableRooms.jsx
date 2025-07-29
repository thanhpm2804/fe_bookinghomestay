import React, { useEffect, useState } from 'react';
import styles from './AvailableRooms.module.css';
import DatePicker from 'react-datepicker';
import { parse, format, startOfDay, isAfter, addDays } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

const AvailableRooms = ({ checkIn, checkOut, rooms, onFilterRooms,  onSelectRoom, onCheckInDateChange, onCheckOutDateChange }) => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  useEffect(() => {
    if (checkIn) setCheckInDate(parse(checkIn, 'yyyy-MM-dd', new Date()));
    if (checkOut) setCheckOutDate(parse(checkOut, 'yyyy-MM-dd', new Date()));
  }, [checkIn, checkOut]);
  
  // Hàm phụ trợ
  const handleBookRoom = (room) => {
    console.log(`Booking room from ${checkInDate} to ${checkOutDate}: `, room);
    if (onSelectRoom) {
      onSelectRoom(room);
    }
  };

  
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const today = startOfDay(new Date());

      const isCheckInValid = isAfter(checkInDate, today);
      const isCheckOutValid = isAfter(checkOutDate, addDays(checkInDate, 0)); 

      if (isCheckInValid && isCheckOutValid) {
        const checkInFormatted = format(checkInDate, 'yyyy-MM-dd');
        const checkOutFormatted = format(checkOutDate, 'yyyy-MM-dd');
        onFilterRooms(checkInFormatted, checkOutFormatted)
      }
    }
  }, [checkOutDate]);

  const convertAmenities = (amenities) => {
    if (amenities && amenities.length > 0) {
      return amenities.join(', ')
    }
    return ''
  }
  const convertRoomBed = (roomBeds) => {
    if (roomBeds && roomBeds.length > 0) {
      return roomBeds.join(', ');
    }
    return ''
  }
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  return (
    <section className={styles.roomSection}>
      <h2 className={styles.sectionHeader}>Các phòng có sẵn</h2>

      <div className={styles.bookingCard}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className={styles.formLabel}>Ngày nhận phòng:</label>
            <DatePicker
              selected={checkInDate}
              onChange={(date) => {
                const checkInFormatted = format(date, 'yyyy-MM-dd');
                onCheckInDateChange(checkInFormatted)
                setCheckInDate(date)
              }}
              dateFormat="dd/MM/yyyy"
              className={styles.formControl}
              minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
            />
          </div>
          <div className="col-md-6">
            <label className={styles.formLabel}>Ngày trả phòng:</label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => {
                const checkOutFormatted = format(date, 'yyyy-MM-dd');
                onCheckOutDateChange(checkOutFormatted)
                setCheckOutDate(date)
              }}
              dateFormat="dd/MM/yyyy"
              className={styles.formControl}
              minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date(new Date().setDate(new Date().getDate() + 2))}
            />
          </div>
        </div>
      </div>

      {rooms.map((room) => (
        <div key={room.RoomId} className={`${styles.roomCard} ${room.IsAvailable === false ? styles.roomCardUnavailable : ''}`}>
          <div className="row g-0">
            <div className="col-md-3">
              <img
                src={room.ImgUrl || "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/55/34/0c/ta-ng-1-co-3-can-pool.jpg?w=900&h=500&s=1"}
                className={styles.roomImage}
                alt={room.Name}
              />
            </div>
            <div className="col-md-5">
              <div style={{ padding: '1.5rem' }}>
                <h3 className={styles.roomName}>{room.Name}</h3>
                <p className={styles.roomSleep}>Phòng cho {room.Capacity} người</p>
                <p className={styles.roomDescription}>{convertAmenities(room.Amenities)}</p>
                <p className={styles.roomBeds}>{convertRoomBed(room.RoomBeds)}</p>
                <p className={styles.roomDescription}>Diện tích: {room.Size} m2</p>
                <span className={styles.badgeAvailable}>
                  {room.IsAvailable === false ? 'HẾT PHÒNG' : 'PHÒNG CÓ SẴN'}
                </span>
              </div>
            </div>
            <div className="col-md-4 d-flex flex-column justify-content-between p-4">
              <div className="text-end mb-3">
                <div className={styles.priceBox}>
                  <div>{formatPrice(room.Price)} đ/đêm</div>
                </div>
              </div>
              <button
                className={styles.bookButton}
                disabled={!checkInDate || !checkOutDate || room.IsAvailable === false}
                onClick={() => handleBookRoom(room)}
              >
                {room.IsAvailable === false ? 'Hết phòng' : '+ Chọn phòng'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default AvailableRooms;
