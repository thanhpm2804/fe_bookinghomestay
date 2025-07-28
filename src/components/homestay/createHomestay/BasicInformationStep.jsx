import React, { useState, useEffect } from 'react';
import styles from './BasicInformationStep.module.css';

const BasicInformationStep = ({ data, onChange, onNext, onPrev, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    homestayType: '',
    streetAddress: '',
    wardId: '', // Thêm wardId
    wardName: '',
    districtId: '', // Thêm districtId
    districtName: '',
    province: 'Đà Nẵng'
  });
  const [errors, setErrors] = useState({});
  const [homestayTypes, setHomestayTypes] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchHomestayTypes();
    fetchDistricts();
  }, [data]);

  const fetchHomestayTypes = async () => {
    try {
      // TODO: Replace with actual API call
      const types = [
        { id: 1, name: 'Homestay' },
        { id: 2, name: 'Villa' },
        { id: 3, name: 'Cottage' },
        { id: 4, name: 'Apartment' },
        { id: 5, name: 'Guesthouse' }
      ];
      setHomestayTypes(types);
    } catch (error) {
      console.error('Error fetching homestay types:', error);
    }
  };

  const fetchDistricts = async () => {
    try {
      // TODO: Replace with actual API call
      const districtsData = [
        { id: 1, name: 'Hải Châu' },
        { id: 2, name: 'Thanh Khê' },
        { id: 3, name: 'Sơn Trà' },
        { id: 4, name: 'Ngũ Hành Sơn' },
        { id: 5, name: 'Liên Chiểu' },
        { id: 6, name: 'Cẩm Lệ' },
        { id: 7, name: 'Hòa Vang' }
      ];
      setDistricts(districtsData);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchWards = async (districtId) => {
    try {
      // TODO: Replace with actual API call based on selected district
      const wardsData = {
        1: [ // Hải Châu
          { id: 1, name: 'Phường Bình Thuận' },
          { id: 2, name: 'Phường Hải Châu I' },
          { id: 3, name: 'Phường Hải Châu II' },
          { id: 4, name: 'Phường Nam Dương' },
          { id: 5, name: 'Phường Phước Ninh' },
          { id: 6, name: 'Phường Thạch Thang' },
          { id: 7, name: 'Phường Thuận Phước' }
        ],
        2: [ // Thanh Khê
          { id: 8, name: 'Phường An Khê' },
          { id: 9, name: 'Phường Chính Gián' },
          { id: 10, name: 'Phường Hòa Khê' },
          { id: 11, name: 'Phường Tam Thuận' },
          { id: 12, name: 'Phường Tân Chính' },
          { id: 13, name: 'Phường Thạc Gián' },
          { id: 14, name: 'Phường Thanh Khê Đông' },
          { id: 15, name: 'Phường Thanh Khê Tây' },
          { id: 16, name: 'Phường Vĩnh Trung' },
          { id: 17, name: 'Phường Xuân Hà' }
        ],
        3: [ // Sơn Trà
          { id: 18, name: 'Phường An Hải Bắc' },
          { id: 19, name: 'Phường An Hải Đông' },
          { id: 20, name: 'Phường An Hải Nam' },
          { id: 21, name: 'Phường Mân Thái' },
          { id: 22, name: 'Phường Nại Hiên Đông' },
          { id: 23, name: 'Phường Phước Mỹ' },
          { id: 24, name: 'Phường Thọ Quang' }
        ],
        4: [ // Ngũ Hành Sơn
          { id: 25, name: 'Phường Hòa Hải' },
          { id: 26, name: 'Phường Hòa Quý' },
          { id: 27, name: 'Phường Khuê Mỹ' },
          { id: 28, name: 'Phường Mỹ An' }
        ],
        5: [ // Liên Chiểu
          { id: 29, name: 'Phường Hòa Hiệp Bắc' },
          { id: 30, name: 'Phường Hòa Hiệp Nam' },
          { id: 31, name: 'Phường Hòa Khánh Bắc' },
          { id: 32, name: 'Phường Hòa Khánh Nam' },
          { id: 33, name: 'Phường Hòa Minh' }
        ],
        6: [ // Cẩm Lệ
          { id: 34, name: 'Phường Hòa An' },
          { id: 35, name: 'Phường Hòa Phát' },
          { id: 36, name: 'Phường Hòa Thọ Đông' },
          { id: 37, name: 'Phường Hòa Thọ Tây' },
          { id: 38, name: 'Phường Khuê Trung' }
        ],
        7: [ // Hòa Vang
          { id: 39, name: 'Xã Hòa Bắc' },
          { id: 40, name: 'Xã Hòa Châu' },
          { id: 41, name: 'Xã Hòa Khương' },
          { id: 42, name: 'Xã Hòa Liên' },
          { id: 43, name: 'Xã Hòa Ninh' },
          { id: 44, name: 'Xã Hòa Nhơn' },
          { id: 45, name: 'Xã Hòa Phong' },
          { id: 46, name: 'Xã Hòa Phú' },
          { id: 47, name: 'Xã Hòa Phước' },
          { id: 48, name: 'Xã Hòa Sơn' },
          { id: 49, name: 'Xã Hòa Tiến' }
        ]
      };
      
      const selectedWards = wardsData[districtId] || [];
      setWards(selectedWards);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.length === 0 ? 'Tên homestay không được để trống' : '';
      case 'homestayType':
        return value.length === 0 ? 'Vui lòng chọn loại homestay' : '';
      case 'streetAddress':
        return value.length === 0 ? 'Địa chỉ đường không được để trống' : '';
      case 'wardName':
        return value.length === 0 ? 'Vui lòng chọn phường/xã' : '';
      case 'district':
        return value.length === 0 ? 'Vui lòng chọn quận/huyện' : '';
      case 'province':
        return value.length === 0 ? 'Tỉnh/Thành phố không được để trống' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'district') {
      // Tìm district object để lấy cả ID và tên
      const selectedDistrict = districts.find(d => d.name === value);
      setFormData(prev => ({
        ...prev,
        districtId: selectedDistrict ? selectedDistrict.id : '',
        districtName: value,
        wardId: '', // Reset ward khi đổi district
        wardName: ''
      }));
      
      if (selectedDistrict) {
        fetchWards(selectedDistrict.id);
      } else {
        setWards([]);
      }
    } else if (name === 'wardName') {
      // Tìm ward object để lấy cả ID và tên
      const selectedWard = wards.find(w => w.name === value);
      setFormData(prev => ({
        ...prev,
        wardId: selectedWard ? selectedWard.id : '',
        wardName: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const isFormValid = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (isFormValid()) {
      console.log('=== DỮ LIỆU BASIC INFORMATION ===');
      console.log('Form Data:', formData);
      console.log('District ID:', formData.districtId);
      console.log('District Name:', formData.districtName);
      console.log('Ward ID:', formData.wardId);
      console.log('Ward Name:', formData.wardName);
      
      onChange(formData);
      onNext();
    }
  };

  return (
    <div className={styles.basicInfoContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>
          <i className="bi bi-house-door me-2"></i>
          Thông tin cơ bản homestay
        </h3>
        <p className={styles.stepDescription}>
          Cung cấp thông tin cơ bản về homestay của bạn
        </p>
      </div>

      <form className={styles.basicForm}>
        <div className="row g-3">
          {/* Tên homestay và Loại homestay */}
          <div className="col-md-6">
            <label htmlFor="name" className="form-label">
              Tên homestay <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên homestay"
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="homestayType" className="form-label">
              Loại homestay <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.homestayType ? 'is-invalid' : ''}`}
              id="homestayType"
              name="homestayType"
              value={formData.homestayType}
              onChange={handleInputChange}
            >
              <option value="">Chọn loại homestay</option>
              {homestayTypes.map(type => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.homestayType && (
              <div className="invalid-feedback">{errors.homestayType}</div>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="col-12">
            <label htmlFor="streetAddress" className="form-label">
              Địa chỉ đường <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.streetAddress ? 'is-invalid' : ''}`}
              id="streetAddress"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              placeholder="Số nhà, tên đường"
            />
            {errors.streetAddress && (
              <div className="invalid-feedback">{errors.streetAddress}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="district" className="form-label">
              Quận/Huyện <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.district ? 'is-invalid' : ''}`}
              id="district"
              name="district"
              value={formData.districtName}
              onChange={handleInputChange}
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map(district => (
                <option key={district.id} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
            {errors.district && (
              <div className="invalid-feedback">{errors.district}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="wardName" className="form-label">
              Phường/Xã <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.wardName ? 'is-invalid' : ''}`}
              id="wardName"
              name="wardName"
              value={formData.wardName}
              onChange={handleInputChange}
              disabled={!formData.districtName}
            >
              <option value="">
                {formData.districtName ? 'Chọn phường/xã' : 'Vui lòng chọn quận/huyện trước'}
              </option>
              {wards.map(ward => (
                <option key={ward.id} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </select>
            {errors.wardName && (
              <div className="invalid-feedback">{errors.wardName}</div>
            )}
          </div>

          <div className="col-12">
            <label htmlFor="province" className="form-label">
              Tỉnh/Thành phố <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="province"
              name="province"
              value={formData.province}
              disabled
              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
            />
            <div className="form-text">
              Mặc định: Đà Nẵng
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

export default BasicInformationStep; 