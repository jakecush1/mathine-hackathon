import apiClient from './apiClient';
import type { IKanbanLabel } from '../types/kanbanlabel';

export default {
  //createKanbanLabel(label: Omit<IKanbanLabel, 'kanbanlabelid'>) {
  //  return apiClient.post('/kanbanlabels', label);
  //},
  
  getKanbanLabels() {
    return apiClient.get<IKanbanLabel[]>('/kanbanlabels');
  },
  
  getKanbanLabel(id: string) {
    return apiClient.get<IKanbanLabel>(`/kanbanlabels/${id}`);
  },
  
  //updateKanbanLabel(id: string, label: Partial<IKanbanLabel>) {
  //  return apiClient.put(`/kanbanlabels/${id}`, label);
  //},
  
  //deleteKanbanLabel(id: string) {
  //  return apiClient.delete(`/kanbanlabels/${id}`);
  //}
};