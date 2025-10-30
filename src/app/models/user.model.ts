export interface User {
  id?: string;
  username?: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  error?: string;
}