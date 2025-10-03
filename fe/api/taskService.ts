import apiClient from './apiClient';
import type { ITask } from '../types/task';

export default {
  createTask(task: Omit<ITask, 'taskid' | 'datecreated' | 'datemodified'>) {
    return apiClient.post('/tasks', task);
  },
  
  getTasks() {
    return apiClient.get<ITask[]>('/tasks');
  },
  
  getTask(id: string) {
    return apiClient.get<ITask>(`/tasks/${id}`);
  },
  
  checkBS(id: string) {
    return apiClient.get<ITask>(`/tasks/checkBS/${id}`);
  },

  updateTask(id: string, task: Partial<ITask>) {
    return apiClient.put(`/tasks/${id}`, task);
  },
  
  deleteTask(id: string) {
    return apiClient.delete(`/tasks/${id}`);
  }
};