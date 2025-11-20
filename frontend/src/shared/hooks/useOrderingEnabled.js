import { useState, useEffect } from 'react';
import api from '@shared/services/api';

// Utility function to get current day in Spanish format matching backend
const getCurrentDayInSpanish = () => {
  const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date().getDay();
  return daysMap[today];
};

// Parse business hours string and get schedule for a specific day
const parseBusinessHoursForDay = (businessHours, targetDay) => {
  if (!businessHours) return null;

  const lines = businessHours.split('\n');
  for (const line of lines) {
    if (line.includes(targetDay)) {
      // Check if closed
      if (line.toLowerCase().includes('cerrado')) {
        return { closed: true };
      }
      // Extract time range
      const timeMatch = line.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (timeMatch) {
        return {
          closed: false,
          open: timeMatch[1],
          close: timeMatch[2]
        };
      }
    }
  }
  return null;
};

// Check if current time is within business hours
const isWithinBusinessHours = (openTime, closeTime) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return currentTime >= openTime && currentTime <= closeTime;
};

/**
 * Custom hook to check if ordering is enabled for the current day and time
 * Fetches company settings and checks delivery_enabled_days and business_hours
 *
 * @returns {Object} { isOrderingEnabled, loading, enabledDays }
 */
const useOrderingEnabled = () => {
  const [isOrderingEnabled, setIsOrderingEnabled] = useState(true);
  const [enabledDays, setEnabledDays] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderingSettings = async () => {
      try {
        const response = await api.get('/company/');
        if (response.data.results && response.data.results.length > 0) {
          const companyData = response.data.results[0];
          const currentDay = getCurrentDayInSpanish();

          // Check 1: Is ordering enabled for today?
          let isDayEnabled = true;
          if (companyData.delivery_enabled_days) {
            setEnabledDays(companyData.delivery_enabled_days);
            isDayEnabled = companyData.delivery_enabled_days[currentDay] !== false;
          }

          // Check 2: Are we within business hours?
          let isWithinHours = true;
          if (companyData.business_hours) {
            const daySchedule = parseBusinessHoursForDay(companyData.business_hours, currentDay);
            if (daySchedule) {
              if (daySchedule.closed) {
                isWithinHours = false;
              } else if (daySchedule.open && daySchedule.close) {
                isWithinHours = isWithinBusinessHours(daySchedule.open, daySchedule.close);
              }
            }
          }

          // Both conditions must be true
          setIsOrderingEnabled(isDayEnabled && isWithinHours);
        }
      } catch (err) {
        console.error('Error fetching ordering settings:', err);
        // Default to enabled if API fails
        setIsOrderingEnabled(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderingSettings();

    // Re-check every minute to update based on time
    const interval = setInterval(fetchOrderingSettings, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get list of enabled days
  const getEnabledDaysList = () => {
    return Object.keys(enabledDays).filter(day => enabledDays[day] === true);
  };

  return {
    isOrderingEnabled,
    loading,
    enabledDays,
    getEnabledDaysList,
  };
};

export default useOrderingEnabled;
