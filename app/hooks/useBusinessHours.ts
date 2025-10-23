import { useState, useEffect } from 'react';

export const useBusinessHours = () => {
  const [isOpen, setIsOpen] = useState(false);

  const isBusinessHours = () => {
    // Get current time in Texas (Central Time)
    const now = new Date();
    const texasTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    
    const day = texasTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = texasTime.getHours();
    const minute = texasTime.getMinutes();
    const time = hour * 60 + minute;

    // Saturday & Sunday: All day (24/7)
    if (day === 0 || day === 6) return true;

    // Monday - Friday: 5:00 PM to 10:30 PM Texas time
    const start = 17 * 60;       // 17:00 (5:00 PM)
    const end = 22 * 60 + 30;    // 22:30 (10:30 PM)
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
