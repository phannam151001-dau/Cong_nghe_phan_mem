import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createQrImageUrl } from '../utils/qr';
//Cửa sổ đặt sân-Giao diện đặt sân bóng, chọn khung giờ, dịch vụ, xác nhận thông tin và thanh toán
const TIME_SLOTS = [
  { id: "06-07", label: "06:00 - 07:00", multiplier: 1.0 },
  { id: "07-08", label: "07:00 - 08:00", multiplier: 1.0 },
  { id: "08-09", label: "08:00 - 09:00", multiplier: 0.9 },
  { id: "09-10", label: "09:00 - 10:00", multiplier: 0.9 },
  { id: "10-11", label: "10:00 - 11:00", multiplier: 0.9 },
  { id: "14-15", label: "14:00 - 15:00", multiplier: 0.9 },
  { id: "15-16", label: "15:00 - 16:00", multiplier: 0.9 },
  { id: "16-17", label: "16:00 - 17:00", multiplier: 1.1 },
  { id: "17-18", label: "17:00 - 18:00", multiplier: 1.3 },
  { id: "18-19", label: "18:00 - 19:00", multiplier: 1.4 },
  { id: "19-20", label: "19:00 - 20:00", multiplier: 1.4 },
  { id: "20-21", label: "20:00 - 21:00", multiplier: 1.2 },
  { id: "21-22", label: "21:00 - 22:00", multiplier: 1.0 }
];

