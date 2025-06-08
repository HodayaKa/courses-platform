import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const requiredRoles = route.data['roles'] as Array<string>;
    const userRole = this.authService.getUserRole();
    
    // אם המשתמש מחובר ויש לו את התפקיד הנדרש
    if (userRole && requiredRoles.includes(userRole)) {
      return true;
    }
    
    // אם המשתמש מחובר אבל אין לו את התפקיד הנדרש
    if (this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/courses']);
    }
    
    // אם המשתמש לא מחובר
    return this.router.createUrlTree(['/auth/login']);
  }
}