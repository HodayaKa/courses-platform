import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthService } from './features/auth/auth.service';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CoursesListComponent } from './features/courses/courses-list/courses-list.component';
import { CourseDetailsComponent } from './features/courses/course-details/course-details.component';
import { AdminCourseListComponent } from './features/admin/admin-course-list/admin-course-list.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component'; // Added import
import { WelcomeComponent } from './features/welcome/welcome.component';


export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('[AuthGuard] Checking authentication. State URL:', state.url);
  if (authService.isLoggedIn()) {
    console.log('[AuthGuard] User is logged in. Allowing access.');
    return true;
  }
  
  // שמירת URL המקורי שהמשתמש ניסה לגשת אליו
  console.log('[AuthGuard] User not logged in. Redirecting to login.');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const TeacherRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[TeacherRoleGuard] Checking role. State URL:', state.url);
  const isLoggedIn = authService.isLoggedIn();
  const userRole = authService.getUserRole();
  console.log(`[TeacherRoleGuard] IsLoggedIn: ${isLoggedIn}, UserRole: ${userRole}`);

  if (isLoggedIn && userRole === 'teacher') {
    console.log('[TeacherRoleGuard] User is logged in and is a teacher. Allowing access.');
    return true;
  }

  // אם המשתמש לא מחובר, הפנה לדף ההתחברות
  if (!isLoggedIn) {
    console.log('[TeacherRoleGuard] User not logged in. Redirecting to login.');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // מחובר, אבל לא מורה. הפנה לדף הקורסים הכללי
  console.log('[TeacherRoleGuard] User is logged in but not a teacher. Redirecting to /courses.');
  router.navigate(['/courses']); 
  return false;
};

export const routes: Routes = [
  { 
    path: 'auth', 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  
   { path: '', redirectTo: '/welcome', pathMatch: 'full' }, // Changed to welcome
   { path: 'welcome', component: WelcomeComponent },
    { path: 'courses', component: CoursesListComponent },
    { path: 'courses/:id', component: CourseDetailsComponent },
  { 
    path: 'admin',
    canActivate: [AuthGuard, TeacherRoleGuard], // Protect admin routes
    children: [
      { path: '', redirectTo: 'courses', pathMatch: 'full' },
      {
        path: 'courses',
        component: AdminLayoutComponent, // Using a layout for admin section
        children: [
          { path: '', component: AdminCourseListComponent },
          {
            path: 'new',
            // Updated to use CourseFormComponent from its actual location
            loadComponent: () => import('./features/admin/course-form/course-form.component').then(m => m.CourseFormComponent),
            canActivate: [AuthGuard, TeacherRoleGuard]
          },
          {
            path: 'edit/:id',
            // Updated to use CourseFormComponent from its actual location
            loadComponent: () => import('./features/admin/course-form/course-form.component').then(m => m.CourseFormComponent),
            canActivate: [AuthGuard, TeacherRoleGuard],
            children: [
              {
                path: 'lessons/new',
                loadComponent: () => import('./features/admin/lesson-form/lesson-form.component').then(m => m.LessonFormComponent),
                canActivate: [AuthGuard, TeacherRoleGuard]
              },
              {
                path: 'lessons/:lessonId/edit',
                loadComponent: () => import('./features/admin/lesson-form/lesson-form.component').then(m => m.LessonFormComponent),
                canActivate: [AuthGuard, TeacherRoleGuard]
              }
            ]
          },
          // Routes for lesson management are likely within CourseFormComponent's template or a sub-router there
        ]
      },
      // Potentially other admin sections like user management, settings etc.
    ]
  },
    { path: '**', redirectTo: '/courses' } // Wildcard route must be last
  ];