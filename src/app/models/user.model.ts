export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  cpfHash?: string;
  createdAt: Date;
  updatedAt: Date;
  notificationSettings?: {
    soundEnabled: boolean;
    subjects: {
      petitionAccepted: boolean;
      petitionVoted: boolean;
      petitionStatusChanged: boolean;
      complaintVoted: boolean;
      complaintAccepted: boolean;
      complaintStatusChanged: boolean;
    };
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
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
