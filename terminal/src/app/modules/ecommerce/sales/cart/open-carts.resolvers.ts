import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ShoppingCartsForTargetType } from '@sifca-monorepo/terminal-generator';
import { Observable } from 'rxjs';
import { OpenCartsService } from './open-carts.service';

@Injectable({
  providedIn: 'root',
})
export class OpenCartsResolver implements Resolve<any> {
  constructor(private openCartsService: OpenCartsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ShoppingCartsForTargetType[]> {
    return this.openCartsService.findTargetShoppingCarts();
  }
}
