// Suggested content for admin-course-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router'; // For "Create New Course" button
import { AuthService } from '../../auth/auth.service'; // Adjust path if necessary
import { Course } from '../../../core/models/course.model'; // Import shared Course interface
import { CourseService } from '../../../core/services/course.service'; // Import CourseService

@Component({
  selector: 'app-admin-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink], // NgForOf, NgIf are part of CommonModule
  templateUrl: './admin-course-list.component.html',
  styleUrls: ['./admin-course-list.component.scss']
})
export class AdminCourseListComponent implements OnInit {
  courses: Course[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  currentUserId: string | null = null;

  private authService = inject(AuthService);
  private courseService = inject(CourseService); // Inject CourseService
  private router = inject(Router);

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    if (this.currentUserId) {
      this.loadCourses();
    } else {
      this.errorMessage = 'Could not identify current user. Please log in again.';
      console.error('AdminCourseListComponent: User ID not found in AuthService.');
    }
  }

  loadCourses(): void {
    if (!this.currentUserId) {
      this.errorMessage = 'Cannot load courses without a user ID.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.courseService.getAllCourses().subscribe({
      next: (allCourses) => {
        // Filter courses by the current teacher's ID
        this.courses = allCourses.filter(course => course.teacherId && this.currentUserId && +course.teacherId === +this.currentUserId);
        this.isLoading = false;
        if (this.courses.length === 0) {
          console.log('No courses found for this teacher or an issue with teacherId matching.');
          // You might want to set a specific message if no courses are found vs. an error
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading courses:', error);
        this.errorMessage = `Failed to load courses. Status: ${error.status}. Message: ${error.message}`;
        if (error.error && typeof error.error === 'string') {
          this.errorMessage += ` Server: ${error.error}`;
        }
        this.isLoading = false;
      }
    });
  }

  // Placeholder for future methods
  editCourse(courseId: string): void {
    this.router.navigate(['/admin/courses/edit', courseId]);
  }

  deleteCourse(courseId: string): void {
    if (confirm(`Are you sure you want to delete course ID: ${courseId}? This action cannot be undone.`)) {
      this.isLoading = true; // Optional: show loading indicator
      this.errorMessage = ''; // Clear previous errors

      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.isLoading = false;
          // Remove the course from the local array to update UI immediately
          this.courses = this.courses.filter(course => course.id !== courseId);
          // Or, reload all courses from the server:
          // this.loadCourses(); 
          // Consider which approach is better. Filtering locally is faster for UI.
          console.log(`Course ${courseId} deleted successfully.`);
          // Optionally, show a success message to the user (e.g., using a toast notification service)
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error(`Error deleting course ${courseId}:`, err);
          this.errorMessage = `Failed to delete course. Status: ${err.status}. Message: ${err.message || err.error?.message || 'Unknown error'}`;
          // Optionally, show an error message to the user
        }
      });
    }
  }
}