import apiClient from './apiClient';
import type { ITaskXTag } from '../types/taskxtag';

export default {
  createTaskXTag(tasktags: Omit<ITaskXTag, 'tagxtaskid'>) {
    return apiClient.post('/taskxtags', tasktags);
  },
  
  deleteTaskXTag(id: string) {
    return apiClient.delete(`/taskxtags/${id}`);
  }
};