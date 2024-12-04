import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { SaleOrderType } from '@sifca-monorepo/terminal-generator';
import { SaleOrderPaginateType, SaleOrdersStatsType } from '@sifca-monorepo/terminal-generator';

import { SalesOrdersService } from './orders.service';
import { CommentService } from '../../../shared/services/comment.service';
import { CommentsResolver } from '../../../shared/resolvers/comments.resolver';

@Injectable({
  providedIn: 'root',
})
export class NotesStats implements Resolve<any> {
  constructor(private ordersService: SalesOrdersService) {}

  resolve(): Observable<SaleOrdersStatsType> {
    return this.ordersService.getSaleOrdersStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class OrdersResolver implements Resolve<any> {
  constructor(private ordersService: SalesOrdersService) {}

  resolve(): Observable<SaleOrderPaginateType> {
    return this.ordersService.getSaleOrdersByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class OrderDetailsResolver implements Resolve<any> {
  constructor(private ordersService: SalesOrdersService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SaleOrderType | {}> {
    return this.ordersService.getSaleOrderById(route.paramMap.get('id')).pipe(
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
export class OrderCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'saleOrder';
  }
}
