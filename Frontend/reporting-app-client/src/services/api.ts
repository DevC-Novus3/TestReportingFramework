import axios from 'axios';
import { DataSource, DataSourceRequest, NodeRedData, ReportRequest } from '../types';

const API_BASE_URL = 'http://localhost:5080/api';

export const dataService = {
  getDataSources: async (): Promise<DataSource[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/data/sources`);
      return response.data;
    } catch (error) {
      console.error('Error fetching data sources:', error);
      throw error;
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/data/sources/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getDataSourcesByCategory: async (category: string): Promise<DataSource[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/data/sources/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching data sources by category:', error);
      throw error;
    }
  },

  getSchema: async (request: DataSourceRequest): Promise<NodeRedData> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/data/schema`, request);
      return response.data;
    } catch (error) {
      console.error('Error fetching schema:', error);
      throw error;
    }
  },

  getData: async (request: DataSourceRequest): Promise<Record<string, any>[]> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/data/data`, request);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },

  generateReport: async (request: ReportRequest): Promise<Blob> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/report/generate`, request, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  testConnection: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/report/test`);
      return response.status === 200;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
};