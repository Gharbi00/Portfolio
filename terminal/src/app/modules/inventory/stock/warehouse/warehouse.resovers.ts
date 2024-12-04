import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { WarehousePaginateType } from '@sifca-monorepo/terminal-generator';
import { Observable } from 'rxjs';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class WarehouseResolver implements Resolve<any> {
  constructor(private warehouseService: WarehouseService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WarehousePaginateType> {
    return this.warehouseService.getWarehousesByCompanyPaginated();
  }
}
