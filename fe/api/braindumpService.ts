import apiClient from './apiClient';
import type { IBraindump } from '../types/braindump';

export default {
  // Create
  createBraindump(braindump: Omit<IBraindump, 'braindumpid' | 'datecreated' | 'datemodified'>) {
    return apiClient.post('/braindumps', braindump);
  },
  
  // Read (All)
  getBraindumps() {
    return apiClient.get<IBraindump[]>('/braindumps');
  },
  
  // Read (Single)
  getBraindump(id: string) {
    return apiClient.get<IBraindump>(`/braindumps/${id}`);
  },
  
  // Update
  updateBraindump(id: string, braindump: Partial<IBraindump>) {
    return apiClient.put(`/braindumps/${id}`, braindump);
  },
  
  // Delete
  deleteBraindump(id: string) {
    return apiClient.delete(`/braindumps/${id}`);
  }
};