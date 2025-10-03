import apiClient from './apiClient';
import type { ITag  } from '../types/tag';

export default {
  createTag(tag: Omit<ITag, 'tagid' | 'datecreated' | 'datemodified'>) {
    return apiClient.post('/tags', tag);
  },
  
  getTags() {
    return apiClient.get<ITag[]>('/tags');
  },
  
  getTag(id: string) {
    return apiClient.get<ITag>(`/tags/${id}`);
  },
  
  updateTag(id: string, tag: Partial<ITag>) {
    return apiClient.put(`/tags/${id}`, tag);
  },
  
  deleteTag(id: string) {
    return apiClient.delete(`/tags/${id}`);
  }
};