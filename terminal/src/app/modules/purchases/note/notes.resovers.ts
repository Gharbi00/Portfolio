import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { PurchaseDeliveryNotePaginateType, SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';

import { NotesService } from './notes.service';
import { CommentService } from '../../../shared/services/comment.service';
import { CommentsResolver } from '../../../shared/resolvers/comments.resolver';
import { PurchaseDeliveryNoteType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class PurchaseDeliveryNoteStatsResolver implements Resolve<any> {
  constructor(private notesService: NotesService) {}

  resolve(): Observable<SaleInvoicesStatsType> {
    return this.notesService.getPurchaseDeliveryNoteStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class NotesResolver implements Resolve<any> {
  constructor(private notesService: NotesService) {}

  resolve(): Observable<PurchaseDeliveryNotePaginateType> {
    return this.notesService.getPurchaseDeliveryNotesByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PurchaseNoteDetailsResolver implements Resolve<any> {
  constructor(private notesService: NotesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PurchaseDeliveryNoteType | {}> {
    return this.notesService.getPurchaseDeliveryNoteById(route.paramMap.get('id')).pipe(
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
export class PurchaseNoteCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'purchaseDeliveryNote';
  }
}
