import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SocialType } from '@sifca-monorepo/terminal-generator';
import { PaymentPaginatedType, PointOfSaleType } from '@sifca-monorepo/terminal-generator';
import { PosService } from '../../../core/services/pos.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileResolver implements Resolve<any> {
  constructor(private posService: PosService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PointOfSaleType> {
    return this.posService.getPointOfSale();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProfileSocialsResolver implements Resolve<any> {
  constructor(private posService: PosService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SocialType[]> {
    return this.posService.findSocialsPagination();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProfilePaymentMethodResolver implements Resolve<any> {
  constructor(private posService: PosService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaymentPaginatedType> {
    return this.posService.findPaymentsPagination();
  }
}
