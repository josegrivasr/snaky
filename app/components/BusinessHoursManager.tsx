"use client";

import { useEffect } from 'react';
import { useBusinessHours } from '../hooks/useBusinessHours';

export default function BusinessHoursManager() {
  const isOpen = useBusinessHours();

  useEffect(() => {
    const updateSelectButtons = () => {
      const buttons = document.querySelectorAll('.select-btn');
      buttons.forEach(btn => {
        const button = btn as HTMLButtonElement;
        const isDisabled = !isOpen || button.disabled;
        
        button.disabled = isDisabled;
        button.style.opacity = isDisabled ? '0.4' : '1';
        button.title = isDisabled ? 'Purchases only available during business hours.' : '';
      });
    };

    // Initial update
    updateSelectButtons();

    // Update every minute
    const interval = setInterval(updateSelectButtons, 60000);

    return () => clearInterval(interval);
  }, [isOpen]);

  return null; // This component doesn't render anything
}
