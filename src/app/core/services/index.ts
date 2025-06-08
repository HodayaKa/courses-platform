// src/app/core/models/index.ts
export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  teacherId: number;
  teacher?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCreateData {
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
}

export interface CourseUpdateData {
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
}

export interface CourseCreateResponse extends ApiResponse {
  courseId: number;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  courseId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonCreateData {
  title: string;
  content: string;
  order: number;
}

export interface LessonUpdateData {
  title?: string;
  content?: string;
  order?: number;
}

export interface EnrollmentData {
  userId?: number; // אופציונלי כי בדרך כלל נלקח מהטוקן
}