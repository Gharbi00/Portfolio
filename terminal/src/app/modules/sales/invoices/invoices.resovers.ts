import { catchError, Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { SaleInvoiceType } from '@sifca-monorepo/terminal-generator';
import { SaleInvoicesService } from './invoices.service';
import { SaleInvoicePaginateType, SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';
import { CommentsResolver } from '../../../shared/resolvers/comments.resolver';
import { CommentService } from '../../../shared/services/comment.service';

@Injectable({
  providedIn: 'root',
})
export class InvoicesStatsResolver implements Resolve<any> {
  constructor(private invoicesService: SaleInvoicesService) {}

  resolve(): Observable<SaleInvoicesStatsType> {
    return this.invoicesService.getSaleInvoicesStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class InvoicesResolver implements Resolve<any> {
  constructor(private invoicesService: SaleInvoicesService) {}

  resolve(): Observable<SaleInvoicePaginateType> {
    return this.invoicesService.getSaleInvoicesByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceDetailsResolver implements Resolve<any> {
  constructor(private invoicesService: SaleInvoicesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SaleInvoiceType | {}> {
    return this.invoicesService.getInvoiceById(route.paramMap.get('id')).pipe(
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
export class InvoiceCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'saleInvoice';
  }
}
