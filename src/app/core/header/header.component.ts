import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../features/auth/auth.service';
import { UserRole } from '../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  currentUserFullName$!: Observable<string | undefined>;
  isTeacher$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map(user => !!user));
    this.currentUserFullName$ = this.authService.currentUser$.pipe(map(user => user?.name));
    // We can derive isTeacher and isAdmin from currentUser's role
    this.isTeacher$ = this.authService.currentUser$.pipe(
      map(user => user?.role === UserRole.Teacher)
    );
    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => user?.role === UserRole.Admin)
    );
  }

  logout(): void {
    this.authService.logout();
    // The authService.logout() method should handle navigation.
  }
}