// src/app/features/courses/courses-list/courses-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoursesService, DrawingCourse } from '../courses.service';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss']
})
export class CoursesListComponent implements OnInit {
  courses: DrawingCourse[] = [];
  loading = false;
  error = '';

  constructor(private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.loading = true;
    this.coursesService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'אירעה שגיאה בטעינת הקורסים';
        this.loading = false;
        console.error(err);
      }
    });
  }
}