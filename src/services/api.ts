// API Configuration and client setup
// This service provides centralized API communication with automatic error handling

import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config)
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config)
  }

  async delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config)
  }

  getClient() {
    return this.client
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
