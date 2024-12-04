import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { ProjectsService } from './projects.service';
import { ProjectType } from '@sifca-monorepo/terminal-generator';
import { CommentService } from '../../../../shared/services/comment.service';
import { CommentsResolver } from '../../../../shared/resolvers/comments.resolver';

@Injectable({
  providedIn: 'root',
})
export class ProjectsResolver implements Resolve<any> {
  constructor(private projectsService: ProjectsService) {}

  resolve(): Observable<ProjectType[]> {
    return this.projectsService.getProjectsByTargetWithFilter();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ProjectDetailsResolver implements Resolve<any> {
  constructor(private projectsService: ProjectsService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProjectType | {}> {
    if (route.paramMap.get('id') === 'new-project') {
      this.projectsService.project$ = null;
    }
    return route.paramMap.get('id') === 'new-project'
      ? of({})
      : this.projectsService.getProjectById(route.paramMap.get('id')).pipe(
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
export class ProjectCommentsResolver extends CommentsResolver {
  constructor(commentService: CommentService) {
    super(commentService);
    this.holder = 'project';
  }
}
