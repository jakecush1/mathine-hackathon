import { defineStore } from "pinia";
import type { ITag } from "../types/tag";
import tagService from "../api/tagService";

export const useTagStore = defineStore("tag", {
  state: () => ({
    tags: [] as ITag[],
    initialized: false,
    loading: false,
    createLoading: false,
    deleteLoading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchTags() {
      if (this.initialized) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await tagService.getTags();
        this.tags = response.data;
        this.initialized = true;
      } catch (err) {
        this.error = "Failed to fetch tags";
      } finally {
        this.loading = false;
      }
    },

    async refreshTags() {
      this.initialized = false;
      await this.fetchTags();
    },

    // Create tag
    async createTag(tagData: Omit<ITag, 'tagid' | 'datecreated' | 'datemodified'>) {
      this.createLoading = true;
      this.error = null;

      try {
        const response = await tagService.createTag(tagData);
        this.tags.push(response.data);
        return response.data;
      } catch (err) {
        this.error = "Failed to create tag";
        throw err;
      } finally {
        this.createLoading = false;
      }
    },

    //Delete tag
    async deleteTag(id: string) {
      this.deleteLoading = true;
      this.error = null;

      try {
        await tagService.deleteTag(id);
        this.tags = this.tags.filter(tag => tag.tagid !== id);
      } catch (err) {
        this.error = "Failed to delete tag";
        throw err; // Re-throw for component handling
      } finally {
        this.deleteLoading = false;
      }
    }
  },
  getters: {
    getTagById: (state) => (id: string) => {
      return state.tags.find(t => t.tagid === id);
    },
    tagOptions: (state) => {
      return state.tags.map(t => ({
        value: t.tagid,
        label: t.tagname,
      }));
    },
    sortedTags: (state) => {
      return [...state.tags].sort(
        (a, b) => 
          new Date(a.datecreated).getTime() - new Date(b.datecreated).getTime()
      );
    },
  },
});