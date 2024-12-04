import { catchError, Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ScheduleService } from './schedule.service';
import { BoardWithListsAndCardsType } from '@sifca-monorepo/terminal-generator';
import { BoardCardForListType, BoardCardType, CommentType, TimeTrackType } from '@sifca-monorepo/terminal-generator';
import { CommentService } from '../../../../shared/services/comment.service';
import { TimeEntriesService } from '../../../../shared/services/time-entries.service';

@Injectable({
  providedIn: 'root',
})
export class ScheduleResolver implements Resolve<any> {
  constructor(private scheduleService: ScheduleService) {}

  resolve(): Observable<BoardWithListsAndCardsType> {
    return this.scheduleService.getMaintenanceBoard();
  }
}

@Injectable({
  providedIn: 'root',
})
export class BoardListResolver implements Resolve<any> {
  constructor(private scheduleService: ScheduleService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BoardCardType[]> {
    return this.scheduleService.getBoardCardsByBoardWithFilterPaginated(route.paramMap.get('id')).pipe(
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
export class ScheduleDetailsResolver implements Resolve<any> {
  constructor(private scheduleService: ScheduleService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BoardCardForListType | {}> {
    return this.scheduleService.getBoardCard(route.paramMap.get('id')).pipe(
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
export class CardCommentsResolver implements Resolve<any> {
  constructor(private commentService: CommentService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CommentType | {}> {
    return this.commentService.getCommentsByHolderPaginated({ card: route.paramMap.get('id') });
  }
}

@Injectable({
  providedIn: 'root',
})
export class CardTimeTracksResolver implements Resolve<any> {
  constructor(private timeEntriesService: TimeEntriesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TimeTrackType | {}> {
    return this.timeEntriesService.getTimeTracksByHolderPaginated({ card: route.paramMap.get('id') });
  }
}
