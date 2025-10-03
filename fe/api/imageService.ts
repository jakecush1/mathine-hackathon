import apiClient from './apiClient';
import type { IImage } from '../types/image';

export default {
  createImage(image: Omit<IImage, 'imageid' | 'datecreated' | 'datemodified'>) {
    return apiClient.post('/images', image);
  },
  
  getImages() {
    return apiClient.get<IImage[]>('/images');
  },
  
  getImage(id: string) {
    return apiClient.get<IImage>(`/images/${id}`);
  },
  
  updateImage(id: string, image: Partial<IImage>) {
    return apiClient.put(`/images/${id}`, image);
  },
  
  deleteImage(id: string) {
    return apiClient.delete(`/images/${id}`);
  }
};