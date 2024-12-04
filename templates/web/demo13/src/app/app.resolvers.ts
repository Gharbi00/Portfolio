import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { SeoService, SharedService, SlidesService, VisualsService } from '@sifca-monorepo/clients';

@Injectable({
  providedIn: 'root',
})
export class InitialDataResolver implements Resolve<any> {
  /**
   * Constructor
   */
  posId: string = '';

  constructor(private sharedService: SharedService, private seoService: SeoService, private slidesService: SlidesService, private visulalsService: VisualsService) {
    this.sharedService.posId$.subscribe((posId) => {
      this.posId = posId;
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Use this resolver to resolve initial mock-api for the application
   *
   *  route
   *  state
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([this.seoService.getSeo(this.posId), this.slidesService.getSlides(this.posId), this.visulalsService.getVisuals(this.posId)]);
  }
}
