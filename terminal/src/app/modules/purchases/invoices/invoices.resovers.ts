import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { PurchaseInvoiceType, PurchaseInvoicePaginateType, SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';

import { PurchaseInvoicesService } from './invoices.service';
import { CommentService } from '../../../shared/services/comment.service';
import { CommentsResolver } from '../../../shared/resolvers/comments.resolver';

@Injectable({
  providedIn: 'root',
})
export class PurchaseInvoicesStats implements Resolve<any> {
  constructor(private invoicesService: PurchaseInvoicesService) {}

  resolve(): Observable<SaleInvoicesStatsType> {
    return this.invoicesService.getPurchaseInvoicesStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class InvoicesResolver implements Resolve<any> {
  constructor(private invoicesService: PurchaseInvoicesService) {}

  resolve(): Observable<PurchaseInvoicePaginateType> {
    return this.invoicesService.getPurchaseInvoicesByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseInvoiceDetailsResolver implements Resolve<any> {
  constructor(private invoicesService: PurchaseInvoicesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PurchaseInvoiceType | {}> {
    return this.invoicesService.getPurchaseInvoiceById(route.paramMap.get('id')).pipe(
      catchError((error) => {
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseInvoiceCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'purchaseInvoice';
  }
}
