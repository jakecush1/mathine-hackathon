import apiClient from './apiClient';
import type { IPriority } from '../types/priority';

export default {
  //createPriority(priority: Omit<IPriority, 'priorityid'>) {
  //  return apiClient.post('/priorities', priority);
  //},
  
  getPriorities() {
    return apiClient.get<IPriority[]>('/priorities');
  },
  
  getPriority(id: string) {
    return apiClient.get<IPriority>(`/priorities/${id}`);
  },
  
  //updatePriority(id: string, priority: Partial<IPriority>) {
  //  return apiClient.put(`/priorities/${id}`, priority);
  //},
  
  //deletePriority(id: string) {
  //  return apiClient.delete(`/priorities/${id}`);
  //}
};