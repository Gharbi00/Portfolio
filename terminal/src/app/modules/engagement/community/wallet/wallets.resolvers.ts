import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { SimpleUserWithWalletsType } from '@sifca-monorepo/terminal-generator';

import { WalletsService } from './wallets.service';

@Injectable({
  providedIn: 'root',
})
export class WalletResolver implements Resolve<any> {
  constructor(private walletService: WalletsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SimpleUserWithWalletsType[]> {
    return this.walletService.getTargetUsersWithWallets();
  }
}
