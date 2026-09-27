export function createQrImageUrl(payload, size = 200) {
  const params = new URLSearchParams({ size: `${size}x${size}`, data: payload });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}