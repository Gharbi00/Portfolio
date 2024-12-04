import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { MarketPlaceOrderDtoType } from '@sifca-monorepo/terminal-generator';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';
import { BarcodeService } from '../../../inventory/products/articles/articles.service';
import { BarcodePaginateType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class OrdersResolver implements Resolve<any> {
  constructor(private ordersService: OrdersService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MarketPlaceOrderDtoType[]> {
    return this.ordersService.findTargetOrders();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProductOrdersResolver implements Resolve<any> {
  constructor(private barcodeService: BarcodeService) {}

  resolve(): Observable<BarcodePaginateType> {
    return this.barcodeService.getBarcodesWithVarietyFilter();
  }
}
