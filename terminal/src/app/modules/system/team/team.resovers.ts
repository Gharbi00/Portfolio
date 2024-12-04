import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AccountType } from '@sifca-monorepo/terminal-generator';

import { TeamService } from './team.service';
import { UserType } from '@sifca-monorepo/terminal-generator';
import { DocumentPaginatedType, ProjectPaginateType } from '@sifca-monorepo/terminal-generator';

import { DocumentService } from '../../../shared/services/document.service';

@Injectable({
  providedIn: 'root',
})
export class TeamResolver implements Resolve<any> {
  constructor(private teamService: TeamService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AccountType[]> {
    return this.teamService.getTeam();
  }
}

@Injectable({
  providedIn: 'root',
})
export class TeamDetailsResolver implements Resolve<any> {
  constructor(private teamService: TeamService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserType | {}> {
    return this.teamService.getUserById(route.paramMap.get('id')).pipe(
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
export class UserProjectsResolver implements Resolve<any> {
  constructor(private teamService: TeamService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProjectPaginateType | {}> {
    return this.teamService.getUserProjects(route.paramMap.get('id')).pipe(
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
export class UserDocumentsResolver implements Resolve<any> {
  constructor(private documentService: DocumentService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DocumentPaginatedType | {}> {
    return this.documentService.getUserDocuments(route.paramMap.get('id')).pipe(
      catchError((error) => {
        console.error(error);
        const parentUrl = state.url.split('/').slice(0, -1).join('/');
        this.router.navigateByUrl(parentUrl);
        return throwError(() => new Error(error));
      }),
    );
  }
}
