import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // For create/edit dialogs later
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Course } from '../../../../core/models/course.model';
import { CourseService } from '../../../../core/services/course.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherCourseDialogComponent } from '../dialogs/teacher-course-dialog/teacher-course-dialog.component';

@Component({
  selector: 'app-manage-courses',
  templateUrl: './manage-courses.component.html',
  styleUrls: ['./manage-courses.component.css'],
  standalone: true, // Make component standalone
  imports: [      // Import necessary modules directly into the component
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule // For MatDialog functionality
  ]
})
export class ManageCoursesComponent implements OnInit {
  courses: Course[] = [];
  teacherId: string | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  // Columns for MatTable
  displayedColumns: string[] = ['title', 'description', 'duration', 'ageRange', 'level', 'imageUrl', 'actions'];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog // For opening dialogs
  ) {}

  ngOnInit(): void {
    this.teacherId = this.authService.getUserId();
    if (this.teacherId) {
      this.loadCourses();
    } else {
      this.errorMessage = 'Teacher ID not found. Please log in as a teacher.';
      this.isLoading = false;
    }
  }

  loadCourses(): void {
    if (!this.teacherId) {
      this.isLoading = false;
      this.errorMessage = 'Cannot load courses without a teacher ID.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.courseService.getAllCourses().pipe(
      map(courses => courses.filter(course => course.teacherId === this.teacherId)),
      catchError(error => {
        console.error('Failed to load courses from backend:', error);
        this.errorMessage = 'Failed to load courses. ';
        // Check for the specific backend error for missing price column
        if (error && error.status === 500 && error.message && error.message.includes('SQLITE_ERROR: no such column: price')) {
            this.errorMessage += 'The server had an issue with course pricing. ';
        }
        this.errorMessage += 'Attempting to load demo courses as a fallback.';
        console.warn(this.errorMessage);
        // Ensure demo courses are also filtered by teacherId
        const demoCoursesForTeacher = this.courseService.getDemoCourses().filter(course => course.teacherId === this.teacherId);
        return of(demoCoursesForTeacher);
      })
    ).subscribe({
      next: (filteredCourses) => {
        this.courses = filteredCourses;
        this.isLoading = false;
        if (filteredCourses.length === 0 && !this.errorMessage) {
          this.errorMessage = 'No courses found for this teacher.';
        }
      },
      error: (err) => { // Should ideally not be hit if catchError returns an observable
        console.error('Critical error in loadCourses subscription:', err);
        this.isLoading = false;
        this.courses = [];
        this.errorMessage = 'An unexpected error occurred while loading courses.';
      }
    });
  }

  openCreateCourseDialog(): void {
    if (!this.teacherId) {
      this.errorMessage = "Cannot create a course without a teacher ID.";
      return;
    }
    const dialogRef = this.dialog.open(TeacherCourseDialogComponent, {
      width: '600px', // Adjusted width for more fields
      data: { course: null, teacherId: this.teacherId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.loadCourses(); // Reload the list
      }
    });
  }

  editCourse(course: Course): void {
    if (!this.teacherId) {
      this.errorMessage = "Cannot edit a course without a teacher ID.";
      // Or handle more gracefully, e.g., disable edit buttons if teacherId is missing
      return;
    }
    const dialogRef = this.dialog.open(TeacherCourseDialogComponent, {
      width: '600px', // Adjusted width
      data: { course: course, teacherId: this.teacherId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Option 1: Reload all courses
        this.loadCourses();

        // Option 2: Update specific course in the list (more efficient)
        // const index = this.courses.findIndex(c => c.id === result.course.id);
        // if (index > -1 && result.course) {
        //   this.courses[index] = result.course;
        //   this.courses = [...this.courses]; // Trigger change detection for the table
        // } else {
        //   this.loadCourses(); // Fallback if course not found or data incomplete
        // }
      }
    });
  }

  deleteCourse(courseId: string): void {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          alert('Course deleted successfully');
          this.loadCourses(); // Refresh the list
        },
        error: (err) => {
          console.error('Error deleting course:', err);
          alert('Failed to delete course. ' + (err.error?.message || err.message));
        }
      });
    }
  }

  manageLessons(courseId: string): void {
    this.router.navigate(['/teacher/courses', courseId, 'lessons']);
    // Make sure this route is defined and leads to a LessonManagementComponent
  }
}
