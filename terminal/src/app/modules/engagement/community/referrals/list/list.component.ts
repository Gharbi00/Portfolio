import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, combineLatest, takeUntil, map as rxMap } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';

import { ReferralsService } from '../referrals.service';
import { LoyaltySettingsType, ReferralType } from '@sifca-monorepo/terminal-generator';
import { SharedService } from '../../../../../shared/services/shared.service';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';

@Component({
  selector: 'referral-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferralsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  referrals$: Observable<ReferralType[]> = this.referralsService.referrals$;
  loadingReferrals$: Observable<boolean> = this.referralsService.loadingReferrals$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private translate: TranslateService,
    private sharedService: SharedService,
    private loyaltyService: LoyaltyService,
    private referralsService: ReferralsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    combineLatest([this.translate.get('MENUITEMS.TS.ENGAGEMENT'), this.translate.get('MENUITEMS.TS.SUBSCRIBERS')]).pipe(rxMap(([engagement, subcribers]: [string, string]) => {
      this.breadCrumbItems = [{ label: engagement }, { label: subcribers, active: true }];
    }))
    this.referralsService.referralPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.referralsService.pageIndex ? this.referralsService.pageIndex + 1 : 1,
        size: this.referralsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.referralsService.pageIndex || 0) * this.referralsService.pageLimit,
        endIndex: Math.min(((this.referralsService.pageIndex || 0) + 1) * this.referralsService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {}

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  position() {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.referralsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.referralsService.getReferralsByTargetPagination().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.referralsService.pageIndex = 0;
  }
}
