import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, Subject, combineLatest, takeUntil, map as rxMap } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { SimpleUserWithWalletsType } from '@sifca-monorepo/terminal-generator';

import { SharedService } from '../../../../../shared/services/shared.service';
import { WalletsService } from '../wallets.service';

@Component({
  selector: 'wallet-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  wallet$: Observable<SimpleUserWithWalletsType[]> = this.walletService.wallet$;
  loadingWallet$: Observable<boolean> = this.walletService.loadingWallet$;
  searchForm: FormGroup = this.formBuilder.group({
    searchString: [''],
  });

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private walletService: WalletsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    combineLatest([this.translate.get('MENUITEMS.TS.ENGAGEMENT'), this.translate.get('MENUITEMS.TS.SUBSCRIBERS')]).pipe(rxMap(([engagement, subcribers]: [string, string]) => {
      this.breadCrumbItems = [{ label: engagement }, { label: subcribers, active: true }];
    }))
    this.walletService.walletPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.walletService.walletPageIndex ? this.walletService.walletPageIndex + 1 : 1,
        size: this.walletService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.walletService.walletPageIndex || 0) * this.walletService.pageLimit,
        endIndex: Math.min(((this.walletService.walletPageIndex || 0) + 1) * this.walletService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.walletService.walletSearchString = searchValues.searchString;
          return this.walletService.getTargetUsersWithWallets();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

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
    this.walletService.walletPageIndex = page - 1;
    if (this.pageChanged) {
      this.walletService.getTargetUsersWithWallets().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.walletService.walletPageIndex = 0;
    this.walletService.walletSearchString = '';
  }
}
