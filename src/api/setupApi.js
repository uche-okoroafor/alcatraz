import axios from "axios";
import { SERVER_URL } from "../endpoints";

const API_BASE_URL = SERVER_URL;

const setupApi = {
  add: async (newSetup) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/strategy-setups`, newSetup);
      return response.data;
    } catch (error) {
      console.log('There was a problem with the fetch operation:', error);
    }
  },

  update: async (setupId, updatedSetup) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/strategy-setups/${setupId}`, updatedSetup);
      return response.data;
    } catch (error) {
      console.log('There was a problem with the fetch operation:', error);
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/strategy-setups/${id}`);
      return response.data;
    } catch (error) {
      console.log('There was a problem with the fetch operation:', error);
    }
  },

  get: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/strategy-setups`);
      return response.data;
    } catch (error) {
      console.log('There was a problem with the fetch operation:', error);
    }
  },

  fetchSetups: async (page, pageSize) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/strategy-setups?page=${page}&limit=${pageSize}&sort=created_at^:desc`);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  }
};

export default setupApi;