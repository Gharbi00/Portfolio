import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { SaleDeliveryNoteType } from '@sifca-monorepo/terminal-generator';
import { SaleDeliveryNotePaginateType, SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';

import { DeliveryNotesService } from './delivery-notes.service';
import { CommentService } from '../../../../shared/services/comment.service';
import { CommentsResolver } from '../../../../shared/resolvers/comments.resolver';

@Injectable({
  providedIn: 'root',
})
export class DeliveryNotesStatsResolver implements Resolve<any> {
  constructor(private deliveryNotesService: DeliveryNotesService) {}

  resolve(): Observable<SaleInvoicesStatsType> {
    return this.deliveryNotesService.getSaleDeliveryNoteStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class DeliveryNotesResolver implements Resolve<any> {
  constructor(private deliveryNotesService: DeliveryNotesService) {}

  resolve(): Observable<SaleDeliveryNotePaginateType> {
    return this.deliveryNotesService.getSaleDeliveryNotesByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class DeliveryNoteDetailsResolver implements Resolve<any> {
  constructor(private deliveryNotesService: DeliveryNotesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SaleDeliveryNoteType | {}> {
    return this.deliveryNotesService.getDeliveryNoteById(route.paramMap.get('id')).pipe(
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
export class DeliveryNoteCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'saleDeliveryNote';
  }
}
