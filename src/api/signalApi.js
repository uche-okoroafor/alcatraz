import axios from "axios";
import { SERVER_URL } from "../endpoints";

const API_BASE_URL = SERVER_URL;

const signalApi = {
  add: async (newSetup) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/setup-strategy`, newSetup);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  },

  update: async (updatedSetup) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/setup-strategy/${updatedSetup.id}`, updatedSetup);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/setup-strategy/${id}`);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  },

  fetchSignals: async (setupId, page, limit) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/signals?filters=setup_id^:${setupId}&page=${page}&limit=${limit}&sort=created_at^:desc`);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  }

};

export default signalApi;