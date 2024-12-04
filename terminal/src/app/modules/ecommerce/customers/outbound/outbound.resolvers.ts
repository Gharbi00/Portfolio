import { Injectable } from '@angular/core';
import { Observable, catchError, combineLatest, of } from 'rxjs';
import { CorporateEmailTemplateType, OutboundType } from '@sifca-monorepo/terminal-generator';

import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

import { OutboundService } from './outbound.service';
import { EmailIntegrationService } from '../../../system/apps/apps/email-integration/email-integration.service';
import { NotificationIntegrationService } from '../../../system/apps/apps/notifications-integration/notifications-integration.service';
import { SmsIntegrationService } from '../../../system/apps/apps/sms-integration/sms-integration.service';
import { WidgetService } from '../../../system/apps/apps/widget/widget.service';

@Injectable({
  providedIn: 'root',
})
export class OutboundResolver implements Resolve<any> {
  constructor(private outboundService: OutboundService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OutboundType[]> {
    return this.outboundService.getOutboundsByTargetPagination();
  }
}
@Injectable({
  providedIn: 'root',
})
export class OutboundDetailsResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private widgetService: WidgetService,
    private outboundService: OutboundService,
    private smsIntegrationService: SmsIntegrationService,
    private emailIntegrationService: EmailIntegrationService,
    private notificationIntegrationService: NotificationIntegrationService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OutboundType | {}> {
    this.outboundService.outbound$ = null;
    return route.paramMap.get('id') === 'new-item'
      ? combineLatest([
        this.widgetService.getWidgetIntegrationByTarget(),
        this.smsIntegrationService.getSmsIntegrationByTarget(),
        this.emailIntegrationService.getEmailIntegrationByTarget(),
        this.notificationIntegrationService.getNotificationIntegrationByTarget(),
      ])
      : combineLatest([
          this.widgetService.getWidgetIntegrationByTarget(),
          this.smsIntegrationService.getSmsIntegrationByTarget(),
          this.emailIntegrationService.getEmailIntegrationByTarget(),
          this.notificationIntegrationService.getNotificationIntegrationByTarget(),
          this.outboundService.getOutboundById(route.paramMap.get('id')),
        ]).pipe(
          catchError(() => {
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this.router.navigateByUrl(parentUrl);
            return of(null);
          }),
        );
  }
}

@Injectable({
  providedIn: 'root',
})
export class EmailTemplatesResolver implements Resolve<any> {
  constructor(private outboundService: OutboundService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CorporateEmailTemplateType[]> {
    return this.outboundService.getAppCorporateEmailsPaginated();
  }
}
