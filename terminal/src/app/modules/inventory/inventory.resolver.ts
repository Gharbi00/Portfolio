import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { InventoryService } from '../../shared/services/inventory.service';

@Injectable({
  providedIn: 'root',
})
export class DataResolver implements Resolve<any> {
  constructor(private inventoryService: InventoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.inventoryService.variety$ = route.data.variety;
    this.inventoryService.status$ = [];
    this.inventoryService.searchString$ = '';
    this.inventoryService.action$ = route.data.action;
    this.inventoryService.pageId$ = route.data.pageId;
    this.inventoryService.pageTitle$ = route.data.title;
    this.inventoryService.hasFilter$ = route.data.hasFilter;
    this.inventoryService.listHeader$ = route.data.listHeader;
    this.inventoryService.parentLink$ = route.data.parentLink;
    if (route.data.dropDownAction) {
      this.inventoryService.dropDownAction$ = route.data.dropDownAction;
    }
    this.inventoryService.filter$ = {
      variety: [route.data.variety],
      structure: route.data.structure,
    };
    return of(true);
  }
}
