import React, { useState, useEffect } from 'react';
import styles from './RoomsCreationStep.module.css';

const RoomsCreationStep = ({ data, onChange, onNext, onPrev, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    rooms: []
  });
  const [errors, setErrors] = useState({});
  
  const [bedTypes] = useState([
    { id: 1, name: 'Single Bed' },
    { id: 2, name: 'Double Bed' },
    { id: 3, name: 'Queen Bed' },
    { id: 4, name: 'King Bed' },
    { id: 5, name: 'Bunk Bed' },
    { id: 6, name: 'Sofa Bed' }
  ]);

  const [amenities] = useState([
    { id: 1, name: 'WiFi' },
    { id: 2, name: 'Air Conditioning' },
    { id: 3, name: 'Private Bathroom' },
    { id: 4, name: 'Balcony' },
    { id: 5, name: 'Ocean View' },
    { id: 6, name: 'Mountain View' },
    { id: 7, name: 'City View' },
    { id: 8, name: 'Kitchen' },
    { id: 9, name: 'TV' },
    { id: 10, name: 'Mini Fridge' },
    { id: 11, name: 'Safe' },
    { id: 12, name: 'Work Desk' }
  ]);

  useEffect(() => {
    if (data) {
      setFormData({
        rooms: data.rooms || []
      });
    }
  }, [data]);

  const validateRoom = (room) => {
    const errors = {};
    
    if (!room.name || room.name.trim().length === 0) {
      errors.name = 'Tên phòng không được để trống';
    }
    
    if (!room.capacity || room.capacity < 1 || room.capacity > 10) {
      errors.capacity = 'Sức chứa phải từ 1-10 người';
    }
    
    if (!room.price || room.price <= 0) {
      errors.price = 'Giá phòng phải lớn hơn 0';
    }
    
    if (!room.size || room.size <= 0) {
      errors.size = 'Diện tích phải lớn hơn 0';
    }
    
    if (!room.roomBeds || room.roomBeds.length === 0) {
      errors.roomBeds = 'Vui lòng chọn ít nhất một loại giường';
    }
    
    if (!room.imgUrl) {
      errors.imgUrl = 'Vui lòng tải lên ảnh phòng';
    }
    
    return errors;
  };

  const validateForm = () => {
    if (!formData.rooms || formData.rooms.length === 0) {
      setErrors({ rooms: 'Vui lòng tạo ít nhất một phòng' });
      return false;
    }
    
    const newErrors = {};
    formData.rooms.forEach((room, index) => {
      const roomErrors = validateRoom(room);
      if (Object.keys(roomErrors).length > 0) {
        newErrors[`room_${index}`] = roomErrors;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: '',
      capacity: 1,
      price: '',
      size: '',
      amenities: [],
      roomBeds: [],
      imgUrl: '',
      imgPreview: null
    };
    
    setFormData(prev => ({
      ...prev,
      rooms: [...(prev.rooms || []), newRoom]
    }));
  };

  const removeRoom = (roomIndex) => {
    setFormData(prev => ({
      ...prev,
      rooms: (prev.rooms || []).filter((_, index) => index !== roomIndex)
    }));
  };

  const updateRoom = (roomIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      rooms: (prev.rooms || []).map((room, index) => 
        index === roomIndex ? { ...room, [field]: value } : room
      )
    }));
  };

  const handleRoomImageUpload = (roomIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        updateRoom(roomIndex, 'imgPreview', e.target.result);
        updateRoom(roomIndex, 'imgUrl', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAmenityChange = (roomIndex, amenityId, checked) => {
    setFormData(prev => ({
      ...prev,
      rooms: (prev.rooms || []).map((room, index) => {
        if (index === roomIndex) {
          let updatedAmenities = [...(room.amenities || [])];
          if (checked) {
            if (!updatedAmenities.includes(amenityId)) {
              updatedAmenities.push(amenityId);
            }
          } else {
            updatedAmenities = updatedAmenities.filter(id => id !== amenityId);
          }
          return { ...room, amenities: updatedAmenities };
        }
        return room;
      })
    }));
  };

  const handleBedTypeChange = (roomIndex, bedTypeId, checked) => {
    setFormData(prev => ({
      ...prev,
      rooms: (prev.rooms || []).map((room, index) => {
        if (index === roomIndex) {
          let updatedBeds = [...(room.roomBeds || [])];
          if (checked) {
            if (!updatedBeds.includes(bedTypeId)) {
              updatedBeds.push(bedTypeId);
            }
          } else {
            updatedBeds = updatedBeds.filter(id => id !== bedTypeId);
          }
          return { ...room, roomBeds: updatedBeds };
        }
        return room;
      })
    }));
  };

  const updateBedQuantity = (roomIndex, bedTypeId, quantity) => {
    setFormData(prev => ({
      ...prev,
      rooms: (prev.rooms || []).map((room, index) => {
        if (index === roomIndex) {
          const updatedBeds = [...(room.roomBeds || [])];
          const existingBedIndex = updatedBeds.findIndex(bed => bed.bedTypeId === bedTypeId);
          
          if (existingBedIndex !== -1) {
            if (quantity > 0) {
              updatedBeds[existingBedIndex] = { ...updatedBeds[existingBedIndex], quantity };
            } else {
              updatedBeds.splice(existingBedIndex, 1);
            }
          } else if (quantity > 0) {
            updatedBeds.push({ bedTypeId, quantity });
          }
          
          return { ...room, roomBeds: updatedBeds };
        }
        return room;
      })
    }));
  };

  const handleNext = () => {
    if (validateForm()) {
      onChange(formData);
      onNext();
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onChange(formData);
      onSubmit();
    }
  };

  const rooms = formData.rooms || [];

  return (
    <div className={styles.roomsCreationContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>
          <i className="bi bi-door-open me-2"></i>
          Tạo phòng
        </h3>
        <p className={styles.stepDescription}>
          Tạo danh sách phòng cho homestay của bạn
        </p>
      </div>

      <div className={styles.roomsForm}>
        {/* Add Room Button */}
        <div className={styles.addRoomSection}>
          <button
            type="button"
            className="btn btn-success"
            onClick={addRoom}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Thêm phòng mới
          </button>
        </div>

        {errors.rooms && (
          <div className="alert alert-danger">
            {errors.rooms}
          </div>
        )}

        {/* Rooms List */}
        {rooms.map((room, roomIndex) => (
          <div key={room.id} className={styles.roomCard}>
            <div className={styles.roomHeader}>
              <h5 className={styles.roomTitle}>
                Phòng {roomIndex + 1}
              </h5>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeRoom(roomIndex)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>

            <div className="row g-3">
              {/* Basic Information */}
              <div className="col-md-6">
                <label className="form-label">
                  Tên phòng <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors[`room_${roomIndex}`]?.name ? 'is-invalid' : ''}`}
                  value={room.name || ''}
                  onChange={(e) => updateRoom(roomIndex, 'name', e.target.value)}
                  placeholder="VD: Phòng Deluxe Ocean View"
                />
                {errors[`room_${roomIndex}`]?.name && (
                  <div className="invalid-feedback">{errors[`room_${roomIndex}`].name}</div>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Sức chứa <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors[`room_${roomIndex}`]?.capacity ? 'is-invalid' : ''}`}
                  value={room.capacity || 1}
                  onChange={(e) => updateRoom(roomIndex, 'capacity', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
                {errors[`room_${roomIndex}`]?.capacity && (
                  <div className="invalid-feedback">{errors[`room_${roomIndex}`].capacity}</div>
                )}
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Giá/đêm (VNĐ) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors[`room_${roomIndex}`]?.price ? 'is-invalid' : ''}`}
                  value={room.price || ''}
                  onChange={(e) => updateRoom(roomIndex, 'price', parseInt(e.target.value))}
                  min="0"
                  placeholder="500000"
                />
                {errors[`room_${roomIndex}`]?.price && (
                  <div className="invalid-feedback">{errors[`room_${roomIndex}`].price}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Diện tích (m²) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors[`room_${roomIndex}`]?.size ? 'is-invalid' : ''}`}
                  value={room.size || ''}
                  onChange={(e) => updateRoom(roomIndex, 'size', parseInt(e.target.value))}
                  min="0"
                  placeholder="25"
                />
                {errors[`room_${roomIndex}`]?.size && (
                  <div className="invalid-feedback">{errors[`room_${roomIndex}`].size}</div>
                )}
              </div>

              {/* Room Image */}
              <div className="col-12">
                <label className="form-label">
                  Ảnh phòng <span className="text-danger">*</span>
                </label>
                <div className={styles.imageUploadContainer}>
                  <input
                    type="file"
                    className={`form-control ${errors[`room_${roomIndex}`]?.imgUrl ? 'is-invalid' : ''}`}
                    accept="image/*"
                    onChange={(e) => handleRoomImageUpload(roomIndex, e)}
                    style={{ display: 'none' }}
                    id={`room-image-${roomIndex}`}
                  />
                  
                  <div className={styles.uploadArea}>
                    {room.imgPreview ? (
                      <div className={styles.imagePreview}>
                        <img src={room.imgPreview} alt={`Room ${roomIndex + 1}`} />
                        <button
                          type="button"
                          className={styles.removeImage}
                          onClick={() => {
                            updateRoom(roomIndex, 'imgPreview', null);
                            updateRoom(roomIndex, 'imgUrl', '');
                          }}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </div>
                    ) : (
                      <label htmlFor={`room-image-${roomIndex}`} className={styles.uploadLabel}>
                        <i className="bi bi-cloud-upload"></i>
                        <span>Tải lên ảnh phòng</span>
                        <small>JPG, PNG, GIF (tối đa 5MB)</small>
                      </label>
                    )}
                  </div>
                  {errors[`room_${roomIndex}`]?.imgUrl && (
                    <div className="invalid-feedback d-block">{errors[`room_${roomIndex}`].imgUrl}</div>
                  )}
                </div>
              </div>

              {/* Bed Types with Quantity */}
              <div className="col-12">
                <label className="form-label">
                  Loại giường <span className="text-danger">*</span>
                </label>
                <div className={styles.bedTypesContainer}>
                  {bedTypes.map(bedType => {
                    const selectedBed = (room.roomBeds || []).find(bed => bed.bedTypeId === bedType.id);
                    const quantity = selectedBed ? selectedBed.quantity : 0;
                    
                    return (
                      <div key={bedType.id} className={styles.bedTypeItem}>
                        <div className={styles.bedTypeHeader}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`bed-${roomIndex}-${bedType.id}`}
                              checked={quantity > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateBedQuantity(roomIndex, bedType.id, 1);
                                } else {
                                  updateBedQuantity(roomIndex, bedType.id, 0);
                                }
                              }}
                            />
                            <label className="form-check-label" htmlFor={`bed-${roomIndex}-${bedType.id}`}>
                              {bedType.name}
                            </label>
                          </div>
                        </div>
                        
                        {quantity > 0 && (
                          <div className={styles.bedQuantity}>
                            <label className="form-label">Số lượng:</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={quantity}
                              onChange={(e) => updateBedQuantity(roomIndex, bedType.id, parseInt(e.target.value))}
                              min="1"
                              max="10"
                              style={{ width: '80px' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors[`room_${roomIndex}`]?.roomBeds && (
                  <div className="invalid-feedback d-block">{errors[`room_${roomIndex}`].roomBeds}</div>
                )}
              </div>

              {/* Amenities */}
              <div className="col-12">
                <label className="form-label">
                  Tiện nghi phòng
                </label>
                <div className={styles.amenitiesContainer}>
                  {amenities.map(amenity => (
                    <div key={amenity.id} className={styles.amenityItem}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`amenity-${roomIndex}-${amenity.id}`}
                          checked={(room.amenities || []).includes(amenity.id)}
                          onChange={(e) => handleAmenityChange(roomIndex, amenity.id, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`amenity-${roomIndex}-${amenity.id}`}>
                          {amenity.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.formActions}>
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={onPrev}
          disabled={loading}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Quay lại
        </button>
        
        {rooms.length > 0 ? (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang tạo homestay...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Hoàn thành tạo homestay
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                Tiếp theo <i className="bi bi-arrow-right ms-1"></i>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomsCreationStep; 