import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CouponType } from '@sifca-monorepo/terminal-generator';
import { Observable } from 'rxjs';
import { CouponsService } from './coupons.service';

@Injectable({
  providedIn: 'root',
})
export class CouponsResolver implements Resolve<any> {
  constructor(private couponsService: CouponsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CouponType[]> {
    return this.couponsService.findCouponsByTargetWithFilterPaginated();
  }
}
