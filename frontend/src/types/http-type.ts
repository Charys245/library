// Interface pour les réponses API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// Interface pour les erreurs API
export interface ApiError {
  message: string;
  status: number;
  data?: any;
}
