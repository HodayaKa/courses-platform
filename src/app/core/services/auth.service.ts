console.error('<<<<< TOP LEVEL LOG IN auth.service.ts - IF YOU SEE THIS, THE FILE IS RELOADING! >>>>>');
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, switchMap, map, of } from 'rxjs'; // Added 'of' for error handling in switchMap
import { User, AuthResponse, UserRole, RegisterData } from '../models/user.model'; // Added RegisterData // Ensure UserRole is imported if used in navigateUser etc.

// Removed local AuthResponse interface as it's now imported

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // From MEMORY
  private usersApiUrl = 'http://localhost:3000/api/users'; // New API URL for users
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_ID_KEY = 'userId';
  private readonly USER_ROLE_KEY = 'userRole';
  private readonly USER_NAME_KEY = 'userName';


  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let initialUser: User | null = null;
    if (isPlatformBrowser(this.platformId)) {
      console.log('[AuthService] Constructor: Attempting to load user from localStorage.');
      const token = localStorage.getItem(this.TOKEN_KEY);
      const storedUserId = localStorage.getItem(this.USER_ID_KEY);
      const storedUserRole = localStorage.getItem(this.USER_ROLE_KEY) as UserRole | string | null;
      const storedUserName = localStorage.getItem(this.USER_NAME_KEY);

      console.log(`[AuthService] Constructor: Retrieved from localStorage - Token: ${token ? 'Exists' : 'null'}, UserID: ${storedUserId}, UserRole: ${storedUserRole}, UserName: ${storedUserName}`);

      if (token && storedUserId && storedUserRole && storedUserName) {
        initialUser = {
          id: storedUserId,
          role: storedUserRole,
          name: storedUserName,
        };
        console.log('[AuthService] Constructor: Successfully reconstructed user from localStorage:', initialUser);
      } else {
        console.log('[AuthService] Constructor: Could not reconstruct user from localStorage due to missing items.');
      }
    } else {
      console.log('[AuthService] Constructor: Not in browser platform, skipping localStorage check.');
    }
    console.log('[AuthService] Constructor: Final initialUser before setting subject:', initialUser);
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  performLogin(credentials: { email: string, password: string }): Observable<User | null> {
    console.log('[AuthService] performLogin: Initiating login process for email:', credentials.email);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      switchMap((loginResponse: AuthResponse) => {
        console.log('[AuthService] performLogin: Login API call successful. Response:', loginResponse);
        if (!loginResponse.token || !loginResponse.userId || !loginResponse.role) {
          console.error('[AuthService] performLogin: Login response missing critical data.', loginResponse);
          this.currentUserSubject.next(null); // Clear user on partial/bad login response
          return throwError(() => new Error('Login response incomplete.'));
        }

        // Store token immediately for subsequent requests
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.TOKEN_KEY, loginResponse.token);
        }
        
        console.log(`[AuthService] performLogin: Fetching user details for userId: ${loginResponse.userId}`);
        return this.http.get<User>(`${this.usersApiUrl}/${loginResponse.userId}`).pipe(
          map((user: User) => {
            console.log('[AuthService] performLogin: User details fetched successfully:', user);
            if (!user || !user.name) { 
              console.error('[AuthService] performLogin: Fetched user data is incomplete or name is missing.', user);
              throw new Error('Fetched user details are incomplete (name missing).');
            }

            const fullUser: User = {
              id: String(loginResponse.userId), 
              name: user.name,                 
              email: user.email,               
              role: loginResponse.role,        
            };
            
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem(this.USER_ID_KEY, fullUser.id);
              localStorage.setItem(this.USER_ROLE_KEY, fullUser.role as string);
              localStorage.setItem(this.USER_NAME_KEY, fullUser.name);
            }
            
            this.currentUserSubject.next(fullUser);
            console.log('[AuthService] performLogin: currentUserSubject updated with full user:', fullUser);
            this.navigateUser(fullUser);
            return fullUser;
          }),
          catchError(err => {
            console.error('[AuthService] performLogin: Error fetching user details:', err);
            this.clearAuthDataAndLogout(); 
            return throwError(() => new Error('Failed to fetch user details after login.'));
          })
        );
      }),
      catchError(error => {
        console.error('[AuthService] performLogin: Login HTTP error or downstream error:', error);
        this.clearAuthDataAndLogout();
        return throwError(() => new Error('Login failed. Please check credentials or server status.'));
      })
    );
  }

  // Helper method for navigation
  private navigateUser(user: User | null): void {
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }
    console.log(`[AuthService] navigateUser: Navigating based on role: ${user.role}`);
    if (user.role === UserRole.Teacher) {
      this.router.navigate(['/teacher/manage-courses']);
    } else if (user.role === UserRole.Admin) {
      this.router.navigate(['/admin/dashboard']); // Example admin route
    } else if (user.role === UserRole.Student) {
      this.router.navigate(['/courses']);
    } else {
      this.router.navigate(['/']); // Default fallback
    }
  }
  
  // Helper method to clear auth data and subject (used in error cases and logout)
  private clearAuthDataAndLogout(): void {
    console.log('[AuthService] clearAuthDataAndLogout: Clearing authentication data.');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_ID_KEY);
      localStorage.removeItem(this.USER_ROLE_KEY);
      localStorage.removeItem(this.USER_NAME_KEY);
    }
    this.currentUserSubject.next(null);
  }

  /*
  private processAuthResponse(response: AuthResponse): void {
    console.log('%cENTERING ****NEWLY UPDATED**** handleAuthentication. Response received:', 'color: red; font-weight: bold;', JSON.stringify(response)); // New prominent log
    console.log('[AuthService] Raw login response:', response);
    if (isPlatformBrowser(this.platformId)) {
      if (response.token && response.userId && response.role) {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_ID_KEY, String(response.userId));
        localStorage.setItem(this.USER_ROLE_KEY, response.role as string);
        
        let userName = response.name || (response as any).username;
        if (!userName) {
          userName = `User ${response.userId}`;
          console.warn(`[AuthService] handleAuthentication: User name not found in response. Using generated name: "${userName}". Response was:`, response);
        } else {
          console.log(`[AuthService] handleAuthentication: User name from response: "${userName}".`);
        }
        console.log(`[AuthService] handleAuthentication: ---- BEFORE saving userName to localStorage. Key: "${this.USER_NAME_KEY}", Value: "${userName}"`);
        localStorage.setItem(this.USER_NAME_KEY, userName);
        const checkUserName = localStorage.getItem(this.USER_NAME_KEY);
        console.log(`---- AFTER attempting to save userName. Key: ${this.USER_NAME_KEY}, Value retrieved from localStorage immediately after setItem: '${checkUserName}'`);

        const user: User = {
          id: String(response.userId),
          role: response.role,
          name: userName,
        };
        console.log('[AuthService] handleAuthentication (Browser): setting currentUserSubject with user:', user);
        this.currentUserSubject.next(user);

        if (user.role === UserRole.Teacher) {
            this.router.navigate(['/teacher/manage-courses']);
        } else if (user.role === UserRole.Admin) {
            this.router.navigate(['/admin/courses']);
        } else if (user.role === UserRole.Student) {
            this.router.navigate(['/courses']);
        } else {
            this.router.navigate(['/']);
        }
      } else {
        console.error('Authentication response missing critical data:', response);
        this.currentUserSubject.next(null);
      }
    } else {
        // SSR: Update user subject without localStorage if data is valid
        if (response.token && response.userId && response.role) {
            const userName = response.name || (response as any).username || 'User';
            const user: User = {
              id: String(response.userId),
              role: response.role,
              name: userName,
            };
            console.log('[AuthService] handleAuthentication (SSR): setting currentUserSubject with user:', user);
            this.currentUserSubject.next(user);
        } else {
            this.currentUserSubject.next(null);
        }
    }
  }
  */

  logout(): void {
    console.log('[AuthService] logout: Starting logout process.');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_ID_KEY);
      localStorage.removeItem(this.USER_ROLE_KEY);
      localStorage.removeItem(this.USER_NAME_KEY);
    }
    console.log('[AuthService] logout: Setting currentUserSubject to null.');
    this.clearAuthDataAndLogout(); // Use the helper
    this.router.navigate(['/auth/login']); // Explicit navigation on logout
  }

  // register method refactored to fetch full user details.
  register(userData: RegisterData): Observable<User | null> { // Changed userData type and return type
    console.warn('[AuthService] register: Initiating registration process.');
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      switchMap((regResponse: AuthResponse) => {
        console.log('[AuthService] register: Registration API call successful. Response:', regResponse);
        if (!regResponse.token || !regResponse.userId) {
          console.error('[AuthService] register: Registration response missing token or userId.', regResponse);
          this.clearAuthDataAndLogout(); // Clear any partial data
          return throwError(() => new Error('Registration response incomplete.'));
        }

        // Store token immediately
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.TOKEN_KEY, regResponse.token);
        }

        // Now fetch the full user details
        return this.http.get<User>(`${this.usersApiUrl}/${regResponse.userId}`).pipe(
          map((userDetails: User) => {
            console.log('[AuthService] register: Fetched user details successfully:', userDetails);
            if (!userDetails || !userDetails.id || !userDetails.role || !userDetails.name) {
                console.error('[AuthService] register: Fetched user details are incomplete.', userDetails);
                this.clearAuthDataAndLogout(); // Clear token and log out
                return null; // Propagate null to subscriber
            }
            
            const fullUser: User = {
              id: String(userDetails.id), // Ensure id is string
              name: userDetails.name,
              role: userDetails.role,
              email: userDetails.email // Optional, but good to have if API returns it
            };

            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem(this.USER_ID_KEY, fullUser.id);
              localStorage.setItem(this.USER_ROLE_KEY, fullUser.role as string);
              localStorage.setItem(this.USER_NAME_KEY, fullUser.name);
              // Token is already stored
            }
            this.currentUserSubject.next(fullUser);
            this.navigateUser(fullUser); // Navigate based on role
            return fullUser;
          }),
          catchError(error => {
            console.error('[AuthService] register: Failed to fetch user details after registration.', error);
            this.clearAuthDataAndLogout(); // Clear token and log out
            return of(null); // Return Observable<null> for the subscriber
          })
        );
      }),
      catchError(error => {
        console.error('[AuthService] register: Registration API call failed.', error);
        this.clearAuthDataAndLogout();
        return throwError(() => new Error('Registration failed.')); // Propagate error
      })
    );
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getUserId(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.USER_ID_KEY);
    }
    return null;
  }

  getUserRole(): UserRole | string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.USER_ROLE_KEY) as UserRole | string | null;
    }
    return null;
  }

  getUserName(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.USER_NAME_KEY);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && (isPlatformBrowser(this.platformId) ? !!this.getToken() : !!this.currentUserSubject.value?.id);
  }

  isTeacher(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === UserRole.Teacher;
  }

  // Optional: if you have an admin role
  isAdmin(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === UserRole.Admin;
  }
}
