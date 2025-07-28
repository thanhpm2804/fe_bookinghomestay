import React, { useEffect, useState } from "react";
import { getWards } from "../../../services/locationService";
import styles from "./BasicInformationStep.module.css";

const BasicInformationStep = ({ data, onChange, onNext, onPrev, loading }) => {
  const [wardsData, setWardsData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    homestayType: "",
    streetAddress: "",
    districtId: "",
    districtName: "",
    wardId: "",
    wardName: "",
    province: "Đà Nẵng"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getWards().then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      const cleanData = data.filter(Boolean);
      setWardsData(cleanData);

      // Tách district duy nhất
      const districtMap = {};
      const districtsList = [];
      cleanData.forEach(ward => {
        if (ward.District && !districtMap[ward.District.DistrictId]) {
          districtsList.push({
            id: ward.District.DistrictId,
            name: ward.District.Name
          });
          districtMap[ward.District.DistrictId] = true;
        }
      });
      setDistricts(districtsList);
    });
  }, []);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  useEffect(() => {
    if (formData.districtId) {
      setWards(
        wardsData
          .filter(w => w.DistrictId === Number(formData.districtId))
          .map(w => ({ id: w.WardId, name: w.Name }))
      );
    } else {
      setWards([]);
    }
  }, [formData.districtId, wardsData]);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return !value ? "Tên homestay không được để trống" : "";
      case "homestayType":
        return !value ? "Vui lòng chọn loại homestay" : "";
      case "streetAddress":
        return !value ? "Địa chỉ đường không được để trống" : "";
      case "districtId":
        return !value ? "Vui lòng chọn quận/huyện" : "";
      case "wardId":
        return !value ? "Vui lòng chọn phường/xã" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let update = { [name]: value };

    if (name === "districtId") {
      const district = districts.find(d => d.id === Number(value));
      update = {
        ...update,
        districtName: district ? district.name : "",
        wardId: "",
        wardName: ""
      };
    }
    if (name === "wardId") {
      const ward = wards.find(w => w.id === Number(value));
      update = {
        ...update,
        wardName: ward ? ward.name : ""
      };
    }

    setFormData(prev => ({
      ...prev,
      ...update
    }));

    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
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
      onChange(formData);
      onNext();
    }
  };

  return (
    <div className={styles.basicInfoContainer}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>
          <i className="bi bi-house-door me-2"></i>
          Thông tin cơ bản Homestay
        </h3>
        <p className={styles.stepDescription}>
          Vui lòng nhập thông tin cơ bản về homestay của bạn
        </p>
      </div>
      <form className={styles.basicForm}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Tên homestay <span className="text-danger">*</span></label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Nhập tên homestay"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Loại homestay <span className="text-danger">*</span></label>
            <select
              className={`form-select ${errors.homestayType ? "is-invalid" : ""}`}
              name="homestayType"
              value={formData.homestayType}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Chọn loại homestay</option>
              <option value="1">Apartment</option>
              <option value="2">House</option>
            </select>
            {errors.homestayType && <div className="invalid-feedback">{errors.homestayType}</div>}
          </div>
          <div className="col-12">
            <label className="form-label">Địa chỉ đường <span className="text-danger">*</span></label>
            <input
              type="text"
              className={`form-control ${errors.streetAddress ? "is-invalid" : ""}`}
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Nhập địa chỉ đường"
            />
            {errors.streetAddress && <div className="invalid-feedback">{errors.streetAddress}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Quận/Huyện <span className="text-danger">*</span></label>
            <select
              className={`form-select ${errors.districtId ? "is-invalid" : ""}`}
              name="districtId"
              value={formData.districtId}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.districtId && <div className="invalid-feedback">{errors.districtId}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Phường/Xã <span className="text-danger">*</span></label>
            <select
              className={`form-select ${errors.wardId ? "is-invalid" : ""}`}
              name="wardId"
              value={formData.wardId}
              onChange={handleInputChange}
              disabled={!formData.districtId || loading}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.wardId && <div className="invalid-feedback">{errors.wardId}</div>}
          </div>
          <div className="col-12">
            <label className="form-label">Tỉnh/Thành phố</label>
            <input
              type="text"
              className="form-control"
              name="province"
              value={formData.province}
              disabled
            />
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="button" className="btn btn-secondary me-2" onClick={onPrev} disabled={loading}>
            <i className="bi bi-arrow-left me-1"></i>
            Quay lại
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext} disabled={loading}>
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