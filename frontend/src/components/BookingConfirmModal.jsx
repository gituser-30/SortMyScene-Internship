// frontend/src/components/BookingConfirmModal.jsx
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const BookingConfirmModal = ({ seatNumbers, eventName, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center transform animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-textMuted mb-6">Your tickets for <span className="text-white font-medium">{eventName}</span> have been successfully booked.</p>
        
        <div className="bg-[#0D0D0D] rounded-xl p-4 mb-8">
          <p className="text-sm text-textMuted mb-2">Seat Numbers</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {seatNumbers.map(seat => (
              <span key={seat} className="px-3 py-1 bg-primary/20 text-primary rounded-md font-medium">
                {seat}
              </span>
            ))}
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-3 bg-primary hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
        >
          Return to Events
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmModal;
