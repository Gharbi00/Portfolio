import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Route, Router, CanLoad, UrlSegment, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { UserRole } from '@sifca-monorepo/terminal-generator';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RolesGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.check(route.data.role);
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.check(route.data.role);
  }

  private check(role: UserRole): boolean {
    const hasRole = this.authService.userHasRole(role);
    if (!hasRole) {
      this.router.navigateByUrl('/empty');
    }
    return hasRole;
  }
}
