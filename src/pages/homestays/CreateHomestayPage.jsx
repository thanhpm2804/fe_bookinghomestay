import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateHomestayPage.module.css';
import ProgressBar from '../../components/homestay/createHomestay/ProgressBar';
import OwnerInformationStep from '../../components/homestay/createHomestay/OwnerInformationStep';
import BasicInformationStep from '../../components/homestay/createHomestay/BasicInformationStep'
import DetailedInformationStep from '../../components/homestay/createHomestay/DetailedInformationStep';
import RoomsCreationStep from '../../components/homestay/createHomestay/RoomsCreationStep';

const CreateHomestayPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    owner: {},
    basic: {},
    detailed: {},
    rooms: []
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Thông tin chủ homestay', icon: 'bi-person' },
    { id: 2, title: 'Thông tin cơ bản', icon: 'bi-house' },
    { id: 3, title: 'Thông tin chi tiết', icon: 'bi-gear' },
    { id: 4, title: 'Tạo phòng', icon: 'bi-door-open' }
  ];

  const getStepKey = (stepNumber) => {
    const keys = ['owner', 'basic', 'detailed', 'rooms'];
    return keys[stepNumber - 1];
  };

  const handleStepChange = (stepData, stepNumber) => {
    console.log(`=== Step ${stepNumber} Data ===`);
    console.log('Step Data:', stepData);
    console.log('Current Form Data:', formData);
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [getStepKey(stepNumber)]: stepData
      };
      console.log('Updated Form Data:', newFormData);
      return newFormData;
    });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Log tất cả dữ liệu đã điền
      console.log('=== TẤT CẢ DỮ LIỆU ĐÃ ĐIỀN ===');
      console.log('Form Data:', formData);
      
      // Log chi tiết từng phần
      console.log('\n=== THÔNG TIN CHỦ HOMESTAY ===');
      console.log('Owner Information:', formData.owner);
      
      console.log('\n=== THÔNG TIN CƠ BẢN ===');
      console.log('Basic Information:', formData.basic);
      
      console.log('\n=== THÔNG TIN CHI TIẾT ===');
      console.log('Detailed Information:', formData.detailed);
      
      console.log('\n=== DANH SÁCH PHÒNG ===');
      console.log('Rooms:', formData.rooms);
      console.log('Số lượng phòng:', formData.rooms?.length || 0);
      
      // Log tổng quan
      console.log('\n=== TỔNG QUAN ===');
      console.log('Tổng số bước đã hoàn thành:', Object.keys(formData).filter(key => 
        formData[key] && 
        (typeof formData[key] === 'object' ? Object.keys(formData[key]).length > 0 : true)
      ).length);
      
      console.log('Dữ liệu có đầy đủ không:', 
        formData.owner && Object.keys(formData.owner).length > 0 &&
        formData.basic && Object.keys(formData.basic).length > 0 &&
        formData.detailed && Object.keys(formData.detailed).length > 0 &&
        formData.rooms && formData.rooms.length > 0
      );
      
      // TODO: Gọi API tạo homestay ở đây
      console.log('\n=== BẮT ĐẦU GỬI DỮ LIỆU LÊN SERVER ===');
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Homestay đã được tạo thành công!');
      
      // Chuyển hướng sau khi thành công
      navigate('/owner/dashboard');
    } catch (error) {
      console.error('❌ Lỗi khi tạo homestay:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      data: formData[getStepKey(currentStep)],
      onChange: (data) => handleStepChange(data, currentStep),
      onNext: handleNext,
      onPrev: handlePrev,
      onSubmit: handleSubmit,
      loading: loading
    };

    switch (currentStep) {
      case 1:
        return <OwnerInformationStep {...stepProps} />;
      case 2:
        return <BasicInformationStep {...stepProps} />;
      case 3:
        return <DetailedInformationStep {...stepProps} />;
      case 4:
        return <RoomsCreationStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className={styles.createHomestayContainer}>
            <div className={styles.header}>
              <h1 className={styles.title}>
                <i className="bi bi-plus-circle me-2"></i>
                Tạo Homestay Mới
              </h1>
              <p className={styles.subtitle}>
                Hoàn thành 4 bước để tạo homestay của bạn
              </p>
            </div>

            <ProgressBar 
              steps={steps} 
              currentStep={currentStep} 
            />

            <div className={styles.stepContainer}>
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHomestayPage;
