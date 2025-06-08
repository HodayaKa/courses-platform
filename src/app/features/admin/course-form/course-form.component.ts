import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../core/services/course.service'; // Import CourseService
import { LessonService } from '../../../core/services/lesson.service'; // Import LessonService
import { Course, CourseCreateData, CourseUpdateData } from '../../../core/models/course.model'; // Import Course model
import { Lesson } from '../../../core/models/lesson.model'; // Import Lesson model
import { Observable } from 'rxjs'; // Added for type hinting operation
import { AuthService } from '../../auth/auth.service';
import { ApplicationRef } from '@angular/core';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./course-form.component.scss'],
  template: `
    <div class="course-form-container">
      <h2>{{ isEditMode ? 'עריכת קורס' : 'יצירת קורס חדש' }}</h2>
      <form [formGroup]="courseForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">כותרת:</label>
          <input id="title" formControlName="title" placeholder="Course Title" class="form-control">
          <div *ngIf="courseForm.get('title')?.invalid && (courseForm.get('title')?.dirty || courseForm.get('title')?.touched)" class="error-message">
            Title is required.
          </div>
        </div>

        <div class="form-group">
          <label for="description">תיאור:</label>
          <textarea id="description" formControlName="description" placeholder="Course Description" class="form-control"></textarea>
          <div *ngIf="courseForm.get('description')?.invalid && (courseForm.get('description')?.dirty || courseForm.get('description')?.touched)" class="error-message">
            Description is required.
          </div>
        </div>

        <div class="form-group">
          <label for="price">מחיר:</label>
          <input id="price" type="number" formControlName="price" placeholder="Course Price" class="form-control">
          <div *ngIf="courseForm.get('price')?.invalid && (courseForm.get('price')?.dirty || courseForm.get('price')?.touched)" class="error-message">
            <span *ngIf="courseForm.get('price')?.errors?.['required']">Price is required.</span>
            <span *ngIf="courseForm.get('price')?.errors?.['min']">Price must be a positive number.</span>
          </div>
        </div>

        <!-- Add imageUrl field -->
        <div class="form-group">
          <label for="imageUrl">קישור לתמונה (אופציונלי):</label>
          <input id="imageUrl" formControlName="imageUrl" placeholder="http://example.com/image.jpg" class="form-control">
          <!-- Image Preview -->
          <div *ngIf="courseForm.get('imageUrl')?.value" style="margin-top: 10px;">
            <label>תצוגה מקדימה של התמונה:</label>
            <img [src]="courseForm.get('imageUrl')?.value" alt="Image Preview" style="max-width: 200px; max-height: 200px; border: 1px solid #ccc; display: block;">
          </div>
        </div>

        <!-- Duration Field -->
        <div class="form-group">
          <label for="duration">משך הקורס:</label>
          <input id="duration" formControlName="duration" placeholder="e.g., 6 weeks, 10 hours" class="form-control">
          <div *ngIf="courseForm.get('duration')?.invalid && (courseForm.get('duration')?.dirty || courseForm.get('duration')?.touched)" class="error-message">
            Duration is required.
          </div>
        </div>

        <!-- Level Field -->
        <div class="form-group">
          <label for="level">רמה:</label>
          <select id="level" formControlName="level" class="form-control">
            <option value="" disabled>בחר רמה</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <div *ngIf="courseForm.get('level')?.invalid && (courseForm.get('level')?.dirty || courseForm.get('level')?.touched)" class="error-message">
            Level is required.
          </div>
        </div>

        <!-- Age Range Field -->
        <div class="form-group">
          <label for="ageRange">טווח גילאים:</label>
          <input id="ageRange" formControlName="ageRange" placeholder="e.g., 18-25, 30+" class="form-control">
          <div *ngIf="courseForm.get('ageRange')?.invalid && (courseForm.get('ageRange')?.dirty || courseForm.get('ageRange')?.touched)" class="error-message">
            Age Range is required.
          </div>
        </div>

        <!-- Required Equipment Field -->
        <div class="form-group">
          <label for="requiredEquipment">ציוד נדרש (אופציונלי):</label>
          <textarea id="requiredEquipment" formControlName="requiredEquipment" placeholder="e.g., Laptop, Specific software" class="form-control"></textarea>
          <!-- No validation message needed as it's optional -->
        </div>

        <!-- Lesson Management Section (Only in Edit Mode) -->
        <div *ngIf="isEditMode && courseId" class="lesson-management-section">
          <h3>ניהול שיעורים</h3>
          <button type="button" (click)="addLesson()" class="btn btn-success add-lesson-button">הוסף שיעור חדש</button>

          <!-- Router outlet for lesson form -->
          <router-outlet></router-outlet>

          <div *ngIf="lessonsLoading" class="loading-message">טוען שיעורים...</div>
          <div *ngIf="lessonsError" class="error-message">{{ lessonsError }}</div>

          <ul *ngIf="!lessonsLoading && !lessonsError && lessons.length > 0" class="lessons-list">
            <li *ngFor="let lesson of lessons" class="lesson-item">
              <span>{{ lesson.title }}</span>
              <div class="lesson-actions">
                <button type="button" (click)="editLesson(lesson.id)" class="btn btn-secondary edit-button">Edit</button>
                <button type="button" (click)="deleteLesson(lesson.id)" class="btn btn-danger delete-button">Delete</button>
              </div>
            </li>
          </ul>
          <div *ngIf="!lessonsLoading && !lessonsError && lessons.length === 0" class="no-lessons-message">
            No lessons found for this course. Add one!
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="submitting || courseForm.invalid"> ||{{ submitting ? (isEditMode ? 'מעדכן...' : 'יוצר...') : (isEditMode ? 'עדכן קורס' : 'צור קורס') }}
          </button>
          <a routerLink="/admin/courses" class="btn btn-secondary cancel-button">Cancel</a>
        </div>
        <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
      </form>
    </div>
  `
})
export class CourseFormComponent implements OnInit {
  courseForm!: FormGroup;
  isEditMode = false;
  courseId: string | null = null;
  submitting = false;
  errorMessage: string | null = null;
  currentUserId: string | null = null; // Added to store current user's ID
  lessons: Lesson[] = [];
  lessonsLoading = false;
  lessonsError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService, // Inject CourseService
    private lessonService: LessonService, // Inject LessonService
    private authService: AuthService, // Inject AuthService
    private applicationRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId(); // Initialize currentUserId
    if (!this.currentUserId) {
      console.error('CourseFormComponent: User ID not found. Cannot perform operations.');
      this.errorMessage = 'User not authenticated. Please login again.';
      // Disable form if user ID is not available
      this.courseForm = this.fb.group({
        title: [{ value: '', disabled: true }],
        description: [{ value: '', disabled: true }],
        price: [{ value: null, disabled: true }],
        imageUrl: [{ value: '', disabled: true }]
      });
      this.courseForm.disable(); // Ensure form is disabled
      return;
    }

