import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './features/auth/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ]
  },
  
    { 
        path: 'courses',
        loadComponent: () => import('./features/courses/courses-list/courses-list.component').then(c => c.CoursesListComponent),
        canActivate: [AuthGuard]
      }
      ,
  {
    path: 'admin/courses',
    loadComponent: () => import('./features/admin/admin-course-list/admin-course-list.component').then(c => c.AdminCourseListComponent),
    canActivate: [AuthGuard] // TODO: Add AdminGuard
  },
  {
    path: 'teacher/manage-courses',
    loadComponent: () => import('./features/teacher/components/manage-courses/manage-courses.component').then(c => c.ManageCoursesComponent),
    canActivate: [AuthGuard] // TODO: Add TeacherGuard
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }