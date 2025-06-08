import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Course, CourseCreateData, CourseUpdateData, CourseApiResponse } from '../models/course.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  private demoCourses: Course[] = [
    { id: 'demo1', title: 'Demo Angular Basics', description: 'Learn the basics of Angular (Demo Data)', teacherId: 1, price: 49.99, imageUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=Angular' },
    { id: 'demo2', title: 'Demo Advanced Angular', description: 'Deep dive into Angular components and services (Demo Data)', teacherId: 1, price: 99.99, imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=AngularPro' },
    { id: 'demo3', title: 'Demo Node.js for Beginners', description: 'Backend development with Node.js (Demo Data)', teacherId: 2, price: 79.00, imageUrl: 'https://via.placeholder.com/150/00FF00/000000?Text=NodeJS' }
  ];

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl).pipe(
      catchError((err) => this.handleError(err, 'getAllCourses'))
    );
  }

  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err, `getCourseById id=${id}`))
    );
  }

  createCourse(courseData: CourseCreateData): Observable<CourseApiResponse> {
    return this.http.post<CourseApiResponse>(this.apiUrl, courseData).pipe(
      catchError((err) => this.handleError(err, 'createCourse'))
    );
  }

  updateCourse(id: string, courseData: CourseUpdateData): Observable<CourseApiResponse> {
    return this.http.put<CourseApiResponse>(`${this.apiUrl}/${id}`, courseData).pipe(
      catchError((err) => this.handleError(err, `updateCourse id=${id}`))
    );
  }

  deleteCourse(id: string): Observable<CourseApiResponse> {
    return this.http.delete<CourseApiResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err, `deleteCourse id=${id}`))
    );
  }

  enroll(courseId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${courseId}/enroll`, { userId }).pipe(
      catchError((err) => this.handleError(err, `enroll courseId=${courseId}`))
    );
  }

  getDemoCourses(): Course[] {
    console.warn('Using demo courses due to a previous error or configuration.');
    return JSON.parse(JSON.stringify(this.demoCourses)); // Return a deep copy
  }

  private handleError(error: HttpErrorResponse, operation: string = 'operation'): Observable<never> {
    let errorMessage = `An unknown error occurred during ${operation}!`;
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error during ${operation}: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error during ${operation}: Code ${error.status}, Body: ${JSON.stringify(error.error)}`;
      if (error.status === 500 && error.error && typeof error.error === 'object' && 'error' in error.error && typeof error.error.error === 'string' && error.error.error.includes('SQLITE_ERROR: no such column: price')) {
        console.warn(`Backend error during ${operation}: "no such column: price". This might trigger fallback to demo data in components.`);
        // Return the error so components can decide to use demo data
        return throwError(() => error);
      }
    }
    console.error(errorMessage, error);
    return throwError(() => new Error(`Operation ${operation} failed. ${errorMessage}`));
  }
}