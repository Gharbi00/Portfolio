import { Observable, Subject, takeUntil } from 'rxjs';
import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { CoinType, PointOfSaleType, WalletTopupType, WalletTransactionType, WalletType } from '@sifca-monorepo/terminal-generator';
import { PosService } from '../../../core/services/pos.service';
import { LoyaltyService } from '../../system/apps/apps/loyalty/loyalty.service';
import { WalletTransactionsStatsType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class WalletResolver implements Resolve<any> {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  pos: PointOfSaleType;

  constructor(private walletService: WalletService, private posService: PosService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CoinType[]> {
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.pos = pos;
    });
    return this.walletService.getCoinsByCountryPaginated(this.pos?.locations?.[0]?.country?.id || null);
  }
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsResolver implements Resolve<any> {
  constructor(private walletService: WalletService) {}

  resolve(): Observable<WalletTransactionType[]> {
    return this.walletService.getWalletTransactionsByAffectedPaginated();
  }
}

@Injectable({
  providedIn: 'root',
})
export class WalletsResolver implements Resolve<any> {
  constructor(private loyaltyService: LoyaltyService) {}

  resolve(): Observable<WalletType[]> {
    this.loyaltyService.wallet$ = null;
    return this.loyaltyService.quantitativeWalletsByOwnerPagination();
  }
}

@Injectable({
  providedIn: 'root',
})
export class WalletTopupsResolver implements Resolve<any> {
  constructor(private walletService: WalletService) {}

  resolve(): Observable<WalletTopupType[]> {
    return this.walletService.getWalletTopupsByTargetPaginated();
  }
}
@Injectable({
  providedIn: 'root',
})
export class StatsResolver implements Resolve<any> {
  constructor(private walletService: WalletService) {}

  resolve(): Observable<WalletTransactionsStatsType> {
    return this.walletService.getWalletTransactionsStatsByAffected();
  }
}
