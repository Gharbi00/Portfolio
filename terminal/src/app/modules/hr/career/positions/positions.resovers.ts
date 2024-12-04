import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { JobDefinitionPaginatedType } from '@sifca-monorepo/terminal-generator';
import { DepartmentType, JobDefinitionType } from '@sifca-monorepo/terminal-generator';

import { JobPositionsService } from './positions.service';
import { DepartmentsService } from '../../company/departments/departments.service';

@Injectable({
  providedIn: 'root',
})
export class JobDepartmentResolver implements Resolve<any> {
  constructor(private jobDepartmentService: DepartmentsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DepartmentType[]> {
    return this.jobDepartmentService.searchJobDepartmentsByTarget();
  }
}
@Injectable({
  providedIn: 'root',
})
export class PositionsResolver implements Resolve<any> {
  constructor(private jobsService: JobPositionsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<JobDefinitionPaginatedType> {
    return this.jobsService.searchJobDefinitionsByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PositionDetailsResolver implements Resolve<any> {
  constructor(private router: Router, private jobsService: JobPositionsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<JobDefinitionType | {}> {
    return route.paramMap.get('id').split('?')[0] === 'new-job'
      ? of({})
      : this.jobsService.jobDefinitionById(route.paramMap.get('id')).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
  }
}
