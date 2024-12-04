import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, catchError, of, throwError } from 'rxjs';
import { BlogType } from '@sifca-monorepo/terminal-generator';
import { BlogService } from './blog.service';

@Injectable({
  providedIn: 'root',
})
export class ContentBlogResolver implements Resolve<any> {
  constructor(private blogService: BlogService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BlogType[]> {
    return this.blogService.findBlogsByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ContentDetailBlogResolver implements Resolve<any> {
  constructor(private blogService: BlogService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BlogType | {}> {
    return route.paramMap.get('id') === 'new-blog'
      ? of({})
      : this.blogService.blogById(route.paramMap.get('id')).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
  }
}
