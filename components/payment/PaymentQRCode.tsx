'use client';

import React, { useState } from 'react';
import { QrCode, AlertCircle, RefreshCw } from 'lucide-react';

interface PaymentQRCodeProps {
  qrCodeUrl: string;
  orderCode: string;
  amount: number;
}

export function PaymentQRCode({ qrCodeUrl, orderCode, amount }: PaymentQRCodeProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-[#e8dfd8] shadow-sm flex flex-col items-center justify-center space-y-4 text-center">
      <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-[#fdfbf7] border border-gray-200 p-3 flex items-center justify-center relative overflow-hidden shadow-inner">
        {imgError ? (
          <div className="text-gray-400 space-y-2 p-4 text-xs">
            <QrCode className="w-16 h-16 mx-auto text-gray-300" />
            <p className="font-semibold text-gray-700">Mã QR Thanh Toán</p>
            <p className="text-[11px] text-gray-500 font-mono">
              Chuyển khoản: {amount.toLocaleString('vi-VN')} đ
            </p>
            <p className="text-[10px] text-gray-400 font-mono">Nội dung: {orderCode}</p>
          </div>
        ) : (
          <img
            src={qrCodeUrl}
            alt={`Mã QR đơn hàng ${orderCode}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain rounded-xl"
          />
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-800">Mở ứng dụng Ngân hàng để quét mã QR</p>
        <p className="text-[11px] text-gray-400">
          Thông tin số tiền và nội dung chuyển khoản được tự động điền chính xác
        </p>
      </div>
    </div>
  );
}
