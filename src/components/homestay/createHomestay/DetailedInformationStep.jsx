import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './DetailedInformationStep.module.css';

// Fix Leaflet marker icons for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiMwZDZFRkYiLz4KPHBhdGggZD0iTTEyIDE2QzE0LjIwOTEgMTYgMTYgMTQuMjA5MSAxNiAxMkMxNiA5Ljc5MDg2IDE0LjIwOTEgOCAxMiA4QzkuNzkwODYgOCA4IDkuNzkwODYgOCAxMkM4IDE0LjIwOTEgOS43OTA4NiAxNiAxMiAxNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Map click handler component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
  });
  return null;
};

// Map center handler component
const MapCenterHandler = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
};

const DetailedInformationStep = ({ data, onChange, onNext, onPrev, loading }) => {
  const [formData, setFormData] = useState({
    detailedDescription: '',
    latitude: '',
    longitude: '',
    policies: [],
    rules: '',
    amenities: [],
    neighbourhoods: [],
    mainImages: [] // Thêm field cho ảnh homestay
  });
  const [errors, setErrors] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([16.0475, 108.2062]); // Đà Nẵng

  // Data mẫu cho policies và amenities
  const [availablePolicies] = useState([
    { id: 1, name: 'Pets allowed', label: 'Cho phép thú cưng', isAllowed: false },
    { id: 2, name: 'Smoking allowed', label: 'Cho phép hút thuốc', isAllowed: false },
    { id: 3, name: 'Parties allowed', label: 'Cho phép tiệc tùng', isAllowed: false },
    { id: 4, name: 'Children allowed', label: 'Cho phép trẻ em', isAllowed: false },
    { id: 5, name: 'Events allowed', label: 'Cho phép sự kiện', isAllowed: false }
  ]);

  const [availableAmenities] = useState([
    { id: 1, name: 'WiFi' },
    { id: 2, name: 'Air Conditioning' },
    { id: 3, name: 'Kitchen' },
    { id: 4, name: 'Washing Machine' },
    { id: 5, name: 'Free Parking' },
    { id: 6, name: 'Swimming Pool' },
    { id: 7, name: 'Garden' },
    { id: 8, name: 'Balcony' },
    { id: 9, name: 'Terrace' },
    { id: 10, name: 'BBQ Facilities' },
    { id: 11, name: 'Bicycle Rental' },
    { id: 12, name: 'Airport Shuttle' }
  ]);

  const [availableNeighbourhoods] = useState([
    { id: 1, name: 'Bãi biển Mỹ Khê' },
    { id: 2, name: 'Bãi biển Non Nước' },
    { id: 3, name: 'Bán đảo Sơn Trà' },
    { id: 4, name: 'Núi Ngũ Hành Sơn' },
    { id: 5, name: 'Sông Hàn' },
    { id: 6, name: 'Cầu Rồng' },
    { id: 7, name: 'Chợ Hàn' },
    { id: 8, name: 'Phố cổ Hội An' },
    { id: 9, name: 'Bánh mì Phượng' },
    { id: 10, name: 'Cà phê Trung Nguyên' }
  ]);

  useEffect(() => {
    if (data) {
      setFormData({
        detailedDescription: data.detailedDescription || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        policies: data.policies || [],
        rules: data.rules || '',
        amenities: data.amenities || [],
        neighbourhoods: data.neighbourhoods || [],
        mainImages: data.mainImages || []
      });
      
      if (data.latitude && data.longitude) {
        const location = {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude)
        };
        setSelectedLocation(location);
        setMapCenter([location.lat, location.lng]);
      }
    }
  }, [data]);

  // Search function using Nominatim API
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchLocation(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setSelectedLocation({ lat, lng });
    setMapCenter([lat, lng]);
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
    
    setSearchQuery(result.display_name);
    setSearchResults([]);
    
    setErrors(prev => ({
      ...prev,
      latitude: '',
      longitude: ''
    }));
  };

  // Handle homestay images upload
  const handleHomestayImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate number of images
    if (formData.mainImages.length + files.length > 10) {
      setErrors(prev => ({
        ...prev,
        mainImages: 'Không được tải quá 10 ảnh'
      }));
      return;
    }

    const validFiles = files.filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return false;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      
      return true;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        mainImages: 'Một số file không hợp lệ. Vui lòng chọn file ảnh dưới 5MB'
      }));
      return;
    }

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          mainImages: [...prev.mainImages, {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name
          }]
        }));
      };
      reader.readAsDataURL(file);
    });

    setErrors(prev => ({
      ...prev,
      mainImages: ''
    }));
  };

  const removeHomestayImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      mainImages: prev.mainImages.filter(img => img.id !== imageId)
    }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'detailedDescription':
        return value.length === 0 ? 'Mô tả chi tiết không được để trống' : 
               value.length < 50 ? 'Mô tả chi tiết phải có ít nhất 50 ký tự' : '';
      case 'latitude':
        return value.length === 0 ? 'Vui lòng chọn vị trí trên bản đồ' : '';
      case 'longitude':
        return value.length === 0 ? 'Vui lòng chọn vị trí trên bản đồ' : '';
      case 'policies':
        return value.length === 0 ? 'Vui lòng chọn ít nhất một chính sách' : '';
      case 'amenities':
        return value.length === 0 ? 'Vui lòng chọn ít nhất một tiện nghi' : '';
      case 'mainImages':
        return value.length < 3 ? 'Vui lòng tải lên ít nhất 3 ảnh' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handlePolicyChange = (policyId, isAllowed) => {
    setFormData(prev => {
      const updatedPolicies = prev.policies.filter(p => p.id !== policyId);
      if (isAllowed) {
        updatedPolicies.push({ id: policyId, isAllowed: true });
      }
      return { ...prev, policies: updatedPolicies };
    });
  };

  const handlePolicyAllowedChange = (policyId, isAllowed) => {
    setFormData(prev => {
      const updatedPolicies = prev.policies.map(p => 
        p.policyId === policyId ? { ...p, isAllowed } : p
      );
      return { ...prev, policies: updatedPolicies };
    });
  };

  const handleAmenityChange = (amenityId, checked) => {
    setFormData(prev => {
      let updatedAmenities = [...(prev.amenities || [])];
      if (checked) {
        if (!updatedAmenities.includes(amenityId)) {
          updatedAmenities.push(amenityId);
        }
      } else {
        updatedAmenities = updatedAmenities.filter(id => id !== amenityId);
      }
      return { ...prev, amenities: updatedAmenities };
    });
  };

  const handleNeighbourhoodChange = (neighbourhoodId, checked) => {
    setFormData(prev => {
      let updatedNeighbourhoods = [...(prev.neighbourhoods || [])];
      if (checked) {
        if (!updatedNeighbourhoods.includes(neighbourhoodId)) {
          updatedNeighbourhoods.push(neighbourhoodId);
        }
      } else {
        updatedNeighbourhoods = updatedNeighbourhoods.filter(id => id !== neighbourhoodId);
      }
      return { ...prev, neighbourhoods: updatedNeighbourhoods };
    });
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    
    setSelectedLocation({ lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
    
    setErrors(prev => ({
      ...prev,
      latitude: '',
      longitude: ''
    }));
  };

  const isFormValid = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'rules' && key !== 'neighbourhoods') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (isFormValid()) {
      onChange(formData);
      onNext();
    }
  };

  return (
    <div className={styles.detailedInfoContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>
          <i className="bi bi-gear me-2"></i>
          Thông tin chi tiết
        </h3>
        <p className={styles.stepDescription}>
          Cung cấp thông tin chi tiết và cấu hình homestay
        </p>
      </div>

      <form className={styles.detailedForm}>
        <div className="row g-3">
          {/* Mô tả chi tiết */}
          <div className="col-12">
            <label htmlFor="detailedDescription" className="form-label">
              Mô tả chi tiết <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.detailedDescription ? 'is-invalid' : ''}`}
              id="detailedDescription"
              name="detailedDescription"
              value={formData.detailedDescription}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết về homestay, tiện nghi, dịch vụ..."
              rows="6"
              minLength={50}
            ></textarea>
            <div className="form-text">
              Tối thiểu 50 ký tự
            </div>
            {errors.detailedDescription && (
              <div className="invalid-feedback">{errors.detailedDescription}</div>
            )}
          </div>

          {/* Homestay Images */}
          <div className="col-12">
            <label className="form-label">
              Ảnh homestay <span className="text-danger">*</span>
            </label>
            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                className={`form-control ${errors.mainImages ? 'is-invalid' : ''}`}
                accept="image/*"
                multiple
                onChange={handleHomestayImageUpload}
                style={{ display: 'none' }}
                id="homestay-images"
              />
              
              <div className={styles.uploadArea}>
                <label htmlFor="homestay-images" className={styles.uploadLabel}>
                  <i className="bi bi-images"></i>
                  <span>Tải lên ảnh homestay</span>
                  <small>3-10 ảnh, mỗi ảnh tối đa 5MB</small>
                </label>
              </div>

              {/* Image previews */}
              {formData.mainImages.length > 0 && (
                <div className={styles.imagePreviews}>
                  <h6 className={styles.previewTitle}>
                    Ảnh đã tải ({formData.mainImages.length}/10)
                  </h6>
                  <div className={styles.previewGrid}>
                    {formData.mainImages.map((image, index) => (
                      <div key={image.id} className={styles.previewItem}>
                        <img src={image.preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className={styles.removeImage}
                          onClick={() => removeHomestayImage(image.id)}
                          title="Xóa ảnh"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                        <span className={styles.imageName}>{image.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.mainImages && (
                <div className="invalid-feedback d-block">{errors.mainImages}</div>
              )}
            </div>
          </div>

          {/* Map Picker with Search */}
          <div className="col-12">
            <label className="form-label">
              Vị trí trên bản đồ <span className="text-danger">*</span>
            </label>
            
            {/* Search Box */}
            <div className={styles.searchContainer}>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm địa chỉ (VD: Bãi biển Mỹ Khê, Đà Nẵng)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <span className="input-group-text">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </span>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className={styles.searchResultItem}
                      onClick={() => handleSearchSelect(result)}
                    >
                      <i className="bi bi-geo-alt me-2"></i>
                      <div>
                        <div className={styles.resultTitle}>{result.display_name.split(',')[0]}</div>
                        <div className={styles.resultSubtitle}>{result.display_name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.mapContainer}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                className={styles.map}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                <MapCenterHandler center={mapCenter} />
                {selectedLocation && (
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    icon={customIcon}
                  />
                )}
              </MapContainer>
              <div className={styles.mapInstructions}>
                <i className="bi bi-info-circle me-2"></i>
                Tìm kiếm địa chỉ hoặc click vào bản đồ để chọn vị trí homestay
                {selectedLocation && (
                  <div className={styles.selectedLocationInfo}>
                    <strong>Vị trí đã chọn:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                )}
              </div>
              {(errors.latitude || errors.longitude) && (
                <div className="invalid-feedback d-block">
                  {errors.latitude || errors.longitude}
                </div>
              )}
            </div>
          </div>

          {/* Policies */}
          <div className="col-12">
            <label className="form-label">
              Chính sách <span className="text-danger">*</span>
            </label>
            <div className={styles.policiesContainer}>
              {availablePolicies.map(policy => {
                const isSelected = formData.policies.some(p => p.id === policy.id);
                const selectedPolicy = formData.policies.find(p => p.id === policy.id);
                
                return (
                  <div key={policy.id} className={styles.policyItem}>
                    <div className={styles.policyHeader}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`policy-${policy.id}`}
                          checked={isSelected}
                          onChange={(e) => handlePolicyChange(policy.id, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`policy-${policy.id}`}>
                          {policy.label}
                        </label>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className={styles.policySettings}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`policy-allowed-${policy.id}`}
                            checked={selectedPolicy?.isAllowed || false}
                            onChange={(e) => handlePolicyAllowedChange(policy.id, e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor={`policy-allowed-${policy.id}`}>
                            {selectedPolicy?.isAllowed ? 'Cho phép' : 'Không cho phép'}
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {errors.policies && (
                <div className="invalid-feedback d-block">{errors.policies}</div>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="col-12">
            <label htmlFor="rules" className="form-label">
              Quy định riêng (tùy chọn)
            </label>
            <textarea
              className="form-control"
              id="rules"
              name="rules"
              value={formData.rules}
              onChange={handleInputChange}
              placeholder="Nhập các quy định riêng của homestay..."
              rows="4"
            ></textarea>
          </div>

          {/* Amenities */}
          <div className="col-12">
            <label className="form-label">
              Tiện nghi <span className="text-danger">*</span>
            </label>
            <div className={styles.amenitiesContainer}>
              {availableAmenities.map(amenity => (
                <div key={amenity.id} className={styles.amenityItem}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`amenity-${amenity.id}`}
                      checked={formData.amenities && formData.amenities.includes(amenity.id)}
                      onChange={(e) => handleAmenityChange(amenity.id, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`amenity-${amenity.id}`}>
                      {amenity.name}
                    </label>
                  </div>
                </div>
              ))}
              {errors.amenities && (
                <div className="invalid-feedback d-block">{errors.amenities}</div>
              )}
            </div>
          </div>

          {/* Neighbourhoods */}
          <div className="col-12">
            <label className="form-label">
              Khu vực lân cận (tùy chọn)
            </label>
            <div className={styles.neighbourhoodsContainer}>
              {availableNeighbourhoods.map(neighbourhood => (
                <div key={neighbourhood.id} className={styles.neighbourhoodItem}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`neighbourhood-${neighbourhood.id}`}
                      checked={formData.neighbourhoods && formData.neighbourhoods.includes(neighbourhood.id)}
                      onChange={(e) => handleNeighbourhoodChange(neighbourhood.id, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`neighbourhood-${neighbourhood.id}`}>
                      {neighbourhood.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nút điều hướng */}
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
        </div>
      </form>
    </div>
  );
};

export default DetailedInformationStep; 