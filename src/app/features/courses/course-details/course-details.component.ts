// src/app/features/courses/course-details/course-details.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Course, CourseApiResponse } from '../../../core/models/course.model'; // Corrected path
import { CourseService } from '../../../core/services/course.service'; // Corrected path
import { AuthService } from '../../../core/services/auth.service'; // Corrected path
import { User } from '../../../core/models/user.model'; // Assuming this is the correct path for User model
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContactFormComponent } from '../../../shared/components/contact-form/contact-form.component';
import { MatButtonModule } from '@angular/material/button'; // For potential Material buttons

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ContactFormComponent],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  course: Course | null = null;
  loading = true;
  error = '';

  isEnrolling = false;
  enrollmentSuccessMessage = '';
  enrollmentErrorMessage = '';

  private currentUserSubscription: Subscription | undefined;
  private currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        console.log('[CourseDetailsComponent] ngOnInit - currentUser updated from AuthService:', user);
      } else {
        this.currentUserId = null;
        console.log('[CourseDetailsComponent] ngOnInit - currentUser is null from AuthService.');
      }
    });

    const courseId = this.route.snapshot.paramMap.get('id');

    if (!courseId) {
      this.error = 'מזהה קורס לא סופק בנתיב.';
      this.loading = false;
      return;
    }

    this.courseService.getCourseById(courseId).subscribe({
      next: (data: Course) => { // Added type for data
        this.course = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => { // Added type for err
        this.error = 'לא הצלחנו למצוא את הקורס המבוקש. ייתכן שהמזהה שגוי או שהקורס אינו קיים.';
        this.loading = false;
        console.error('Error fetching course details:', err);
      }
    });
  }

  enrollInCourse(): void {
    console.log('[CourseDetailsComponent] enrollInCourse called.');
    console.log('[CourseDetailsComponent] Current User ID for enrollment check:', this.currentUserId);

    if (!this.course || !this.course.id) {
      this.enrollmentErrorMessage = 'מזהה קורס אינו זמין, לא ניתן להירשם.';
      return;
    }

    const userId = this.currentUserId;
    if (!userId) {
      this.enrollmentErrorMessage = 'יש להתחבר למערכת כדי להירשם לקורס.';
      // מומלץ להוסיף כאן ניתוב לדף ההתחברות, לדוגמה:
      // this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.isEnrolling = true;
    this.enrollmentSuccessMessage = '';
    this.enrollmentErrorMessage = '';

    this.courseService.enroll(this.course.id, userId).subscribe({
      next: (response: CourseApiResponse) => { // Added type for response
        this.isEnrolling = false;
        this.enrollmentSuccessMessage = 'נרשמת בהצלחה לקורס!';
        // כאן אפשר להוסיף לוגיקה נוספת אם צריך, כמו רענון פרטי המשתמש או הקורס
      },
      error: (err: HttpErrorResponse) => { // Added type for err
        this.isEnrolling = false;
        if (err.status === 409) { // Conflict - User might be already enrolled
          this.enrollmentErrorMessage = 'נראה שכבר נרשמת לקורס זה.';
        } else if (err.error && typeof err.error.message === 'string') {
          this.enrollmentErrorMessage = `שגיאה בהרשמה: ${err.error.message}`;
        } else if (typeof err.message === 'string') {
            this.enrollmentErrorMessage = `שגיאה בהרשמה: ${err.message}`;
        } else {
          this.enrollmentErrorMessage = 'אירעה שגיאה במהלך ההרשמה לקורס. נסו שנית מאוחר יותר.';
        }
        console.error('Enrollment error:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }

  openContactDialog(): void {
    const dialogRef = this.dialog.open(ContactFormComponent, {
      width: '500px',
      // autoFocus: false, // Consider if you want to disable auto-focus
      // disableClose: true // Consider if the dialog should only be closed via buttons
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Contact form submitted from CourseDetails:', result);
        // Here you could add a snackbar notification for success
        // For example: this.snackBar.open('פנייתך נשלחה בהצלחה!', 'סגור', { duration: 3000 });
      } else {
        console.log('Contact form cancelled or closed.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
      console.log('[CourseDetailsComponent] ngOnDestroy - Unsubscribed from currentUser.');
    }
  }
}