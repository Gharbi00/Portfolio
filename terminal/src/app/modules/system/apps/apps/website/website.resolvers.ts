import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { SmsIntegrationType, WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { ActivityTypeWithActiveStatusType, CorporateEmailTemplateType, SeoType } from '@sifca-monorepo/terminal-generator';

import { WebsiteService } from './website.service';
import { SmsIntegrationService } from '../sms-integration/sms-integration.service';
import { CorporateTemplateType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class WebsiteResolver implements Resolve<any> {
  constructor(private websiteService: WebsiteService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<WebsiteIntegrationType> {
    return this.websiteService.getWebsiteIntegrationByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class WebsiteActivityResolver implements Resolve<any> {
  constructor(private websiteService: WebsiteService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ActivityTypeWithActiveStatusType[]> {
    return this.websiteService.getPredefinedActivityTypesPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class EmailsResolver implements Resolve<any> {
  constructor(private websiteService: WebsiteService) {}

  resolve(): Observable<CorporateEmailTemplateType[]> {
    return this.websiteService.getCorporateEmailsByTargetPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SmsIntegrationResolver implements Resolve<any> {
  constructor(private smsIntegrationService: SmsIntegrationService) {}

  resolve(): Observable<SmsIntegrationType> {
    return this.smsIntegrationService.getSmsIntegrationByTarget();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SeoResolver implements Resolve<any> {
  constructor(private websiteService: WebsiteService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SeoType> {
    return this.websiteService.getSeo();
  }
}

@Injectable({
  providedIn: 'root',
})
export class FilesResolver implements Resolve<any> {
  constructor(private websiteService: WebsiteService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CorporateTemplateType> {
    return this.websiteService.findCorporateTemplateByTarget();
  }
}
