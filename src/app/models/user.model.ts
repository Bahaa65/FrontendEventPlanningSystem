export interface User {
  id?: string | number;
  username: string;
  email?: string;
  password?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  error?: string;
  message?: string;
  username?: string;
  email?: string;
}