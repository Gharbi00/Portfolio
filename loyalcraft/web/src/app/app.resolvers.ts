import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedService } from '@sifca-monorepo/clients';
import { POS_ID } from '../environments/environment';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class InitialDataResolver implements Resolve<any> {

  posId: string = '';

  constructor(private storageHelper: StorageHelper, private sharedService: SharedService) {
    this.sharedService.setPosId(POS_ID);
    this.storageHelper.setData({ posId: POS_ID });
    this.sharedService.posId$.subscribe((posId) => {
      this.posId = posId;
    });
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return null;
  }
}
