import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { StaticTranslationType } from '@sifca-monorepo/terminal-generator';

import { StaticService } from './static.service';

@Injectable({
  providedIn: 'root',
})
export class StaticResolver implements Resolve<any> {
  constructor(private staticService: StaticService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<StaticTranslationType[]> {
    return this.staticService.getStaticTranslationsByTargetAndLanguagePaginated();
  }
}
