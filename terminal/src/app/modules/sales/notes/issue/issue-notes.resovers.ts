import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { SaleIssueNoteType } from '@sifca-monorepo/terminal-generator';
import { SaleIssueNotePaginateType, SaleIssueNoteStatsType } from '@sifca-monorepo/terminal-generator';

import { IssueNotesService } from './issue-notes.service';
import { CommentService } from '../../../../shared/services/comment.service';
import { CommentsResolver } from '../../../../shared/resolvers/comments.resolver';

@Injectable({
  providedIn: 'root',
})
export class IssuesStats implements Resolve<any> {
  constructor(private issueNotesService: IssueNotesService) {}

  resolve(): Observable<SaleIssueNoteStatsType> {
    return this.issueNotesService.getSaleIssueNotesStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class IssueNotesResolver implements Resolve<any> {
  constructor(private issueNotesService: IssueNotesService) {}

  resolve(): Observable<SaleIssueNotePaginateType> {
    return this.issueNotesService.getSaleIssueNotesByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class IssuenoteDetailsResolver implements Resolve<any> {
  constructor(private issueNotesService: IssueNotesService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SaleIssueNoteType | {}> {
    return this.issueNotesService.getIssueNoteById(route.paramMap.get('id')).pipe(
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
export class IssueNoteCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'saleIssueNote';
  }
}
