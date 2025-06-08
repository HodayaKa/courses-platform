// src/app/core/services/lesson.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson, LessonCreateData, LessonUpdateData, ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

// Define a more specific response type for lesson creation
export interface LessonCreationResponse {
  message: string;
  lessonId: string;
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  constructor(private http: HttpClient) {}

  getLessonsByCourseId(courseId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${environment.apiUrl}/courses/${courseId}/lessons`);
  }

  getLessonById(courseId: string, lessonId: string): Observable<Lesson> {
    return this.http.get<Lesson>(`${environment.apiUrl}/courses/${courseId}/lessons/${lessonId}`);
  }

  createLesson(courseId: string, lessonData: LessonCreateData): Observable<LessonCreationResponse> {
    return this.http.post<LessonCreationResponse>(`${environment.apiUrl}/courses/${courseId}/lessons`, lessonData);
  }

  updateLesson(courseId: string, lessonId: string, lessonData: LessonUpdateData): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${environment.apiUrl}/courses/${courseId}/lessons/${lessonId}`, lessonData);
  }

  deleteLesson(courseId: string, lessonId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${environment.apiUrl}/courses/${courseId}/lessons/${lessonId}`);
  }
}