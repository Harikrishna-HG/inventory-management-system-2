export interface User {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  businessType: 'computer_electronics';
  createdAt: string;
  isActive: boolean;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
}

export interface SigninFormData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signin: (data: SigninFormData) => Promise<boolean>;
  signup: (data: SignupFormData) => Promise<boolean>;
  signout: () => void;
  isAuthenticated: boolean;
}
