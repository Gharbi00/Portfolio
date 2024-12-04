import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { LocationsService } from './locations.service';
import { LocationType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class LocationsResolver implements Resolve<any> {
  constructor(private locationsService: LocationsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LocationType[]> {
    return this.locationsService.getLocations();
  }
}
