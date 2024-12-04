import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NewsletterType } from '@sifca-monorepo/terminal-generator';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { NewsletterService } from './newsletter.service';

@Injectable({
  providedIn: 'root',
})
export class NewslettersResolver implements Resolve<any> {
  constructor(private newslettersService: NewsletterService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<NewsletterType[]> {
    return this.newslettersService.getSubscribersToNewsletterPaginated();
  }
}
