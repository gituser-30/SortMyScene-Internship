// frontend/src/components/SeatGrid.jsx
import React from 'react';

const SeatGrid = ({ seats, selectedSeats, toggleSeat }) => {
  const sortedSeats = [...seats].sort((a, b) => {
    const rowA = a.seatNumber.replace(/\d/g, '');
    const rowB = b.seatNumber.replace(/\d/g, '');
    const numA = parseInt(a.seatNumber.replace(/[^\d]/g, ''));
    const numB = parseInt(b.seatNumber.replace(/[^\d]/g, ''));
    
    if (rowA === rowB) {
      return numA - numB;
    }
    return rowA.localeCompare(rowB);
  });

  return (
    <div className="grid grid-cols-10 gap-3 md:gap-4 justify-center mt-8 p-6 bg-surface rounded-xl border border-gray-800">
      {sortedSeats.map((seat) => {
        const isSelected = selectedSeats.has(seat.seatNumber);
        
        let seatClasses = "w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 select-none relative ";
        
        if (seat.status === 'booked') {
          seatClasses += "bg-error/20 text-error border border-error/30 cursor-not-allowed opacity-50 line-through";
        } else if (isSelected) {
          seatClasses += "bg-primary shadow-[0_0_15px_rgba(124,58,237,0.6)] text-white scale-110 z-10 cursor-pointer";
        } else if (seat.status === 'reserved') {
          seatClasses += "bg-warning/20 text-warning border border-warning/50 cursor-not-allowed animate-pulse";
        } else {
          seatClasses += "bg-gray-800 text-textMuted hover:bg-gray-700 hover:text-white cursor-pointer";
        }

        return (
          <div 
            key={seat._id}
            className={seatClasses}
            onClick={() => {
              if (seat.status === 'available') {
                toggleSeat(seat.seatNumber);
              }
            }}
            title={`Seat ${seat.seatNumber} - ${seat.status}`}
          >
            {seat.seatNumber}
          </div>
        );
      })}
    </div>
  );
};

export default SeatGrid;
