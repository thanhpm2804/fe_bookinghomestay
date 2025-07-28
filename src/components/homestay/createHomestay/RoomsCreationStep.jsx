import React, { useState, useEffect } from 'react';
import styles from './RoomsCreationStep.module.css';
import { getBedRooms } from "../../../services/locationService";

const RoomsCreationStep = ({
  data = [],
  onChange,
  onNext,
  onPrev,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    rooms: Array.isArray(data) ? data : []
  });
  const [errors, setErrors] = useState({});
  const [bedTypes, setBedTypes] = useState([]);

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
    setFormData(prev => ({
      ...prev,
      rooms: Array.isArray(data) ? data : []
    }));
  }, [data]);

  useEffect(() => {
    getBedRooms().then(res => {
      if (res.value) {
        setBedTypes(
          res.value.map(bed => ({
            bedTypeId: bed.BedTypeId,
            name: bed.Name
          }))
        );
      }
    });
  }, []);

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

    if (!room.imgFile) {
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
      imgFile: null,
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
      if (!file.type.startsWith('image/')) {
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        updateRoom(roomIndex, 'imgPreview', e.target.result);
        updateRoom(roomIndex, 'imgUrl', file.name);
        updateRoom(roomIndex, 'imgFile', file);
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

  const updateBedQuantity = (roomIndex, bedTypeId, quantity) => {
    setFormData(prev => ({
      ...prev,
      rooms: (Array.isArray(prev.rooms) ? prev.rooms : []).map((room, index) => {
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
      onChange({ rooms: formData.rooms });
      onNext();
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Rooms data before submit:', formData.rooms);
      
      // First update the parent component with the latest room data
      onChange({ rooms: formData.rooms });
      
      // Then prepare FormData for submission
      const submitData = new FormData();
      
      // Stringify the room data and add to FormData
      submitData.append('homestayData', JSON.stringify({ 
        rooms: formData.rooms.map(room => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          price: room.price,
          size: room.size,
          amenities: room.amenities,
          roomBeds: room.roomBeds,
          imgUrl: room.imgUrl
          // Note: We don't include imgFile or imgPreview in the JSON
        }))
      }));
      
      // Add image files
      formData.rooms.forEach((room, index) => {
        if (room.imgFile) {
          submitData.append(`roomImages[${index}]`, room.imgFile);
        }
      });
      
      console.log('Submitting FormData:', submitData);
      onSubmit(submitData);
    }
  };

  const rooms = Array.isArray(formData.rooms) ? formData.rooms : [];

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

        {rooms.map((room, roomIndex) => (
          <div key={room.id || roomIndex} className={styles.roomCard}>
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
                            updateRoom(roomIndex, 'imgFile', null);
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

              <div className="col-12">
                <label className="form-label">
                  Loại giường <span className="text-danger">*</span>
                </label>
                <div className={styles.bedTypesContainer}>
                  {bedTypes.map(bed => {
                    const bedInfo = formData.rooms[roomIndex].roomBeds.find(b => b.bedTypeId === bed.bedTypeId);
                    const quantity = bedInfo ? bedInfo.quantity : 0;

                    return (
                      <div key={bed.bedTypeId}>
                        <div className={styles.bedTypeHeader}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`bed-${roomIndex}-${bed.bedTypeId}`}
                              checked={quantity > 0}
                              onChange={(e) => {
                                updateBedQuantity(roomIndex, bed.bedTypeId, e.target.checked ? 1 : 0);
                              }}
                            />
                            <label className="form-check-label" htmlFor={`bed-${roomIndex}-${bed.bedTypeId}`}>
                              {bed.name}
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
                              onChange={(e) => updateBedQuantity(roomIndex, bed.bedTypeId, parseInt(e.target.value))}
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