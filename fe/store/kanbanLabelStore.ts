import { defineStore } from 'pinia'
import type { IKanbanLabel } from '../types/kanbanlabel'
import kanbanLabelService from '../api/kanbanLabelService' 

export const useKanbanLabelStore = defineStore('kanbanLabel', {
  state: () => ({
    kanbanLabels: [] as IKanbanLabel[],
    initialized: false,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchKanbanLabels() {
      try {
        const response = await kanbanLabelService.getKanbanLabels();
        this.kanbanLabels = response.data;
        this.initialized = true;
      } catch (err) {
        console.error('KanbanLabels fetch error:', err);
      }
    },

    //refresh action
    async refreshKanbanLabels() {
      this.initialized = false
      await this.fetchKanbanLabels()
    }
  },
  getters: {
    getKanbanLabelById: (state) => (id: string) => {
      return state.kanbanLabels.find(p => p.kanbanlabelid === id)
    },
    kanbanlabelOptions: (state) => {
      return state.kanbanLabels.map(p => ({
        value: p.kanbanlabelid,
        label: p.kanbanlabelname
      }))
    },
    // getter for sorted labels
    sortedKanbanlabels: (state) => {
      return [...state.kanbanLabels].sort(
        (a, b) => new Date(a.datecreated).getTime() - new Date(b.datecreated).getTime()
      )
    }
  }
})