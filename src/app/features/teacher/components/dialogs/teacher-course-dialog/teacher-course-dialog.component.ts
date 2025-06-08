import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Course, CourseCreateData, CourseUpdateData } from '../../../../../core/models/course.model'; // Corrected path, Added Create/Update types
import { CourseService } from '../../../../../core/services/course.service'; // Added CourseService

export interface TeacherCourseDialogData {
  course?: Course; // Optional: for editing existing course
  teacherId: string;
}

@Component({
  selector: 'app-teacher-course-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule // Added MatDialogModule
  ],
  templateUrl: './teacher-course-dialog.component.html',
  styleUrls: ['./teacher-course-dialog.component.css']
})
export class TeacherCourseDialogComponent implements OnInit {
  courseForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;

  // Options for level - can be expanded or fetched from a service
  levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TeacherCourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TeacherCourseDialogData,
    private courseService: CourseService // Injected CourseService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.course;
    this.courseForm = this.fb.group({
      title: [this.data.course?.title || '', Validators.required],
      description: [this.data.course?.description || '', Validators.required],
      imageUrl: [this.data.course?.imageUrl || ''],
      duration: [this.data.course?.duration || '', Validators.required],
      ageRange: [this.data.course?.ageRange || '', Validators.required],
      level: [this.data.course?.level || 'All Levels', Validators.required],
      requiredEquipment: [this.data.course?.requiredEquipment || '']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const formValue = this.courseForm.value;

    if (this.isEditMode && this.data.course?.id) {
      // Update existing course
      const courseUpdateData: CourseUpdateData = {
        title: formValue.title,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
        duration: formValue.duration,
        ageRange: formValue.ageRange,
        level: formValue.level,
        requiredEquipment: formValue.requiredEquipment, // Added requiredEquipment
        // teacherId is typically not updated, and price is not in this form
      };

      this.courseService.updateCourse(this.data.course.id, courseUpdateData).subscribe({
        next: (response) => { // Assuming CourseApiResponse
          this.isLoading = false;
          // Pass back an object indicating success and the updated course data (or at least ID)
          // The parent component might want to refetch or use the data from the form
          this.dialogRef.close({ success: true, course: { ...this.data.course, ...courseUpdateData } });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to update course. ' + (err.error?.message || err.message || 'Server error');
          console.error('Error updating course:', err);
        }
      });
    } else {
      // Create new course
      const courseCreateData: CourseCreateData = {
        title: formValue.title,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
        teacherId: Number(this.data.teacherId), // Crucial for new courses, converted to number
        duration: formValue.duration,
        ageRange: formValue.ageRange,
        level: formValue.level,
        requiredEquipment: formValue.requiredEquipment, // Added requiredEquipment
        // price is not included in this form
      };

      this.courseService.createCourse(courseCreateData).subscribe({
        next: (response) => { // Assuming CourseApiResponse
          this.isLoading = false;
          // Pass back an object indicating success and the new course data (including new ID from response)
          this.dialogRef.close({ success: true, course: { ...courseCreateData, id: response.courseId } });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create course. ' + (err.error?.message || err.message || 'Server error');
          console.error('Error creating course:', err);
        }
      });
    }
  }
}
