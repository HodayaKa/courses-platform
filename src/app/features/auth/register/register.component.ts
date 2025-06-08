// src/app/features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../../core/models/user.model'; // Import User for type checking
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule, // Added MatSelectModule here
    MatProgressSpinnerModule,
    RouterModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['student', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please ensure all fields are filled out correctly.';
      // Mark all fields as touched to display validation messages
      Object.values(this.registerForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = ''; // Clear previous error messages

    const formData = this.registerForm.value; // formData is RegisterData

    this.authService.register(formData).subscribe({
      next: (user: User | null) => {
        this.loading = false;
        if (user) {
          console.log('Registration successful, user data:', user);
          // Navigation is handled by AuthService, so no router.navigate here.
          // Component can show a success message if needed, but navigation is centralized.
        } else {
          // This case implies registration or user fetch failed but didn't throw an error 
          // that was caught by the 'error' block (e.g., if AuthService.register returns of(null) from a caught error).
          console.error('Registration completed but no user data returned by the service.');
          this.errorMessage = 'Registration process did not complete successfully. Please try again or contact support.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Registration failed in component', err);
        // err might be an HttpErrorResponse or an Error object from throwError in AuthService
        if (err.error && err.error.message) { // For HttpErrorResponse
          this.errorMessage = err.error.message;
        } else if (err.message) { // For Error objects
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Registration failed due to an unexpected error. Please try again.';
        }
      }
    });
  }
}
