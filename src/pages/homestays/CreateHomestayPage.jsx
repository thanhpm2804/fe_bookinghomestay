import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateHomestayPage.module.css';
import ProgressBar from '../../components/homestay/createHomestay/ProgressBar';
import OwnerInformationStep from '../../components/homestay/createHomestay/OwnerInformationStep';
import BasicInformationStep from '../../components/homestay/createHomestay/BasicInformationStep';
import DetailedInformationStep from '../../components/homestay/createHomestay/DetailedInformationStep';
import RoomsCreationStep from '../../components/homestay/createHomestay/RoomsCreationStep';
import { addRoom, uploadImage } from '../../services/room';
import { createOwnerAccount } from '../../services/auth';
import { createHomestay } from '../../services/homestayService';

const CreateHomestayPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    owner: {},
    basic: {},
    detailed: {},
    rooms: { rooms: [] }
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
    console.log('Current Form Data before update:', formData);

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [getStepKey(stepNumber)]: stepNumber === 4 ? { rooms: stepData.rooms || [] } : stepData
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

  const handleSubmit = async (submitData) => {
    setLoading(true);
    try {
      console.log('=== ALL SUBMITTED DATA ===');
      console.log('Form Data:', formData);
      console.log('Submit Data:', submitData);

      // Extract room data from FormData if it exists
      let roomsData = formData.rooms.rooms || [];
      
      // If submitData is FormData, try to get the JSON data
      if (submitData instanceof FormData) {
        const homestayData = submitData.get('homestayData');
        if (homestayData) {
          try {
            const parsedData = JSON.parse(homestayData);
            if (parsedData.rooms) {
              roomsData = parsedData.rooms;
            }
          } catch (e) {
            console.error('Error parsing homestayData:', e);
          }
        }
      }

      console.log('Final roomsData:', roomsData);

      // Handle owner avatar upload
      let avatarUrl = 'https://res.cloudinary.com/dsuyc27sj/image/upload/v1753700644/images_kw7ouv.png';
      if (formData.owner.imageFile) {
        const uploadAvatarResponse = await uploadImage(formData.owner.imageFile);
        console.log('uploadAvatarResponse:', uploadAvatarResponse);
        if (uploadAvatarResponse?.imageUrl) {
          avatarUrl = uploadAvatarResponse.imageUrl;
        }
      }
      formData.owner.avatarUrl = avatarUrl;

      // Create owner account
      let userId = 'ebd394aa-edbd-4715-971e-70d5e329797b';
      const createOwnerResponse = await createOwnerAccount({
        ...formData.owner,
        avatarUrl
      });
      if (createOwnerResponse?.userId) {
        userId = createOwnerResponse.userId;
      } else {
        console.error('create owner error:', createOwnerResponse?.error);
        throw new Error('Failed to create owner account');
      }

      // Upload homestay images
      let imgCloudUrl = [];
      if (formData.detailed.mainImages) {
        for (let imgObj of formData.detailed.mainImages) {
          const imgCloud = await uploadImage(imgObj.file);
          if (imgCloud?.imageUrl) {
            imgCloudUrl.push(imgCloud.imageUrl);
          }
        }
      }

      // Create homestay data
      const newHomestayData = {
        Name: formData.basic.name,
        HomestayTypeId: parseInt(formData.basic.homestayType),
        Description: formData.detailed.detailedDescription,
        Latitude: formData.detailed.latitude,
        Longitude: formData.detailed.longitude,
        StreetAddress: formData.basic.streetAddress,
        WardId: parseInt(formData.basic.wardId),
        Rules: formData.detailed.rules,
        OwnerId: userId,
        ImageUrls: imgCloudUrl,
        NeighbourhoodIds: formData.detailed.neighbourhoodIds,
        AmenityIds: formData.detailed.amenityIds,
        HomestayPolicies: formData.detailed.policies,
      };

      // Create homestay
      const createHomestayResponse = await createHomestay(newHomestayData);
      if (!createHomestayResponse?.error && createHomestayResponse?.homestay?.HomestayId) {
        const homestayId = createHomestayResponse.homestay.HomestayId;
        
        // Process rooms
        if (roomsData.length > 0) {
          for (let i = 0; i < roomsData.length; i++) {
            const room = roomsData[i];
            console.log('Processing room:', room);
            
            // Get the image file from FormData if available
            let roomImageFile = null;
            if (submitData instanceof FormData) {
              roomImageFile = submitData.get(`roomImages[${i}]`);
            }
            
            const roomData = await convertRoomDataToApiParam(room, homestayId, roomImageFile);
            console.log('Converted room data:', roomData);
            const createRoomResponse = await addRoom(roomData);
            console.log('createRoomResponse:', createRoomResponse);
          }
        } else {
          console.warn('No rooms to process');
        }

        navigate('/create-homestay-success');
      } else {
        throw new Error('Failed to create homestay');
      }
    } catch (error) {
      console.error('❌ Error creating homestay:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertRoomDataToApiParam = async (room, htId, roomImageFile) => {
    const roomBeds = room.roomBeds.map(rb => ({
      BedTypeId: rb.bedTypeId,
      Quantity: rb.quantity
    }));
    const roomPrices = [{ PriceTypeId: 1, AmountPerNight: room.price }];
    const roomAmenities = room.amenities.map(amenity => ({ AmenityId: amenity }));
    let roomImgUrl = 'img';
    
    if (roomImageFile) {
      const cloudImgResponse = await uploadImage(roomImageFile);
      if (cloudImgResponse?.imageUrl) {
        roomImgUrl = cloudImgResponse.imageUrl;
      }
    } else if (room.imgFile) {
      const cloudImgResponse = await uploadImage(room.imgFile);
      if (cloudImgResponse?.imageUrl) {
        roomImgUrl = cloudImgResponse.imageUrl;
      }
    }

    return {
      Name: room.name,
      HomestayId: htId,
      Description: "room",
      ImgUrl: roomImgUrl,
      Capacity: room.capacity,
      Size: room.size,
      RoomBeds: roomBeds,
      RoomPrices: roomPrices,
      RoomAmenities: roomAmenities,
    };
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
        return <RoomsCreationStep
          data={formData.rooms.rooms || []}
          onChange={(data) => handleStepChange(data, currentStep)}
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
          loading={loading}
        />;
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