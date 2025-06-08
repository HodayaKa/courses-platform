// src/app/features/courses/courses.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ממשק לקורס ציור
export interface DrawingCourse {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  level: 'מתחילים' | 'מתקדמים' | 'מקצועיים';
  ageGroup: string;
  duration: string;
  materials: string[];
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = 'http://localhost:3000/api/courses';

  // נתוני דוגמה למקרה שאין API
  private demoData: DrawingCourse[] = [
    {
      id: 1,
      title: "ציור חיות חמודות",
      description: "קורס מהנה שבו נלמד לצייר חיות חמודות בצבעי מים",
      imageUrl: "assets/images/cute-animals.jpg",
      level: "מתחילים",
      ageGroup: "5-8",
      duration: "8 שבועות",
      materials: ["צבעי מים", "מכחולים", "נייר ציור"],
      price: 250
    },
    {
      id: 2,
      title: "נופים קסומים",
      description: "נלמד לצייר נופים מדהימים בצבעי פסטל",
      imageUrl: "assets/images/landscapes.jpg",
      level: "מתקדמים",
      ageGroup: "9-12",
      duration: "10 שבועות",
      materials: ["צבעי פסטל", "נייר מיוחד", "עפרונות"],
      price: 300
    },
    {
      id: 3,
      title: "דמויות מצוירות",
      description: "קורס שבו נלמד לצייר דמויות מצוירות בסגנון מנגה וקומיקס",
      imageUrl: "assets/images/cartoon-characters.jpg",
      level: "מתקדמים",
      ageGroup: "10-15",
      duration: "12 שבועות",
      materials: ["עפרונות צבעוניים", "טושים", "נייר ציור"],
      price: 350
    }
  ];

  constructor(private http: HttpClient) { }

  getCourses(): Observable<DrawingCourse[]> {
    // ניסיון לקבל נתונים מהשרת, אם נכשל - מחזיר נתוני דוגמה
    return this.http.get<DrawingCourse[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching courses from API, using demo data. Error:', error);
        return of(this.demoData);
      })
    );
  }

  getCourseById(id: number): Observable<DrawingCourse> {
    return this.http.get<DrawingCourse>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const course = this.demoData.find(c => c.id === id);
        if (course) {
          return of(course);
        }
        throw new Error('הקורס לא נמצא');
      })
    );
  }
}