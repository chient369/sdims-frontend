import apiClient from './axios';
import { AxiosRequestConfig } from 'axios';

export class BaseApiService {
  protected endpoint: string;
  
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }
  
  // GET all resources
  async getAll<T>(config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get<T, T>(this.endpoint, config);
  }
  
  // GET a single resource
  async getById<T>(id: string | number, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get<T, T>(`${this.endpoint}/${id}`, config);
  }
  
  // POST a new resource
  async create<T, D>(data: D, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post<T, T>(this.endpoint, data, config);
  }
  
  // PUT/PATCH to update a resource
  async update<T, D>(id: string | number, data: D, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put<T, T>(`${this.endpoint}/${id}`, data, config);
  }
  
  // PATCH to partially update a resource
  async patch<T, D>(id: string | number, data: D, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.patch<T, T>(`${this.endpoint}/${id}`, data, config);
  }
  
  // DELETE a resource
  async delete<T>(id: string | number, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete<T, T>(`${this.endpoint}/${id}`, config);
  }
  
  // Custom request method for more complex scenarios
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    return apiClient.request<T, T>(config);
  }
} 