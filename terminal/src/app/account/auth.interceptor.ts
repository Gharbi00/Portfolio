import { includes, some } from 'lodash';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private storageHelper: StorageHelper) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let newRequest: any;
    const token = this.storageHelper.getData('accessToken');
    if (token) {
      newRequest = {
        setHeaders: {
          app: 'SIFCA',
          platform: 'web',
          Authorization: 'Bearer ' + token,
          ...(includes(
            ['createMessage', 'markAllMessageAsSeen', 'getMessagesByMessageGroupPagination', 'getMediaOfMessageGroupPagination'],
            req.body?.operationName,
          )
            ? { messageGroupId: req.body?.variables?.messageGroup || req.body?.variables?.input?.messageGroup }
            : {}),
        },
      };
    } else {
      newRequest = {
        setHeaders: {
          app: 'SIFCA',
          platform: 'web',
        },
      };
    }
    return next.handle(req.clone(newRequest)).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.error instanceof ErrorEvent) {
            console.error('Error Event');
          } else {
            if (error.status === 401) {
              localStorage.removeItem('accessToken');
              location.reload();
            }
            if (error.status === 500) {
              this.router.navigateByUrl('/500');
            }
          }
        } else {
          console.error('some thing else happened');
        }
        return throwError(() => new Error(error));
      }),
      tap((res: any) => {
        if (
          res.url === environment.BACKEND_URL &&
          !res.body.data &&
          res.body.errors?.length &&
          some(res.body.errors, (error) => error.extensions?.exception?.status === 401)
        ) {
          this.storageHelper.clearLocalStorage();
          this.router.navigateByUrl('/logout');
        }
      }),
    );
  }
}
