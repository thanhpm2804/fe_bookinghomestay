import React, { useState, useEffect } from 'react';
import styles from './OwnerInformationStep.module.css';

const OwnerInformationStep = ({ data, onChange, onNext, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    avatarUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (data) {
      setFormData(data);
      if (data.avatarUrl && data.avatarPreview) {
        setImagePreview(data.avatarPreview);
      }
    }
  }, [data]);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return value.length === 0 ? 'Họ không được để trống' : 
               value.length > 50 ? 'Họ không được quá 50 ký tự' : '';
      case 'lastName':
        return value.length === 0 ? 'Tên không được để trống' : 
               value.length > 50 ? 'Tên không được quá 50 ký tự' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return value.length === 0 ? 'Email không được để trống' : 
               !emailRegex.test(value) ? 'Email không đúng định dạng' : '';
      case 'phoneNumber':
        const phoneRegex = /^[0-9]{10,11}$/;
        return value.length === 0 ? 'Số điện thoại không được để trống' : 
               !phoneRegex.test(value) ? 'Số điện thoại phải có 10-11 chữ số' : '';
      case 'gender':
        return value.length === 0 ? 'Vui lòng chọn giới tính' : '';
      case 'dateOfBirth':
        if (value.length === 0) return 'Ngày sinh không được để trống';
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return age < 18 ? 'Bạn phải từ 18 tuổi trở lên' : 
               age > 100 ? 'Ngày sinh không hợp lệ' : '';
      case 'address':
        return value.length === 0 ? 'Địa chỉ không được để trống' : 
               value.length < 10 ? 'Địa chỉ phải có ít nhất 10 ký tự' : 
               value.length > 200 ? 'Địa chỉ không được quá 200 ký tự' : '';
      case 'avatarUrl':
        return value.length === 0 ? 'Vui lòng tải lên ảnh đại diện' : '';
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          avatarUrl: 'Vui lòng chọn file ảnh'
        }));
        return;
      }
      
      // Validate file size (max 2MB for portrait)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatarUrl: 'Kích thước file không được quá 2MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          avatarUrl: file.name,
          avatarPreview: e.target.result
        }));
        setErrors(prev => ({
          ...prev,
          avatarUrl: ''
        }));
      };
      reader.readAsDataURL(file);
    }
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
      onChange(formData);
      onNext();
    }
  };

  return (
    <div className={styles.ownerInfoContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>
          <i className="bi bi-person-circle me-2"></i>
          Thông tin chủ homestay
        </h3>
        <p className={styles.stepDescription}>
          Vui lòng cung cấp thông tin cá nhân của bạn
        </p>
      </div>

      <form className={styles.ownerForm}>
        <div className="row g-3">
          {/* Họ và Tên */}
          <div className="col-md-6">
            <label htmlFor="firstName" className="form-label">
              Họ <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Nhập họ của bạn"
              maxLength={50}
            />
            {errors.firstName && (
              <div className="invalid-feedback">{errors.firstName}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="lastName" className="form-label">
              Tên <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Nhập tên của bạn"
              maxLength={50}
            />
            {errors.lastName && (
              <div className="invalid-feedback">{errors.lastName}</div>
            )}
          </div>

          {/* Email và Số điện thoại */}
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="phoneNumber" className="form-label">
              Số điện thoại <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="0123456789"
              maxLength={11}
            />
            {errors.phoneNumber && (
              <div className="invalid-feedback">{errors.phoneNumber}</div>
            )}
          </div>

          {/* Giới tính và Ngày sinh */}
          <div className="col-md-6">
            <label htmlFor="gender" className="form-label">
              Giới tính <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </select>
            {errors.gender && (
              <div className="invalid-feedback">{errors.gender}</div>
            )}
          </div>

          <div className="col-md-6">
            <label htmlFor="dateOfBirth" className="form-label">
              Ngày sinh <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dateOfBirth && (
              <div className="invalid-feedback">{errors.dateOfBirth}</div>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="col-12">
            <label htmlFor="address" className="form-label">
              Địa chỉ <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ chi tiết"
              rows="3"
              maxLength={200}
            ></textarea>
            {errors.address && (
              <div className="invalid-feedback">{errors.address}</div>
            )}
          </div>

          {/* Upload ảnh đại diện - Portrait size */}
          <div className="col-12">
            <label htmlFor="avatarUrl" className="form-label">
              Ảnh đại diện <span className="text-danger">*</span>
            </label>
            <div className={styles.avatarUploadContainer}>
              <input
                type="file"
                className={`form-control ${errors.avatarUrl ? 'is-invalid' : ''}`}
                id="avatarUrl"
                name="avatarUrl"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              
              <div className={styles.avatarUploadArea}>
                {imagePreview ? (
                  <div className={styles.avatarPreview}>
                    <img src={imagePreview} alt="Avatar Preview" />
                    <button
                      type="button"
                      className={styles.removeAvatar}
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ 
                          ...prev, 
                          avatarUrl: '',
                          avatarPreview: null 
                        }));
                        setErrors(prev => ({ ...prev, avatarUrl: '' }));
                      }}
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  </div>
                ) : (
                  <label htmlFor="avatarUrl" className={styles.avatarUploadLabel}>
                    <i className="bi bi-person-circle"></i>
                    <span>Tải lên ảnh đại diện</span>
                    <small>JPG, PNG, GIF (tối đa 2MB)</small>
                  </label>
                )}
              </div>
              {errors.avatarUrl && (
                <div className="invalid-feedback d-block">{errors.avatarUrl}</div>
              )}
            </div>
          </div>
        </div>

        {/* Nút điều hướng */}
        <div className={styles.formActions}>
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

export default OwnerInformationStep;
