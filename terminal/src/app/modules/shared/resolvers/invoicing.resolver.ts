import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { PriceType } from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../services/invoicing.service';

@Injectable({
  providedIn: 'root',
})
export class DataResolver implements Resolve<any> {
  constructor(private invoicingService: InvoicingService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.invoicingService.type$ = route.data.type;
    this.invoicingService.title$ = route.data.title;
    this.invoicingService.pageId$ = route.data.pageId;
    this.invoicingService.isAvoir$ = route.data.isAvoir;
    this.invoicingService.subType$ = route.data.subType;
    this.invoicingService.category$ = route.data.category;
    this.invoicingService.parentPage$ = route.data.parentPage;
    this.invoicingService.commentHolder$ = route.data.commentHolder;
    this.invoicingService.documentTitle$ = route.data.documentTitle;
    this.invoicingService.commentService$ = route.data.commentService;
    this.invoicingService.breadCrumbItems$ = route.data.breadCrumbItems;
    this.invoicingService.commentServiceAttribute$ = route.data.commentServiceAttribute;
    return of(true);
  }
}
@Injectable({
  providedIn: 'root',
})
export class PricesResolver implements Resolve<any> {
  constructor(private invoicingService: InvoicingService) {}

  resolve(): Observable<PriceType[]> {
    return this.invoicingService.getPrices();
  }
}
@Injectable({
  providedIn: 'root',
})
export class ResetItemResolver implements Resolve<any> {
  constructor(private invoicingService: InvoicingService) {}

  resolve() {
    this.invoicingService.resetItem();
  }
}
