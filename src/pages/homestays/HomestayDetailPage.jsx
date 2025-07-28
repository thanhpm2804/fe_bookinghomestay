import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AvailableRooms from '../../components/room/AvailableRooms';
import { getHomestayById } from '../../services/homestayService';
import HomestayMap from '../../components/homestay/HomestayMap'
import { getRoomByHomestayId } from '../../services/RoomService';
import BookingSummary from '../../components/booking/BookingSummary';
import styles from './HomestayDetailPage.module.css';

const HomestayDetailPage = () => {
    const { id } = useParams();
    const homestayId = 2;
    const [homestay, setHomestay] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [checkIn, setCheckIn] = useState('2025-08-01');
    const [checkOut, setCheckOut] = useState('2025-08-03');
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Booking Summary State
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [showBookingSummary, setShowBookingSummary] = useState(false);
    const navigate = useNavigate();

    const fetchRooms = async (checkIn, checkOut) => {
        const roomsData = await getRoomByHomestayId(homestayId, checkIn, checkOut)
        console.log('RoomData: ', roomsData)
        setRooms(roomsData)
    }
    useEffect(() => {
        const loadHomestayAndRooms = async () => {
            setLoading(true);
            const homestayData = await getHomestayById(2);
            console.log(homestayData)
            setHomestay(homestayData);
            await fetchRooms(checkIn, checkOut)
            setLoading(false);
        };
        loadHomestayAndRooms();
    }, [id]);

    useEffect(() => {
        console.log('SelectedRoom: ', selectedRooms)
    }, [selectedRooms])
    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = Math.abs(checkOutDate - checkInDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Xử lý chọn phòng
    const handleSelectRoom = (room) => {
        const nights = calculateNights();
        const newRoom = {
            id: room.RoomId,
            name: room.Name,
            type: room.RoomTypeName || 'Standard',
            guests: room.Capacity,
            price: room.Price,
            nights: nights
        };

        setSelectedRooms(prev => {
            // Kiểm tra xem phòng đã được chọn chưa
            if (prev.find(r => r.id === room.RoomId)) {
                return prev; // Đã có rồi, không thêm nữa
            }
            const updated = [...prev, newRoom];

            // Hiển thị summary khi có phòng được chọn
            if (updated.length > 0) {
                setShowBookingSummary(true);
            }

            return updated;
        });
    };
    // Xử lý xóa phòng khỏi booking
    const handleRemoveRoom = (roomId) => {
        setSelectedRooms(prev => {
            const updated = prev.filter(room => room.id !== roomId);

            // Ẩn summary nếu không còn phòng nào
            if (updated.length === 0) {
                setShowBookingSummary(false);
            }

            return updated;
        });
    };

    // Xử lý đặt phòng
    const handleBookRoom = () => {
        const bookingData = {
            homestayId: homestayId,
            homestayName: homestay?.Name,
            homestayImageUrl: homestay?.ImageUrls[0],
            checkIn: checkIn,
            checkOut: checkOut,
            rooms: selectedRooms,
            nights: calculateNights()
        };

        navigate('/confirm-booking', {
            state: { bookingData }
        });
    };

    // Xử lý đóng booking summary
    const handleCloseBookingSummary = () => {
        setShowBookingSummary(false);
    };

    // Xử lý thay đổi ngày từ AvailableRooms
    const handleDateChange = async (newCheckIn, newCheckOut) => {
        setCheckIn(newCheckIn);
        setCheckOut(newCheckOut);

        // Reset selected rooms khi đổi ngày
        setSelectedRooms([]);
        setShowBookingSummary(false);

        // Fetch lại rooms với ngày mới
        await fetchRooms(newCheckIn, newCheckOut);
    };
    if (loading) return <div className="text-center py-5">Đang tải...</div>;

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? homestay.ImageUrls.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === homestay.ImageUrls.length - 1 ? 0 : prev + 1));
    };

    //const averageRating = homestay.Feedbacks.reduce((sum, fb) => sum + fb.Rating, 0) / homestay.Feedbacks.length || 0;
    const averageRating = 4.5;
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContainer}>
                <div className="d-flex justify-content-center">
                    <div className={styles.contentWrapper}>
                        {/* Header Section */}
                        <div className={styles.headerSection}>
                            <h1 className={styles.homestayName}>{homestay.Name}</h1>
                            <p className={styles.address}>{homestay.StreetAddress}, {homestay.WardName}</p>
                            <p className={styles.homestayType}>{homestay.HomestayTypeName}</p>
                            <div className="d-flex align-items-center mt-2">
                                <span className={`badge ${styles.statusBadge}`}>Available</span>
                                <span className={styles.ratingStars}>{'★'.repeat(Math.round(averageRating))}<span className={styles.ratingScore}>{averageRating.toFixed(1)}</span></span>
                            </div>
                        </div>

                        {/* Image Carousel - GIỮ NGUYÊN INLINE STYLES */}
                        <div className={styles.carouselSection}>
                            <div
                                id="homestayCarousel"
                                className="carousel slide shadow-sm rounded-3 overflow-hidden"
                                data-bs-ride="carousel"
                                style={{ position: 'relative' }}
                            >
                                <div className="carousel-inner">
                                    {homestay.ImageUrls.map((imageUrl, index) => (
                                        <div key={index} className={`carousel-item ${index === currentImageIndex ? 'active' : ''}`}>
                                            <img
                                                src={imageUrl}
                                                className="d-block w-100"
                                                alt={`Homestay ${index + 1}`}
                                                style={{
                                                    height: '500px',
                                                    objectFit: 'cover',
                                                    width: '100%'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className={`carousel-control-prev ${styles.carouselButton} ${styles.carouselButtonPrev}`}
                                    type="button"
                                    onClick={handlePrevImage}
                                >
                                    <span className={`carousel-control-prev-icon ${styles.carouselIcon}`} aria-hidden="true"></span>
                                    <span className="visually-hidden">Trước</span>
                                </button>
                                <button
                                    className={`carousel-control-next ${styles.carouselButton} ${styles.carouselButtonNext}`}
                                    type="button"
                                    onClick={handleNextImage}
                                >
                                    <span className={`carousel-control-next-icon ${styles.carouselIcon}`} aria-hidden="true"></span>
                                    <span className="visually-hidden">Tiếp</span>
                                </button>
                            </div>
                        </div>

                        {/* Description & Amenities */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Về chỗ nghỉ này</h2>
                            <p className={styles.description}>{homestay.Description}</p>

                            {/* Policies */}
                            <div className={`row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 ${styles.policiesGrid}`}>
                                {homestay.Policies.map((policy, index) => (
                                    <div key={index} className="col">
                                        <div className={styles.policyItem}>
                                            {policy.IsAllowed ? 
                                                <i className={`bi bi-check-circle-fill text-success ${styles.policyIcon}`}></i>
                                                : <i className={`bi bi-x-circle-fill text-danger ${styles.policyIcon}`}></i>}
                                            <span className={styles.policyText}>{policy.PolicyName}</span>
                                        </div>
                                    </div>
                                ))}
                                {homestay.Rules && (
                                    <div className="col">
                                        <div className={styles.policyItem}>
                                            <i className={`bi bi-check-circle-fill text-success ${styles.policyIcon}`}></i>
                                            <span className={styles.policyText}>{homestay.Rules}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Tiện nghi</h2>
                            <div className={styles.amenitiesGrid}>
                                {homestay.Amenities.map((amenity, index) => (
                                    <div key={index} className={styles.amenityItem}>
                                        <i className={`bi bi-check-circle-fill text-success ${styles.amenityIcon}`}></i>
                                        <span className={styles.amenityText}>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Rooms */}
                        <AvailableRooms checkIn={checkIn} checkOut={checkOut} rooms={rooms ? rooms : []}
                            onFilterRooms={fetchRooms}
                            onSelectRoom={handleSelectRoom} />

                        {/* Neighborhood */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Khu vực lân cận</h2>
                            <div className={`list-group list-group-flush ${styles.neighborhoodList}`}>
                                {homestay.Neighbourhoods.map((neighborhood, index) => (
                                    <a key={index} href="#" className={`list-group-item list-group-item-action ${styles.neighborhoodItem}`}>{neighborhood}</a>
                                ))}
                            </div>
                        </section>

                        {/* Map */}
                        {homestay.Latitude && homestay.Longitude && (
                            <section className={styles.mapSection}>
                                <h2 className={styles.sectionTitle}>Vị trí</h2>
                                <div className={`card ${styles.mapCard}`}>
                                    <div className={`card-body ${styles.mapCardBody}`}>
                                        <HomestayMap homestayName={homestay.Name} latitude={homestay.Latitude} longitude={homestay.Longitude} />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Feedback */}
                        <section className={styles.feedbackSection}>
                            <h2 className={styles.sectionTitle}>Đánh giá của khách</h2>
                            {homestay && homestay.Feedbacks && homestay.Feedbacks.length > 0 ? (
                                homestay.Feedbacks.map((feedback, index) => (
                                    <div key={index} className={`card mb-4 ${styles.feedbackCard}`}>
                                        <div className={styles.feedbackCardBody}>
                                            <div className="d-flex align-items-center mb-2">
                                                <span className={styles.feedbackRating}>{'★'.repeat(Math.round(feedback.Rating))}</span>
                                                <span className={styles.feedbackScore}>{feedback.Rating.toFixed(1)}</span>
                                            </div>
                                            <p className={styles.feedbackComment}>{feedback.Comment}</p>
                                            <p className={styles.feedbackDate}>{new Date(feedback.CreatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noFeedback}>Chưa có đánh giá nào.</p>
                            )}
                        </section>

                        {/* Owner Info */}
                        <section className={styles.ownerSection}>
                            <h2 className={styles.sectionTitle}>Được đăng bởi</h2>
                            <div className={styles.ownerCard}>
                                <p className={styles.ownerName}>{homestay.Owner && homestay.Owner.FullName}</p>
                                <p className={styles.ownerJoinDate}>Tham gia từ {homestay.CreatedAt && Date(homestay.CreatedAt).toLocaleDateString()}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            {/* Booking Summary */}
            <BookingSummary
                isVisible={showBookingSummary}
                checkInDate={checkIn}
                checkOutDate={checkOut}
                selectedRooms={selectedRooms}
                onRemoveRoom={handleRemoveRoom}
                onBook={handleBookRoom}
                onClose={handleCloseBookingSummary}
            />
        </div>
    );
};

export default HomestayDetailPage;