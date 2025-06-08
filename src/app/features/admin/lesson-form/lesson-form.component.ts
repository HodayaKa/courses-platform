import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LessonService } from '../../../core/services/lesson.service';
import { Lesson, LessonUpdateData } from '../../../core/models/lesson.model'; // Removed LessonCreateData import

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './lesson-form.component.html',
  styleUrls: ['./lesson-form.component.scss']
})
export class LessonFormComponent implements OnInit {
  lessonForm: FormGroup;
  isEditMode = false;
  courseId: string | null = null;
  lessonId: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService
  ) {
    console.log('[LessonFormComponent] Constructor called');
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.courseId = this.route.parent?.snapshot.paramMap.get('id') ?? null;
    this.lessonId = this.route.snapshot.paramMap.get('lessonId');

    if (this.lessonId && this.courseId) {
      this.isEditMode = true;
      this.loadLessonData();
    } else if (!this.courseId) {
      this.errorMessage = 'Course ID is missing. Cannot create or edit a lesson.';
      // Optionally, navigate away or disable the form
      this.lessonForm.disable();
    }
  }

  loadLessonData(): void {
    if (!this.courseId || !this.lessonId) return;
    this.isLoading = true;
    this.lessonService.getLessonById(this.courseId!, this.lessonId!).subscribe({
      next: (lesson) => {
        this.lessonForm.patchValue(lesson);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Failed to load lesson data: ${err.message || err.statusText || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.lessonForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    if (!this.courseId) {
      this.errorMessage = 'Cannot save lesson without a Course ID.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const lessonData = this.lessonForm.value;

    if (this.isEditMode && this.lessonId) {
      const updatePayload: LessonUpdateData = {
        title: lessonData.title,
        content: lessonData.content,
      };
      this.lessonService.updateLesson(this.courseId!, this.lessonId!, updatePayload).subscribe({
        next: () => {
          this.isLoading = false;
          // Navigate back to the course edit page or a lesson list page
          this.router.navigate(['/admin/courses/edit', this.courseId]);
        },
        error: (err) => {
          this.errorMessage = `Failed to update lesson: ${err.message || err.statusText || 'Unknown error'}`;
          this.isLoading = false;
        }
      });
    } else {
      // For create, courseId is part of LessonCreateData if your API requires it in the body
      // Otherwise, it's only in the URL. Our current model LessonCreateData includes courseId.
      // However, the API spec for POST /api/courses/:courseId/lessons (title, content) implies courseId is from URL.
      // Let's assume LessonCreateData should NOT include courseId for the payload.
      const createPayload: { title: string, content: string } = {
        title: lessonData.title,
        content: lessonData.content
      }; // This matches the updated service method signature
      this.lessonService.createLesson(this.courseId!, createPayload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/courses/edit', this.courseId]);
        },
        error: (err) => {
          this.errorMessage = `Failed to create lesson: ${err.message || err.statusText || 'Unknown error'}`;
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.courseId) {
      this.router.navigate(['/admin/courses/edit', this.courseId]); // Navigate back to course edit or list
    } else {
      this.router.navigate(['/admin/courses']); // Fallback navigation
    }
  }
}
