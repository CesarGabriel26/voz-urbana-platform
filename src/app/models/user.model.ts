export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  cpf: string;
  password?: string;
}

export interface SignupRequest {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone?: string;
  password?: string;
}