    this.courseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.courseId;

    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      imageUrl: [''], // Add imageUrl control
      duration: ['', Validators.required],
      level: ['', Validators.required],
      ageRange: ['', Validators.required],
      requiredEquipment: ['']
    });

    if (this.isEditMode && this.courseId) {
      this.loadCourseData(this.courseId);
      this.loadLessons(this.courseId);
    }
  }

  loadCourseData(id: string): void {
    this.submitting = true;
    // Authorization check: Ensure current user is the teacher of the course
    if (!this.currentUserId) { // Should have been caught in ngOnInit, but as a safeguard
        this.errorMessage = 'Authentication error. Cannot load course.';
        this.submitting = false;
        this.courseForm.disable();
        return;
    }
    this.courseService.getCourseById(id).subscribe({
      next: (course) => {
        console.log(`[CourseFormComponent] Data received for course ID ${id} for editing:`, JSON.stringify(course));
        console.log(`[CourseFormComponent] Type of price received for editing for course ${id}: ${typeof course.price}, value: ${course.price}`);

        // Authorization Check: Ensure the logged-in teacher owns this course
        if (this.currentUserId && course.teacherId !== +this.currentUserId) {
          console.warn(`[CourseFormComponent] Authorization failed: User ${this.currentUserId} attempted to edit course ${id} owned by ${course.teacherId}`);
          this.errorMessage = 'You are not authorized to edit this course.';
          this.submitting = false;
          this.courseForm.disable(); // Disable form if not authorized
          return;
        }

        const formData: Partial<Course> = {
          title: course.title,
          description: course.description,
          price: course.price,
          imageUrl: course.imageUrl, // Patch imageUrl
          duration: course.duration,
          level: course.level,
          ageRange: course.ageRange,
          requiredEquipment: course.requiredEquipment
        };
        this.courseForm.patchValue(formData);
        this.submitting = false;
      },
      
      error: (err) => {
        console.error('Error loading course data:', err);
        this.errorMessage = 'Failed to load course data. ' + (err.message || '');
        this.submitting = false;
      }
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.errorMessage = 'Please correct the form errors.';
      // Mark all fields as touched to display validation messages
      Object.keys(this.courseForm.controls).forEach(field => {
        const control = this.courseForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const courseData: Partial<Course> = {
      title: this.courseForm.value.title,
      description: this.courseForm.value.description,
      price: this.courseForm.value.price,
      imageUrl: this.courseForm.value.imageUrl,
      duration: this.courseForm.value.duration,
      level: this.courseForm.value.level,
      ageRange: this.courseForm.value.ageRange,
      requiredEquipment: this.courseForm.value.requiredEquipment
    };

    // Handle teacherId
    if (this.isEditMode && this.courseId) {
      // For updating, teacherId should already be part of the loaded course
      // and ideally not updatable directly by the form unless intended.
      // If your backend expects teacherId for updates, ensure it's correctly sourced.
      // For now, we assume the backend handles teacherId persistence or it's not changed.
      // If you need to send it, you might get it from the loaded course data or authService.
      // Example: courseData.teacherId = this.loadedCourseData.teacherId;
      // Or if it might change (less common for teacherId):
      // courseData.teacherId = +this.authService.getUserId(); // Ensure it's a number
    } else if (!this.isEditMode) {
      // For creating a new course, ensure teacherId is present
      const currentTeacherId = this.authService.getUserId();
      if (currentTeacherId) {
        courseData.teacherId = +currentTeacherId; // Convert to number if necessary
      } else {
        console.error('Could not get teacherId for create operation');
        this.errorMessage = 'Error: Could not verify teacher identity for course creation.';
        this.submitting = false;
        return;
      }
    }

    console.log('Submitting course data:', courseData);

    let operation: Observable<{ message: string; courseId?: string }>;

    if (this.isEditMode && this.courseId) {
      operation = this.courseService.updateCourse(this.courseId, courseData as CourseUpdateData);
    } else {
      operation = this.courseService.createCourse(courseData as CourseCreateData);
    }

    operation.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/admin/courses']);
      },
      error: (err) => {
        console.error('Error saving course:', err);
        this.errorMessage = 'Failed to save course. ' + (err.message || (err.error?.message || ''));
        this.submitting = false;
      }
    });
  }

  loadLessons(courseId: string): void {
    if (!courseId) return;
    this.lessonsLoading = true;
    this.lessonsError = null;
    this.lessonService.getLessonsByCourseId(courseId).subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        this.lessonsLoading = false;
      },
      error: (err) => {
        console.error('Error loading lessons:', err);
        this.lessonsError = 'Failed to load lessons. ' + (err.message || '');
        this.lessonsLoading = false;
      }
    });
  }

  addLesson(): void {
    console.log('[CourseFormComponent] addLesson clicked, courseId:', this.courseId);
    console.log('[CourseFormComponent] isStable on click:', this.applicationRef.isStable);
    if (this.courseId) {
      const targetRoute = ['/admin/courses/edit', this.courseId, 'lessons', 'new'];
      console.log('[CourseFormComponent] Attempting to navigate to absolute route:', targetRoute.join('/'));
      this.router.navigate(targetRoute)
        .then(success => {
          if (success) {
            console.log('[CourseFormComponent] Navigation to absolute route was successful.');
          } else {
            console.log('[CourseFormComponent] Navigation to absolute route failed or was cancelled. isStable after nav attempt:', this.applicationRef.isStable);
          }
        })
        .catch(err => {
          console.error('[CourseFormComponent] Navigation error in addLesson (absolute path):', err);
          this.errorMessage = 'Could not navigate to add lesson page (abs). Please try again.';
        });
    } else {
      console.error('CourseFormComponent: Cannot add lesson without a course ID.');
      this.errorMessage = 'Cannot add a lesson: Course ID is missing. Please save the course first or ensure the URL is correct.';
    }
  }

  editLesson(lessonId: string): void {
    if (this.courseId) {
      this.router.navigate(['/admin/courses/edit', this.courseId, 'lessons', lessonId, 'edit']);
    }
  }

  deleteLesson(lessonId: string): void {
    if (!this.courseId) {
      console.error('Course ID is missing, cannot delete lesson.');
      this.lessonsError = 'Cannot delete lesson: Course ID is missing.';
      return;
    }
    // Optional: Add a confirmation dialog here
    // if (!confirm('Are you sure you want to delete this lesson?')) {
    //   return;
    // }

    this.lessonService.deleteLesson(this.courseId!, lessonId).subscribe({
      next: () => {
        // Reload lessons after deletion
        this.loadLessons(this.courseId!);
      },
      error: (err) => {
        console.error('Error deleting lesson:', err);
        this.lessonsError = 'Failed to delete lesson. ' + (err.message || '');
      }
    });
  }
}
