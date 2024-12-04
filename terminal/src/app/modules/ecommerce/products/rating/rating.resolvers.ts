import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { RatingService } from './rating.service';
import { CorporateRatingAssignmentType, CorporateRatingDefinitionType, PointOfSaleType } from '@sifca-monorepo/terminal-generator';
import { PosService } from '../../../../core/services/pos.service';

@Injectable({
  providedIn: 'root',
})
export class RatingsResolver implements Resolve<any> {
  constructor(private reviewService: RatingService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CorporateRatingDefinitionType[]> {
    return this.reviewService.getRatingDefinitions();
  }
}

@Injectable({
  providedIn: 'root',
})
export class CorporateRatingAssignmentsResolver implements Resolve<any> {
  pos: string;
  constructor(private reviewService: RatingService, private posService: PosService) {
    this.posService.pos$.subscribe((pos: PointOfSaleType) => {
      if (pos) {
        this.pos = pos.id;
      }
    });
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CorporateRatingAssignmentType[]> {
    return this.reviewService.getCorporateRatingAssignmentByTarget();
  }
}
