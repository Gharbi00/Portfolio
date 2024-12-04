import { Observable } from 'rxjs';
import { includes } from 'lodash';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';

import { StorageHelper } from '@diktup/frontend/helpers';
import { ACCESS_TOKEN } from '../../../environments/environment';

@Injectable()
export class MainInterceptor implements HttpInterceptor {
  constructor(private storageHelper: StorageHelper) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (/[a-zA-Z\/\.-:0-9\-]*json/.test(req.url)) {
      return next.handle(req);
    }
    const authToken = this.storageHelper.getData(ACCESS_TOKEN);
    const messageGroupId = this.storageHelper.getData('localMessageGroupId');
    const modified = req.clone({
      setHeaders: {
        app: 'SIFCA',
        platform: 'web',
        ...(authToken
          ? {
              Authorization: `Bearer ${authToken}`,
              ...(includes(['sendMessageToTarget', 'markAllMessageAsSeen', 'getMessagesByMemberPaginated'], req.body?.operationName) &&
              (req.body?.variables?.messageGroup || messageGroupId)
                ? { messageGroupId: req.body?.variables?.messageGroup || messageGroupId }
                : {}),
            }
          : {}),
      },
    });
    return next.handle(modified);
  }
}
