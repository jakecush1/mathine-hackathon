import apiClient from './apiClient';
import type { ICalendar  } from '../types/calendar';

export default {
  createCalendar(calendar: Omit<ICalendar, 'calendarid' | 'datecreated' | 'datemodified'>) {
    return apiClient.post('/calendars', calendar);
  },
  
  getCalendars() {
    return apiClient.get<ICalendar[]>('/calendars');
  },
  
  getCalendar(id: string) {
    return apiClient.get<ICalendar>(`/calendars/${id}`);
  },
  
  updateCalendar(id: string, calendar: Partial<ICalendar>) {
    return apiClient.put(`/calendars/${id}`, calendar);
  },
  
  deleteCalendar(id: string) {
    return apiClient.delete(`/calendars/${id}`);
  }
};