import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { PurchaseType } from '@sifca-monorepo/terminal-generator';

import { ApplicationsService } from './applications.service';
import { JobApplicationBasePaginatedType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class JobApplicationResolver implements Resolve<any> {
  constructor(private jobApplicationService: ApplicationsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<JobApplicationBasePaginatedType> {
    return this.jobApplicationService.getJobApplicationsByTargetWithFilterPagination();
  }
}

@Injectable({
  providedIn: 'root',
})
export class JobApplicationDetailsResolver implements Resolve<any> {
  constructor(private jobApplicationService: ApplicationsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PurchaseType | {}> {
    return route.paramMap.get('id') === 'new-application'
      ? of({})
      : this.jobApplicationService.getjobApplicationById(route.paramMap.get('id')).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
  }
}
