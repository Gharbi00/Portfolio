import Swal from 'sweetalert2';
import { isEqual, omit, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, Subject, catchError, combineLatest, of, take, takeUntil } from 'rxjs';

import { FormHelper } from '@diktup/frontend/helpers';
import { IPagination } from '@diktup/frontend/models';
import { LoyaltySettingsType, WalletTopupCurrencyType, WalletTopupStatusEnum, WalletTopupType, WalletType } from '@sifca-monorepo/terminal-generator';

import { WalletService } from '../wallet.service';
import { LoyaltyService } from '../../../system/apps/apps/loyalty/loyalty.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-topup-details-details',
  templateUrl: './topup-details.component.html',
  styleUrls: ['./topup-details.component.scss'],
})
export class TopupDetailsComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  pageChanged: any;
  page: number = 0;
  initialWallet: any;
  walletForm: FormGroup;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  isWalletButtonDisabled = true;
  selectedWallet: WalletTopupType;
  status = values(WalletTopupStatusEnum);
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  loadingTopups$: Observable<boolean> = this.walletService.loadingTopups$;
  isLastWallets$: Observable<boolean> = this.loyaltyService.isLastWallet$;
  walletTopup$: Observable<WalletTopupType[]> = this.walletService.walletTopup$;
  walletAmount: WalletTopupCurrencyType;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;
  currentWallet: WalletType;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private sharedService: SharedService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private walletService: WalletService,
    private loyaltyService: LoyaltyService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.walletService.pageLimit = 10;
    this.translate.get('MENUITEMS.TS.ENGAGEMENT').subscribe((engagement: string) => {
      this.translate.get('MENUITEMS.TS.WALLET_TOPUP').subscribe((walletTopup: string) => {
        this.breadCrumbItems = [{ label: engagement }, { label: walletTopup, active: true }];
      });
    });
    this.walletService.getWalletTopupsByTargetPaginated().subscribe();
    this.walletService.topupPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.walletService.pageIndex || 0,
        size: this.walletService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.walletService.pageIndex || 0) * this.walletService.pageLimit,
        endIndex: Math.min(((this.walletService.pageIndex || 0) + 1) * this.walletService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    combineLatest([this.loyaltyService.findLoyaltySettingsByTarget(), this.loyaltyService.quantitativeWalletsByOwnerPagination()]).subscribe();
  }

  getWalletTopupsValue() {
    this.walletService.getWalletTopupsValue(this.walletForm.get('amount').value, this.walletForm.get('wallet').value?.id).subscribe((res) => {
      this.walletAmount = res;
      this.changeDetectorRef.markForCheck();
    });
  }

  save() {
    this.isWalletButtonDisabled = true;
    let field: string;
    field = this.selectedWallet ? 'updateWalletTopup' : 'createWalletTopup';
    const input: any = {
      ...FormHelper.getDifference(omit(this.initialWallet, 'wallet'), omit(this.walletForm.value, 'value', 'wallet')),
      ...(this.initialWallet.wallet?.id === this.walletForm.get('wallet').value.id ? {} : { wallet: this.walletForm.get('wallet').value.id }),
    };
    const args = this.selectedWallet ? [this.selectedWallet.id, input] : [input];
    this.walletService[field](...args)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onChangeWallet(wallet: WalletType) {
    this.currentWallet = wallet;
    console.log("🚀 ~ TopupDetailsComponent ~ onChangeWallet ~ this.currentWallet:", this.currentWallet)
  }

  openWalletModal(modal, wallet: WalletTopupType) {
    this.walletAmount = null;
    this.selectedWallet = wallet;
    this.modalService.open(modal, { centered: true });
    this.walletForm = this.formBuilder.group({
      amount: [wallet?.value?.amount || ''],
      wallet: [wallet?.wallet || undefined],
    });
    if (wallet) {
      this.currentWallet = wallet?.wallet;
    }
    this.initialWallet = this.walletForm.value;
    this.walletForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isWalletButtonDisabled = isEqual(this.initialWallet, values);
    });
  }

  loadMoreWallets() {
    this.loyaltyService.isLastWallet$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.loyaltyService.walletPageIndex++;
        this.loyaltyService.quantitativeWalletsByOwnerPagination().subscribe();
      }
    });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.walletService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.walletService.getWalletTopupsByTargetPaginated().subscribe();
    }
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

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = null;
    this.walletService.pageIndex = 0;
  }
}
