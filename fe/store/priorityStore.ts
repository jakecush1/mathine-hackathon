import { defineStore } from 'pinia'
import type { IPriority } from '../types/priority'
import priorityService from '../api/priorityService' 

export const usePriorityStore = defineStore('priority', {
  state: () => ({
    priorities: [] as IPriority[],
    initialized: false,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchPriorities() {
      // Skip if already initialized
      if (this.initialized) return 
      
      this.loading = true
      this.error = null
      
      try {
        //existing service
        const response = await priorityService.getPriorities()
        this.priorities = response.data
        this.initialized = true
      } catch (err) {
        this.error = 'Failed to fetch priorities'
        //console.error('Priority fetch error:', err)
      } finally {
        this.loading = false
      }
    },

    //refresh action
    async refreshPriorities() {
      this.initialized = false
      await this.fetchPriorities()
    }
  },
  getters: {
    getPriorityById: (state) => (id: string) => {
      return state.priorities.find(p => p.priorityid === id)
    },
    priorityOptions: (state) => {
      return state.priorities.map(p => ({
        value: p.priorityid,
        label: p.priorityname
      }))
    },
    // New getter for sorted priorities
    sortedPriorities: (state) => {
      return [...state.priorities].sort(
        (a, b) => new Date(a.datecreated).getTime() - new Date(b.datecreated).getTime()
      )
    }
  }
})