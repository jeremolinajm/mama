import apiClient from './client';

export interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface WeeklySchedule {
  [key: string]: DaySchedule;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { enabled: true, startTime: '09:00', endTime: '19:00' },
  tuesday: { enabled: true, startTime: '09:00', endTime: '19:00' },
  wednesday: { enabled: true, startTime: '09:00', endTime: '19:00' },
  thursday: { enabled: true, startTime: '09:00', endTime: '19:00' },
  friday: { enabled: true, startTime: '09:00', endTime: '19:00' },
  saturday: { enabled: false, startTime: '09:00', endTime: '13:00' },
  sunday: { enabled: false, startTime: '09:00', endTime: '13:00' },
};

export const configApi = {
  /**
   * Get weekly schedule configuration
   */
  getSchedule: async (): Promise<WeeklySchedule> => {
    try {
      const response = await apiClient.get<{ schedule: string }>('/api/public/config/schedule');
      const scheduleStr = response.data.schedule;

      if (typeof scheduleStr === 'string') {
        return JSON.parse(scheduleStr);
      }
      return scheduleStr as unknown as WeeklySchedule;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return DEFAULT_SCHEDULE;
    }
  },

  /**
   * Get free shipping threshold
   */
  getFreeShippingThreshold: async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ freeShippingThreshold: string }>('/api/public/config/shipping');
      return parseInt(response.data.freeShippingThreshold, 10) || 0;
    } catch (error) {
      console.error('Error fetching shipping config:', error);
      return 0;
    }
  },
};

/**
 * Get day key from Date object
 */
export function getDayKey(date: Date): keyof WeeklySchedule {
  const days: (keyof WeeklySchedule)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  return days[date.getDay()];
}

/**
 * Check if a day is enabled in the schedule
 */
export function isDayEnabled(date: Date, schedule: WeeklySchedule): boolean {
  const dayKey = getDayKey(date);
  return schedule[dayKey]?.enabled ?? false;
}

/**
 * Get business hours for a specific day
 */
export function getDayHours(date: Date, schedule: WeeklySchedule): { startTime: string; endTime: string } | null {
  const dayKey = getDayKey(date);
  const daySchedule = schedule[dayKey];

  if (!daySchedule?.enabled) {
    return null;
  }

  return {
    startTime: daySchedule.startTime,
    endTime: daySchedule.endTime,
  };
}
