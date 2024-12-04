import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { BoardCardType } from '@sifca-monorepo/terminal-generator';
import { PipelineService } from '../pipeline.service';

@Injectable({
  providedIn: 'root',
})
export class ArchivedResolver implements Resolve<any> {
  constructor(private pipelineService: PipelineService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BoardCardType[]> {
    return this.pipelineService.getArchivedBoardCardsPaginated(route.paramMap.get('id')).pipe(
      catchError((error) => {
        console.error(error);
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
