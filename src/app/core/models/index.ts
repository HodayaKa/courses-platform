export * from './user.model';
export * from './course.model';
export * from './lesson.model';
export * from './api-response.model';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}