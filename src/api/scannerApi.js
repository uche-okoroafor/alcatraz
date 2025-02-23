import axios from "axios";
import { SERVER_URL } from "../endpoints";

const API_BASE_URL = SERVER_URL;

const scannerApi = {
  add: async (newScanner) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/scanner`, newScanner);
      return response.data;
    } catch (error) {
      console.log('There was a problem with the fetch operation:', error);
    }
  },

  update: async (scannerId, updatedSetup) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/scanner/${scannerId}`, updatedSetup);
      return response.data;
    } catch (error) {
      console.log('There was a problem with the fetch operation:', error);
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/scanner/${id}`);
      return response.data;
    } catch (error) {
      console.log('There was a problem with the fetch operation:', error);
    }
  },

  getDetails: async (scannerId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scanner/${scannerId}`);
      return response.data;
    } catch (error) {
      console.log('There was a problem with the fetch operation:', error);
    }
  },

  fetchSetups: async (page, pageSize) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scanner?page=${page}&limit=${pageSize}&sort=created_at^:desc`);
      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  }
};

export default scannerApi;