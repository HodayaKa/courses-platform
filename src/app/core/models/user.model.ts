export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Admin = 'admin',
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole | string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends UserCredentials {
  name: string;
  role: UserRole | string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  userId: string;
  role: UserRole | string;
  name?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole | string;
}