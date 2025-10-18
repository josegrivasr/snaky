import { useState, useEffect } from 'react';

export const useBusinessHours = () => {
  const [isOpen, setIsOpen] = useState(false);

  const isBusinessHours = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour * 60 + minute;

    if (day === 0 || day === 6) return true; // Sat & Sun all day

    const start = 17 * 60;       // 17:00
    const end = 22 * 60 + 30;    // 22:30
    return time >= start && time <= end;
  };

  const updateBusinessHours = () => {
    setIsOpen(isBusinessHours());
  };

  useEffect(() => {
    // Initial check
    updateBusinessHours();

    // Check every minute
    const interval = setInterval(updateBusinessHours, 60000);

    return () => clearInterval(interval);
  }, []);

  return isOpen;
};
