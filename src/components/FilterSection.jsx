import React from 'react';

export default function FilterSection({
  query,
  setQuery,
  typeFilter,
  setTypeFilter,
  priceFilter,
  setPriceFilter,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="search-filter-container" id="explore-pitches">
      <div className="search-bar-wrapper">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          id="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm tên sân bóng hoặc khu vực..."
        />
      </div>

      <div className="filters-wrapper">
        <div className="filter-group">
          <label htmlFor="filter-type">
            <i className="fa-solid fa-users"></i> Loại Sân
          </label>
          <select
            id="filter-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại sân</option>
            <option value="5">Sân 5 người</option>
            <option value="7">Sân 7 người</option>
            <option value="11">Sân 11 người</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-price">
            <i className="fa-solid fa-money-bill-wave"></i> Giá Sân
          </label>
          <select
            id="filter-price"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="all">Mọi mức giá</option>
            <option value="low">Dưới 300,000đ/h</option>
            <option value="mid">300,000đ - 600,000đ/h</option>
            <option value="high">Trên 600,000đ/h</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">
            <i className="fa-solid fa-sort"></i> Sắp xếp
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
}