import React from 'react';
//Thẻ sân bóng-Giao diện hiển thị thông tin chi tiết của sân bóng, bao gồm hình ảnh, tên, loại, địa chỉ, tiện ích, đánh giá và nút đặt sân
export default function PitchCard({ pitch, onBookClick }) {
  const isMaintenance = pitch.status === 'maintenance';

  // Parse amenities safely in case server returns JSON string or raw array
  let parsedAmenities = [];
  if (Array.isArray(pitch.amenities)) {
    parsedAmenities = pitch.amenities;
  } else if (typeof pitch.amenities === 'string') {
    try {
      parsedAmenities = JSON.parse(pitch.amenities);
      if (!Array.isArray(parsedAmenities)) {
        parsedAmenities = pitch.amenities.split(',').map(s => s.trim());
      }
    } catch (e) {
      parsedAmenities = pitch.amenities.split(',').map(s => s.trim());
    }
  }

  // Render rating stars based on rating number
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fa-solid fa-star"></i>);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<i key={i} className="fa-solid fa-star-half-stroke"></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star" style={{ opacity: 0.3 }}></i>);
      }
    }
    return stars;
  };

  // Map pitch type to image file
  const getImagePath = () => {
    if (pitch.image && pitch.image.includes('pitch')) {
      // Use image from server if it contains pitch name
      return pitch.image;
    }
    // Map type to local image
    const typeMap = { '5': 'pitch5.jpg', '7': 'pitch7.jpg', '11': 'pitch11.jpg' };
    return `/assets/images/${typeMap[pitch.type] || 'pitch5.jpg'}`;
  };

  return (
    <div className="pitch-card" data-id={pitch.id}>
      <div className="pitch-image-wrapper">
        <img src={getImagePath()} alt={pitch.name} className="pitch-image" />
        <div className="pitch-badges">
          <span className="pitch-type-badge">Sân {pitch.type} người</span>
          <span className={`pitch-status-badge ${pitch.status === 'available' ? 'available' : 'maintenance'}`}>
            {pitch.status === 'available' ? 'Hoạt động' : 'Bảo trì'}
          </span>
        </div>
      </div>
      <div className="pitch-info">
        <div className="pitch-rating-row">
          {renderStars(Number(pitch.rating || 5))}
          <span className="rating-num">
            {pitch.rating} ({pitch.reviewsCount || 0} đánh giá)
          </span>
        </div>
        <h3 className="pitch-title">{pitch.name}</h3>
        <p className="pitch-location">
          <i className="fa-solid fa-location-dot"></i> {pitch.location || pitch.address || 'Địa chỉ đang cập nhật'}
        </p>
        <div className="pitch-amenities">
          {parsedAmenities.map((item, index) => (
            <span key={index} className="amenity-item">
              <i className="fa-solid fa-check"></i> {item}
            </span>
          ))}
        </div>
        <div className="pitch-price-row">
          <div className="price-container">
            <span className="price-label">Giá trung bình</span>
            <span className="price-val">
              {Number(pitch.price || 0).toLocaleString('vi-VN')}đ<span>/giờ</span>
            </span>
          </div>
          {isMaintenance ? (
            <button className="btn btn-secondary" disabled>
              <i className="fa-solid fa-screwdriver-wrench"></i> Bảo Trì
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => onBookClick(pitch.id)}>
              Đặt Sân Ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}