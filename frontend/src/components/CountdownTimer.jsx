// frontend/src/components/CountdownTimer.jsx
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      return Math.floor((new Date(expiresAt) - Date.now()) / 1000);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let colorClass = "text-success bg-success/10 border-success/30";
  if (timeLeft <= 60) {
    colorClass = "text-error bg-error/10 border-error/30 animate-pulse";
  } else if (timeLeft <= 300) {
    colorClass = "text-warning bg-warning/10 border-warning/30";
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono font-medium ${colorClass}`}>
      <Clock size={16} />
      <span>{timeString}</span>
    </div>
  );
};

export default CountdownTimer;
