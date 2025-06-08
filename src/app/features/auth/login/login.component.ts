import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User, AuthResponse } from '../../../core/models/user.model'; // Ensure User is imported
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    RouterModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    console.log('[LoginComponent] onSubmit called.');
    if (this.loginForm.invalid) { // Check for invalid form first
      console.log('[LoginComponent] Form is invalid.');
      this.errorMessage = 'Please fill in all required fields correctly.';
      // Mark all fields as touched to display validation messages
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    console.log('[LoginComponent] Form is valid, proceeding to login.');
    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.authService.performLogin({ email, password }).subscribe({
      next: (user: User | null) => { // Updated type to User | null
        // Navigation is now handled by AuthService.performLogin
        // We can log success or update UI if needed, but no navigation here.
        if (user) {
          console.log('Login successful from LoginComponent, user data:', user);
        } else {
          // This case implies login or user fetch failed but didn't throw an error 
          // that was caught by the 'error' block (e.g., if AuthService.performLogin returns of(null)).
          console.error('Login completed but no user data returned by the service.');
          // The error message might have been set by AuthService, or we can set a generic one.
          // If AuthService.performLogin already sets currentUserSubject to null and clears data,
          // this component might not need to do much more than display an error if not already handled.
          if (!this.errorMessage) { // Avoid overwriting a more specific error from the service
             this.errorMessage = 'Login process did not complete successfully. Please try again.';
          }
        }
      },
      error: (err: any) => { // Type can be HttpErrorResponse or Error
        console.error('Login failed in LoginComponent', err);
        this.loading = false; // Ensure loading is set to false on error
        // err might be an HttpErrorResponse or an Error object from throwError in AuthService
        if (err.error && err.error.message) { // For HttpErrorResponse
          this.errorMessage = err.error.message;
        } else if (err.message) { // For Error objects
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Login failed due to an unexpected error. Please check your credentials.';
        }
      },
      complete: () => {
        this.loading = false; // Ensure loading is set to false on completion
        console.log('[LoginComponent] Login observable completed.');
      }
    });
  }
}