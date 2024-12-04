import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { AttributeValuePaginateType } from '@sifca-monorepo/terminal-generator';

import { AttributesService } from './attributes.service';
@Injectable({
  providedIn: 'root',
})
export class AttributesResolver implements Resolve<any> {
  constructor(private attributesService: AttributesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AttributeValuePaginateType> {
    return this.attributesService.searchAttributeByTarget();
  }
}
