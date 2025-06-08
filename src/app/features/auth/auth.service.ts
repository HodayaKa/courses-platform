import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { User, AuthResponse, UserRole } from '../../core/models/user.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userIdKey = 'user_id';
  private userRoleKey = 'user_role';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (this.isBrowser()) {
      this.isAuthenticatedSubject.next(this.hasToken());
      this.loadUserData();
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(name: string, email: string, password: string, role: UserRole): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      name,
      email,
      password,
      role: role.toString()
    }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userIdKey);
      localStorage.removeItem(this.userRoleKey);
    }
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getUserId(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.userIdKey);
    }
    return null;
  }

  getUserRole(): UserRole | string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.userRoleKey) as UserRole | string | null;
    }
    return null;
  }

  isTeacher(): boolean {
    return this.getUserRole() === UserRole.Teacher;
  }

  isStudent(): boolean {
    return this.getUserRole() === UserRole.Student;
  }

  isAdmin(): boolean {
    return this.getUserRole() === UserRole.Admin;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response && response.token) {
      if (this.isBrowser()) {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userIdKey, response.userId); // userId is string from AuthResponse
        if (response.role) {
          localStorage.setItem(this.userRoleKey, response.role.toString()); // role is UserRole | string
        }
      }
      this.isAuthenticatedSubject.next(true);
      if (this.isBrowser()) { 
        this.loadUserData();
      }
    }
  }

  private loadUserData(): void {
    if (!this.isBrowser()) { 
        return;
    }
    const userId = this.getUserId();
    if (userId) {
      this.http.get<User>(`http://localhost:3000/api/users/${userId}`) // User is imported
        .subscribe({
          next: (user) => this.currentUserSubject.next(user),
          error: () => {
            // אם לא ניתן לטעון את נתוני המשתמש, נתנתק אותו
            this.logout();
          }
        });
    } else if (this.isBrowser()) {
      this.currentUserSubject.next(null);
    }
  }
}