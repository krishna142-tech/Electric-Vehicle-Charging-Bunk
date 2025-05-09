import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface BookingQRCodeProps {
  bookingId: string;
  stationName: string;
  startTime: string;
  endTime: string;
  size?: number;
}

const BookingQRCode: React.FC<BookingQRCodeProps> = ({ bookingId, stationName, startTime, endTime, size = 128 }) => {
  const qrValue = JSON.stringify({ bookingId, stationName, startTime, endTime });
  return <QRCodeCanvas value={qrValue} size={size} />;
};

export default BookingQRCode; 