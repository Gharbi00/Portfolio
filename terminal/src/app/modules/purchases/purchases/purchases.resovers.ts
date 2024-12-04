import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { PurchaseOrderType } from '@sifca-monorepo/terminal-generator';
import { PurchaseOrderPaginateType, SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';

import { PurchasesService } from './purchases.service';
import { CommentService } from '../../../shared/services/comment.service';
import { CommentsResolver } from '../../../shared/resolvers/comments.resolver';

@Injectable({
  providedIn: 'root',
})
export class PurchaseStats implements Resolve<any> {
  constructor(private purchasesService: PurchasesService) {}

  resolve(): Observable<SaleInvoicesStatsType> {
    return this.purchasesService.getPurchaseOrdersStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PurchasesResolver implements Resolve<any> {
  constructor(private purchasesService: PurchasesService) {}

  resolve(): Observable<PurchaseOrderPaginateType> {
    return this.purchasesService.getPurchaseOrdersByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseDetailsResolver implements Resolve<any> {
  constructor(private purchasesService: PurchasesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PurchaseOrderType | {}> {
    return this.purchasesService.getPurchaseOrderById(route.paramMap.get('id')).pipe(
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
export class PurchaseCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'purchaseOrder';
  }
}
