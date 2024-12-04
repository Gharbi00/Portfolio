import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { TaskSectionWithTasksType, TaskType } from '@sifca-monorepo/terminal-generator';

import { TodoService } from './todo.service';

@Injectable({
  providedIn: 'root',
})
export class TodoSectionResolver implements Resolve<any> {
  constructor(private todoService: TodoService) {}

  resolve(): Observable<TaskSectionWithTasksType[]> {
    return this.todoService.getSections();
  }
}

@Injectable({
  providedIn: 'root',
})
export class TodosTodoResolver implements Resolve<any> {
  constructor(private router: Router, private todoService: TodoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TaskType | {}> {
    const params = route.paramMap.get('id').split('?id=');
    switch (params[0]) {
      case 'nt':
        return of({});
      case 't':
        return this.todoService.getTaskById(params[2]).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class SectionResolver implements Resolve<any> {
  constructor(private router: Router, private todoService: TodoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any | {}> {
    const params = route.paramMap.get('id').split('?id=');
    switch (params[0]) {
      case 'ns':
        return of({});
      case 's':
        return this.todoService.getSectionById(params[1]).pipe(
          catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return throwError(() => new Error(error));
          }),
        );
    }
  }
}
