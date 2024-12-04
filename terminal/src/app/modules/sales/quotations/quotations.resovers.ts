import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { QuotationType } from '@sifca-monorepo/terminal-generator';
import { QuotationPaginateType, QuotationsStatsType } from '@sifca-monorepo/terminal-generator';

import { QuotationsService } from './quotations.service';
import { CompanyService } from '../../system/company/company.service';
import { CommentService } from '../../../shared/services/comment.service';
import { CommentsResolver } from '../../../shared/resolvers/comments.resolver';

@Injectable({
  providedIn: 'root',
})
export class QuotationsStats implements Resolve<any> {
  constructor(private quotationsService: QuotationsService) {}

  resolve(): Observable<QuotationsStatsType> {
    return this.quotationsService.getQuotationsStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class QuotationsResolver implements Resolve<any> {
  constructor(private quotationsService: QuotationsService) {}

  resolve(): Observable<QuotationPaginateType> {
    return this.quotationsService.getQuotationsByTargetPaginated();
  }
}
@Injectable({
  providedIn: 'root',
})
export class QuotationDetailsResolver implements Resolve<any> {
  constructor(private quotationsService: QuotationsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<QuotationType | {}> {
    return this.quotationsService.getQuotationById(route.paramMap.get('id')).pipe(
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
export class CreateQuotationResolver implements Resolve<any> {
  constructor(private companyService: CompanyService, private quotationsService: QuotationsService) {}

  resolve(): Observable<null> {
    this.quotationsService.resetQuotation();
    this.companyService.selectedCustomer$ = null;
    return;
  }
}

@Injectable({
  providedIn: 'root',
})
export class QuotationsCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'quotation';
  }
}
