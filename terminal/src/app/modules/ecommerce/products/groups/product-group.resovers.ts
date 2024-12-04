import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ProductClassEnum } from '@sifca-monorepo/terminal-generator';
import { InternalProductType } from '@sifca-monorepo/terminal-generator';

import { Observable } from 'rxjs';
import { ProductGroupService } from './product-group.service';

@Injectable({
  providedIn: 'root',
})
export class ProductGroupResolver implements Resolve<any> {
  constructor(private productGroupService: ProductGroupService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InternalProductType[]> {
    return this.productGroupService.getInternalProductsByClass([ProductClassEnum.TOP_PRODUCTS]);
  }
}