function getOffsetDateString(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export default function BookingModal({
  isOpen,
  onClose,
  pitch,
  bookings,
  services,
  onBookingSuccess,
  showToast
}) {
  const { authState } = useAuth();
  const [step, setStep] = useState(1);
  const [bookingDate, setBookingDate] = useState(getOffsetDateString(0));
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [confirmedQrPayload, setConfirmedQrPayload] = useState('');
  const [customerName, setCustomerName] = useState(authState.userName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  useEffect(() => {
    if (authState.userName) {
      setCustomerName(authState.userName);
    }
  }, [authState.userName]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBookingDate(getOffsetDateString(0));
      setSelectedSlots([]);
      setSelectedServices([]);
      setConfirmedQrPayload('');
      setCustomerNote('');
    }
  }, [isOpen, pitch]);

  if (!isOpen || !pitch) return null;

  const bookedSlotIds = [];
  bookings
    .filter(b => b.pitchId === pitch.id && b.date === bookingDate && b.status !== 'cancelled')
    .forEach(b => {
      if (Array.isArray(b.slots)) {
        b.slots.forEach(slot => bookedSlotIds.push(slot));
      }
    });

  const handleSlotClick = (slotId, isBooked) => {
    if (isBooked) {
      showToast("Khung giờ này đã được đặt bởi người khác!", 'warning');
      return;
    }
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const handleServiceChange = (service, checked) => {
    if (checked) {
      setSelectedServices([...selectedServices, service]);
    } else {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    }
  };

  const calculatePitchTotal = () => {
    return selectedSlots.reduce((sum, slotId) => {
      const slotConfig = TIME_SLOTS.find(ts => ts.id === slotId);
      const multiplier = slotConfig ? slotConfig.multiplier : 1.0;
      return sum + (pitch.price * multiplier);
    }, 0);
  };

  const calculateServicesTotal = () => {
    return selectedServices.reduce((sum, svc) => sum + Number(svc.price || 0), 0);
  };

  const calculateGrandTotal = () => {
    return Math.round(calculatePitchTotal() + calculateServicesTotal());
  };

  const paymentQrPayload = `SanCoPro|SO_TIEN=${calculateGrandTotal()}|SAN=${pitch.id}|NGAY=${bookingDate}`;

  const handleNextStep = () => {
    if (step === 1) {
      if (selectedSlots.length === 0) {
        showToast("Vui lòng chọn ít nhất một khung giờ!", 'warning');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast("Vui lòng điền đầy đủ thông tin!", 'warning');
      return;
    }

    const grandTotal = calculateGrandTotal();
    const sortedSlots = [...selectedSlots].sort();
    const slotLabels = sortedSlots.map(slotId => TIME_SLOTS.find(ts => ts.id === slotId)?.label || slotId);
    const serviceValues = selectedServices
      .map((svc) => String(svc.id ?? svc.ma_dich_vu ?? svc.value ?? '').trim())
      .filter(Boolean);

    const buildPayload = (selectedServiceValue) => ({
      pitch_id: String(pitch.id).replace('pitch-', ''),
      ten: customerName,
      sdt: customerPhone,
      ghi_chu: customerNote,
      ngay_dat: bookingDate,
      khung_gio: slotLabels.join(', '),
      thoi_luong: selectedSlots.length * 60,
      gia: grandTotal,
      ma_dich_vu: selectedServiceValue,
      payment_method: 'qr'
    });

    const parseJsonResponse = async (response) => {
      const text = await response.text();
      if (!text) {
        return { success: false, message: 'Không nhận được phản hồi từ máy chủ.' };
      }

      try {
        return JSON.parse(text);
      } catch {
        return { success: false, message: text || 'Lỗi phản hồi từ máy chủ.' };
      }
    };

    const trySubmit = async (serviceValue) => {
      const response = await fetch('/datsan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(serviceValue))
      });

      const result = await parseJsonResponse(response);
      return { response, result };
    };

    try {
      const serviceValue = serviceValues.join(',') || '';
      let { result } = await trySubmit(serviceValue);

      if (!result.success && serviceValues.length > 1) {
        const fallbackValue = serviceValues[0] || '';
        const fallback = await trySubmit(fallbackValue);
        result = fallback.result;
      }

      if (!result.success) {
        showToast(result.message || 'Lỗi đặt sân!', 'danger');
        return;
      }

      const newBooking = {
        id: `SCP-${result.booking_id || Math.floor(100000 + Math.random() * 900000)}`,
        userId: authState.userId,
        pitchId: pitch.id,
        pitchName: pitch.name,
        customerName,
        customerPhone,
        customerNote,
        date: bookingDate,
        slots: selectedSlots,
        services: selectedServices,
        totalPrice: grandTotal,
        status: 'confirmed',
        timestamp: Date.now()
      };

      onBookingSuccess(newBooking);
    } catch (error) {
      console.error(error);
      showToast('Lỗi kết nối khi đặt sân. Vui lòng thử lại.', 'danger');
    }
  };

  const getStepClass = (stepNum) => {
    if (step === stepNum) return 'active';
    if (step > stepNum) return 'completed';
    return '';
  };

  return (
    <div className="modal open" onClick={(e) => e.target.classList.contains('modal') && onClose()}>
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Đặt Sân: <span className="text-emerald">{pitch.name}</span></h2>
          <button className="close-modal-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="stepper">
            <div className={`step ${getStepClass(1)}`}>
              <div className="step-num">1</div>
              <span className="step-label">Chọn lịch</span>
            </div>
            <div className={`step ${getStepClass(2)}`}>
              <div className="step-num">2</div>
              <span className="step-label">Dịch vụ</span>
            </div>
            <div className={`step ${getStepClass(3)}`}>
              <div className="step-num">3</div>
              <span className="step-label">Xác nhận</span>
            </div>
          </div>

          {step === 1 && (
            <div className="step-content active">
              <div className="date-selector-wrapper">
                <label htmlFor="booking-date">Chọn Ngày Thi Đấu:</label>
                <input
                  type="date"
                  id="booking-date"
                  value={bookingDate}
                  min={getOffsetDateString(0)}
                  max={getOffsetDateString(14)}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setSelectedSlots([]);
                  }}
                />
              </div>

              <div className="time-slots-section">
                <div className="section-subtitle">
                  <span>Khung Giờ Trống:</span>
                </div>
                <div className="time-slots-grid">
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedSlotIds.includes(slot.id);
                    const isSelected = selectedSlots.includes(slot.id);
                    const rate = pitch.price * slot.multiplier;
                    let slotClass = 'available';

                    if (isBooked) slotClass = 'booked';
                    else if (isSelected) slotClass = 'selected';

                    return (
                      <div
                        key={slot.id}
                        className={`time-slot ${slotClass}`}
                        onClick={() => handleSlotClick(slot.id, isBooked)}
                      >
                        <span className="slot-time">{slot.label}</span>
                        <span className="service-mini-badge" style={{ marginTop: '0.2rem' }}>
                          {rate.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content active">
              <p className="step-desc">Chọn dịch vụ phụ trợ (nếu cần):</p>
              <div className="services-list">
                {services.length === 0 ? (
                  <div className="empty-state">
                    <p>Không có dịch vụ</p>
                  </div>
                ) : (
                  services.map((service) => {
                    const isChecked = selectedServices.some(s => s.id === service.id);
                    return (
                      <div className="service-item" key={service.id}>
                        <div className="service-info">
                          <div>
                            <h4>{service.name}</h4>
                          </div>
                        </div>
                        <div className="service-action">
                          <span className="service-price">
                            {Number(service.price || 0).toLocaleString('vi-VN')}đ
                          </span>
                          <input
                            type="checkbox"
                            className="service-checkbox"
                            checked={isChecked}
                            onChange={(e) => handleServiceChange(service, e.target.checked)}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content active">
              <div className="checkout-grid">
                <div>
                  <form className="booking-form" onSubmit={handleConfirmBooking}>
                    <h3>Thông Tin Liên Hệ</h3>
                    <div className="form-group">
                      <label htmlFor="customer-name">Họ và tên (*)</label>
                      <input
                        type="text"
                        id="customer-name"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="customer-phone">Số điện thoại (*)</label>
                      <input
                        type="tel"
                        id="customer-phone"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="customer-note">Ghi chú</label>
                      <textarea
                        id="customer-note"
                        rows="3"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                      />
                    </div>
                  </form>
                </div>

                <div className="booking-summary-card">
                  <h3>Tóm Tắt</h3>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Sân:</span>
                      <strong>{pitch.name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Ngày:</span>
                      <strong>{bookingDate}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Giờ:</span>
                      <strong>{selectedSlots.length} ca</strong>
                    </div>
                    <div className="summary-row">
                      <span>Tiền sân:</span>
                      <strong>{calculatePitchTotal().toLocaleString('vi-VN')}đ</strong>
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="summary-row summary-services">
                        <span>Dịch vụ:</span>
                        <strong>
                          {selectedServices
                            .map((service) => `${service.name} (${Number(service.price || 0).toLocaleString('vi-VN')}đ)`)
                            .join(', ')}
                        </strong>
                      </div>
                    )}

                    <div className="summary-row">
                      <span>Phí dịch vụ:</span>
                      <strong>{calculateServicesTotal().toLocaleString('vi-VN')}đ</strong>
                    </div>

                    <div className="payment-qr-panel">
                      <img
                        className="payment-qr-image"
                        src={createQrImageUrl(paymentQrPayload)}
                        alt={`Mã QR thanh toán ${calculateGrandTotal().toLocaleString('vi-VN')} đồng`}
                      />
                      <div>
                        <strong>Quét mã QR để thanh toán</strong>
                        <span> Số tiền: {calculateGrandTotal().toLocaleString('vi-VN')}đ</span>
                        <small>QR mô phỏng, không tự động trừ tiền hoặc xác nhận giao dịch.</small>
                      </div>
                    </div>
                    <label className="payment-qr-acknowledgement">
                      <input
                        type="checkbox"
                        checked={confirmedQrPayload === paymentQrPayload}
                        onChange={(event) => setConfirmedQrPayload(event.target.checked ? paymentQrPayload : '')}
                      />
                      <span>Tôi đã quét mã QR và xác nhận đúng số tiền.</span>
                    </label>

                    <div className="summary-divider"></div>
                    <div className="summary-total-row">
                      <span>TỔNG:</span>
                      <span className="total-price">
                        {calculateGrandTotal().toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            disabled={step === 1}
            onClick={handlePrevStep}
          >
            Quay lại
          </button>
          <div>
            {step < 3 ? (
              <button className="btn btn-primary" onClick={handleNextStep}>
                Tiếp tục <i className="fa-solid fa-arrow-right"></i>
              </button>
            ) : (
              <button
                className="btn btn-success"
                disabled={confirmedQrPayload !== paymentQrPayload}
                onClick={handleConfirmBooking}
              >
                <i className="fa-solid fa-check"></i> Xác nhận
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}