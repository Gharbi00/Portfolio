import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { StockPaginateType } from '@sifca-monorepo/terminal-generator';
import { Observable } from 'rxjs';
import { StockService } from './stock.service';

@Injectable({
  providedIn: 'root',
})
export class StockResolver implements Resolve<any> {
  constructor(private stockService: StockService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<StockPaginateType> {
    return this.stockService.searchStocksByTarget();
  }
}
