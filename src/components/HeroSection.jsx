import React from 'react';

export default function HeroSection() {
  const handleScrollToPitches = (e) => {
    e.preventDefault();
    document.getElementById('explore-pitches')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hero-banner">
      <div className="hero-content">
        <span className="badge">Hệ Thống Đặt Sân Tự Động 24/7</span>
        <h1>Đặt Sân Nhanh Chóng<br />Thỏa Đam Mê Sân Cỏ</h1>
        <p>Tìm kiếm sân gần nhất, chọn khung giờ trống và đặt sân trong 30 giây. Hỗ trợ sân 5, sân 7 và sân 11 với chất lượng cỏ nhân tạo chuẩn FIFA.</p>
        <div className="hero-actions">
          <a href="#explore-pitches" className="btn btn-primary" onClick={handleScrollToPitches}>
            Đặt Sân Ngay <i className="fa-solid fa-arrow-down"></i>
          </a>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat-card">
          <h3>15+</h3>
          <p>Sân chất lượng</p>
        </div>
        <div className="stat-card">
          <h3>10K+</h3>
          <p>Lượt đặt thành công</p>
        </div>
        <div className="stat-card">
          <h3>4.9★</h3>
          <p>Đánh giá khách hàng</p>
        </div>
      </div>
    </div>
  );
}