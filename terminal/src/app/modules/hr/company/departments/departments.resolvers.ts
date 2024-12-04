import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { DepartmentsService } from './departments.service';
import { DepartmentType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class DepartmentsResolver implements Resolve<any> {
  constructor(private departmentsService: DepartmentsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DepartmentType[]> {
    return this.departmentsService.getDepartments();
  }
}
