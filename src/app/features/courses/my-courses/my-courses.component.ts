import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../features/auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css']
})
export class MyCoursesComponent implements OnInit {
  enrolledCourses$: Observable<Course[]> = of([]);
  isLoading = true;
  error: string | null = null;
  currentUserId: number | null = null;

  constructor(
    public authService: AuthService, // Made public for template access
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();

    if (this.currentUserId) {
      this.loadEnrolledCourses(this.currentUserId);
    } else {
      this.error = 'User not logged in or user ID not available. Please log in to see your courses.';
      this.isLoading = false;
    }
  }

  loadEnrolledCourses(userId: number): void {
    this.isLoading = true;
    this.error = null;
    this.enrolledCourses$ = this.courseService.getEnrolledCourses(userId).pipe(
      catchError(err => {
        console.error('Error loading enrolled courses:', err);
        this.error = 'Failed to load your courses. Please try again later.';
        return of([]); // Return an empty array on error to prevent breaking the template
      }),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }
}
