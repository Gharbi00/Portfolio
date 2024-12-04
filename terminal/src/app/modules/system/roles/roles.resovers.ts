import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { PermissionType } from '@sifca-monorepo/terminal-generator';

import { RolesService } from './roles.service';

@Injectable({
  providedIn: 'root',
})
export class RolesResolver implements Resolve<any> {
  constructor(private rolesService: RolesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PermissionType[]> {
    return this.rolesService.getPermissionsByTarget();
  }
}
