import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { QuotationType } from '@sifca-monorepo/terminal-generator';
import { PreviewService } from './preview.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentDetailsResolver implements Resolve<any> {
  constructor(private previewService: PreviewService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<QuotationType | {}> {
    return this.previewService.getDocumentByToken(route.paramMap.get('token')).pipe(
      catchError((error) => {
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
