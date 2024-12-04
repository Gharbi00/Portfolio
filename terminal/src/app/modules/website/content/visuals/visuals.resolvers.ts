import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { VisualsType } from '@sifca-monorepo/terminal-generator';
import { Observable } from 'rxjs';
import { VisualsService } from './visuals.service';

@Injectable({
  providedIn: 'root',
})
export class VisualsResolver implements Resolve<any> {
  constructor(private visualsService: VisualsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VisualsType> {
    return this.visualsService.getVisuals();
  }
}
