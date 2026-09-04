import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import type { ApiError, ApiResponse } from "../types/http-type";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});


// Fonction utilitaire pour gérer les erreurs
const handleError = (error: AxiosError): ApiError => {
  if (error.response) {
    return {
      message:
        (error.response.data as any)?.message || "Une erreur est survenue",
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    return {
      message: "Erreur de réseau - Pas de réponse du serveur",
      status: 0,
    };
  } else {
    return {
      message: error.message || "Une erreur inattendue est survenue",
      status: 0,
    };
  }
};

// Fonctions HTTP principales
export const httpClient = {
  // GET Request
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },

  // POST Request
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },

  // PUT Request
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },

  // PATCH Request
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },

  // DELETE Request
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  },
};
