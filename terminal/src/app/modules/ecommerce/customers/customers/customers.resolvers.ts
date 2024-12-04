import { Observable, catchError, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { CorporateUserType } from '@sifca-monorepo/terminal-generator';

import { CustomersService } from './customers.service';

@Injectable({
  providedIn: 'root',
})
export class CustomersResolver implements Resolve<any> {
  constructor(private customersService: CustomersService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CorporateUserType[]> {
    return this.customersService.searchCorporateUsersByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class UserResolver implements Resolve<any> {
  constructor(private router: Router, private customersService: CustomersService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CorporateUserType | {}> {
    return route.paramMap.get('id').split('?')[0] === 'add'
      ? of({})
      : this.customersService.getUserById(route.paramMap.get('id')).pipe(
          catchError((error) => {
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
  }
}
