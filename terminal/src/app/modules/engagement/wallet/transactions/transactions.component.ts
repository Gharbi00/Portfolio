import Swal from 'sweetalert2';
import subYears from 'date-fns/subYears';
import endOfToday from 'date-fns/endOfToday';
import { omit, values, map, forEach } from 'lodash';
import startOfToday from 'date-fns/startOfToday';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map as rxMap,
  of,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { LoyaltySettingsType, WalletTransactionsByAffectedFilterInput, WalletTransactionsStatsType } from '@sifca-monorepo/terminal-generator';
import {
  UserType,
  WalletType,
  PointOfSaleType,
  CorporateUserType,
  TransactionTypeEnum,
  WalletTransactionType,
} from '@sifca-monorepo/terminal-generator';

import { WalletService } from '../wallet.service';
import { ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { PosService } from '../../../../../app/core/services/pos.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { UserService } from '../../../../../app/core/services/user.service';
import { LoyaltyService } from '../../../system/apps/apps/loyalty/loyalty.service';
import { CustomersService } from '../../../ecommerce/customers/customers/customers.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'sifca-wallet-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class WalletTransactionsComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  user: UserType;
  pageChanged: any;
  page: number = 0;
  initialValues: any;
  pos: PointOfSaleType;
  filterForm: FormGroup;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  isFilterButtonDisabled = true;
  reasons = values(TransactionTypeEnum);
  userSearchInput$: Subject<string> = new Subject<string>();
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  stats$: Observable<WalletTransactionsStatsType> = this.walletService.stats$;
  users$: Observable<CorporateUserType[]> = this.customersService.infiniteContacts$;
  loadingTransactions$: Observable<boolean> = this.walletService.loadingTransactions$;
  transactions$: Observable<WalletTransactionType[]> = this.walletService.transactions$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;

  config = {
    initialSlide: 0,
    slidesPerView: 1,
  };

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private posService: PosService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    public walletService: WalletService,
    public storageHelper: StorageHelper,
    private translate: TranslateService,
    private sharedService: SharedService,
    private loyaltyService: LoyaltyService,
    public convertorHelper: ConvertorHelper,
    public customersService: CustomersService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.filterForm = this.formBuilder.group({
      from: [subYears(startOfToday(), 20)],
      to: [endOfToday()],
      reason: [undefined],
      transactionId: [undefined],
      includeAllCustomers: [false],
      affected: this.formBuilder.array([
        this.formBuilder.group({
          user: [undefined],
        }),
      ]),
    });
    this.initialValues = this.filterForm.value;
    this.filterForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isFilterButtonDisabled = false;
    });
    this.userSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString: any) => {
          this.customersService.pageIndex = 0;
          this.customersService.infiniteContacts$ = null;
          this.customersService.searchString.next(searchString);
          return this.customersService.searchCorporateUsersByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  ngOnInit() {
    this.walletService.transactionPageLimit = 10;
    combineLatest([this.translate.get('MENUITEMS.TS.ENGAGEMENT'), this.translate.get('MENUITEMS.TS.WALLET_TRANSACTIONS')])
      .pipe(
        rxMap(([engagement, walletTransactions]) => {
          this.breadCrumbItems = [{ label: engagement }, { label: walletTransactions, active: true }];
        }),
      )
      .subscribe();
    this.walletService
      .getWalletTransactionsByAffectedPaginated({
        from: this.walletService.from,
        to: this.walletService.to,
        affected: [{ pos: this.storageHelper.getData('posId') }],
      })
      .subscribe();
    this.walletService.transactionPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.walletService.transactionPageIndex || 0,
        size: this.walletService.transactionPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.walletService.transactionPageIndex || 0) * this.walletService.transactionPageLimit,
        endIndex: Math.min(
          ((this.walletService.transactionPageIndex || 0) + 1) * this.walletService.transactionPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.pos = pos;
    });
    this.userService.user$.pipe(takeUntil(this.unsubscribeAll)).subscribe((user) => {
      this.user = user;
    });
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  ngAfterViewInit() {
    this.customersService.searchCorporateUsersByTarget().subscribe();
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.walletService
        .getWalletTransactionsByAffectedPaginatedByExcel(this.filtredInput() as WalletTransactionsByAffectedFilterInput)
        .subscribe((res) => {
          const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
          const a = this.document.createElement('a');
          this.document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = String('transactions.xlsx');
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        });
    }
  }
  resetDate(field: string) {
    this.filterForm.get(field).reset();
  }

  filter() {
    this.walletService.from = this.filterForm.value.from;
    this.walletService.to = this.filterForm.value.to;
    this.modalService.dismissAll();
    this.walletService.transactionPageIndex = 0;
    this.walletService
      .getWalletTransactionsByAffectedPaginated(this.filtredInput())
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.changeDetectorRef.markForCheck();
      });
  }

  filtredInput() {
    const affected = map(this.filterForm.get('affected').value, (item, i) => {
      return {
        ...(item?.user ? { user: item?.user } : {}),
      };
    }).filter((item) => item?.user);
    return {
      ...FormHelper.getDifference(omit(this.initialValues, 'affected', 'from', 'to'), omit(this.filterForm.value, 'affected', 'from', 'to')),
      ...(this.filterForm.get('includeAllCustomers').value === true
        ? { affected: [{ pos: this.storageHelper.getData('posId') }] }
        : affected?.length
        ? {
            affected,
          }
        : {}),
      from: this.walletService.from,
      to: this.walletService.to,
    };
  }

  loadMoreUsers() {
    this.customersService.isLast$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.customersService.pageIndex += 1;
        this.customersService.searchCorporateUsersByTarget().subscribe();
      }
    });
  }

  addAffectedField() {
    (this.filterForm.get('affected') as FormArray).push(
      this.formBuilder.group({
        user: [undefined],
      }),
    );
  }

  removeAffectedField(index: number) {
    (this.filterForm.get('affected') as FormArray).removeAt(index);
  }

  reset() {
    this.walletService.from = subYears(startOfToday(), 20);
    this.walletService.to = endOfToday();
    this.filterForm.patchValue({
      from: this.walletService.from,
      to: this.walletService.to,
      reason: undefined,
      transactionId: undefined,
      includeAllCustomers: false,
    });
    forEach(this.filterForm.get('affected').value, (control, i: number) => {
      if (i === 0) {
        (this.filterForm.get('affected') as FormArray).at(0).patchValue({ user: undefined });
      } else {
        (this.filterForm.get('affected') as FormArray).removeAt(i);
      }
    });
  }

  openFilterModal(content: any) {
    this.isFilterButtonDisabled = true;
    this.modalService.open(content, { centered: true });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.walletService.transactionPageIndex = page - 1;
    if (this.pageChanged) {
      this.walletService
        .getWalletTransactionsByAffectedPaginated({
          from: this.walletService?.from,
          to: this.walletService?.to,
          affected: [{ pos: this.storageHelper.getData('posId') }],
        })
        .subscribe();
    }
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
    this.customersService.pageIndex = 0;
    this.filterForm.reset();
    this.walletService.from = subYears(startOfToday(), 20);
    this.walletService.to = endOfToday();
    this.customersService.infiniteContacts$ = null;
    this.walletService.transactionPageIndex = 0;
  }
}
