import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { PurchaseType } from '@sifca-monorepo/terminal-generator';
import { RequestsService } from './requests.service';
import { RequestPaginateType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class RequestsResolver implements Resolve<any> {
  constructor(private requestsService: RequestsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RequestPaginateType> {
    return this.requestsService.getRequestsByTypeAndTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class RequestDetailsResolver implements Resolve<any> {
  constructor(private requestsService: RequestsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PurchaseType | {}> {
    return this.requestsService.getRequest(route.paramMap.get('id')).pipe(
      catchError((error) => {
        console.error(error);
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
