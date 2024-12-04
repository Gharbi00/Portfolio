import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  SimpleUserWithWalletsType,
  GetTargetUsersWithWalletsGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class WalletsService {
  private walletPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private wallet: BehaviorSubject<SimpleUserWithWalletsType[]> = new BehaviorSubject(null);
  private loadingWallet: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);

  pageLimit = 10;
  walletPageIndex = 0;
  walletSearchString: string;

    get loadingWallet$(): Observable<boolean> {
      return this.loadingWallet.asObservable();
    }
    get pagination$(): Observable<IPagination> {
      return this.pagination.asObservable();
    }

    get walletPagination$(): Observable<IPagination> {
      return this.walletPagination.asObservable();
    }

    get wallet$(): Observable<SimpleUserWithWalletsType[]> {
      return this.wallet.asObservable();
    }

  constructor(
    private storageHelper: StorageHelper,
    private getTargetUsersWithWalletsGQL: GetTargetUsersWithWalletsGQL,
  ) {}

  getTargetUsersWithWallets(): Observable<SimpleUserWithWalletsType[]> {
    this.loadingWallet.next(true);
    return this.getTargetUsersWithWalletsGQL
      .fetch({
        pagination: { page: this.walletPageIndex, limit: this.pageLimit },
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.walletSearchString,
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingWallet.next(false);
          if (data) {
            this.wallet.next(data.getTargetUsersWithWallets?.objects);
            this.walletPagination.next({
              page: this.walletPageIndex,
              size: this.pageLimit,
              length: data.getTargetUsersWithWallets?.count,
            });
            return data.getTargetUsersWithWallets;
          }
        }),
      );
  }
}
