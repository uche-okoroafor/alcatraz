import axios from "axios";
import { SERVER_URL } from "../endpoints";

const API_BASE_URL = SERVER_URL;

const signalApi = {
  add: async (newSetup) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/scanner-results`, newSetup);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  },

  update: async (signalId, payload) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/scanner-results/${signalId}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating signal with ID ${signalId}:`, error.response ? error.response.data : error.message);
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/scanner-results/${id}`);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  },

  getList: async ( page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scanner-results?page=${page}&limit=${limit}&sort=is_read^:asc`);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  },

  fetchScannerResult: async (scannerResultId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scanner-results/${scannerResultId}`);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

};

export default signalApi;