import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { TicketsService } from './tickets.service';
import { TicketsPaginateType, TicketStatsType } from '@sifca-monorepo/terminal-generator';
import { TicketType } from '@sifca-monorepo/terminal-generator';
import { CommentService } from '../../../shared/services/comment.service';
import { CommentsResolver } from '../../../shared/resolvers/comments.resolver';

@Injectable({
  providedIn: 'root',
})
export class TicketsStats implements Resolve<any> {
  constructor(private ticketsService: TicketsService) {}

  resolve(): Observable<TicketStatsType> {
    return this.ticketsService.getTicketsStatsWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class TicketsResolver implements Resolve<any> {
  constructor(private ticketsService: TicketsService) {}

  resolve(): Observable<TicketsPaginateType> {
    return this.ticketsService.getTicketsByTargetWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class TicketDetailsResolver implements Resolve<any> {
  constructor(private ticketsService: TicketsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TicketType | {}> {
    return this.ticketsService.getTicketById(route.paramMap.get('id')).pipe(
      catchError((error) => {
        console.error(error);
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
export class TicketCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'ticket';
  }
}
