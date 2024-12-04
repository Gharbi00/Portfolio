import { isEqual, map } from 'lodash';
import { Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Observable, Subject, takeUntil, throwError } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { CorporateUserType, LeaderboardBaseType, LeaderboardCycleEnum, LoyaltySettingsType, UserType } from '@sifca-monorepo/terminal-generator';

import { LeaderboardService } from '../leaderboard.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../../../core/services/user.service';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'leaderboard-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

  page = 0;
  emailForm: FormGroup;
  pageChanged: boolean;
  pagination: IPagination;
  customerForm: FormGroup;
  breadCrumbItems!: Array<{}>;
  leaderboard: LeaderboardBaseType[];
  cycle: LeaderboardCycleEnum = LeaderboardCycleEnum.OVERALL;
  loadingLeaderBoard$: Observable<boolean> = this.leaderboardService.loadingLeaderBoard$;
  leaderboard$: Observable<LeaderboardBaseType[]> = this.leaderboardService.leaderboards$;
  searchForm: FormGroup = this.formBuilder.group({
    searchString: [''],
  });
  isEmailButtonDisabled = true;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;

  get pictures(): FormArray {
    return this.customerForm.get('pictures') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private loyaltyService: LoyaltyService,
    private convertorHelper: ConvertorHelper,
    private changeDetectorRef: ChangeDetectorRef,
    private leaderboardService: LeaderboardService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.translate.get('MENUITEMS.TS.ENGAGEMENT').subscribe((engagement: string) => {
      this.translate.get('MENUITEMS.TS.LEADEBOARD').subscribe((leaderboard: string) => {
        this.breadCrumbItems = [{ label: engagement }, { label: leaderboard, active: true }];
      });
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.leaderboardService.searchString = searchValues.searchString;
          return this.leaderboardService.getLiveLeaderboardByCyclePaginated(this.cycle);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.leaderboardService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: any) => {
      this.pagination = {
        length: pagination?.length,
        page: this.leaderboardService.pageIndex ? this.leaderboardService.pageIndex + 1 : 1,
        size: this.leaderboardService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.leaderboardService.pageIndex || 0) * this.leaderboardService.pageLimit,
        endIndex: Math.min(((this.leaderboardService.pageIndex || 0) + 1) * this.leaderboardService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.leaderboardService
      .sendLiveLeaderboardByCycleBymail(this.emailForm.get('emails').value, this.cycle)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.position();
        this.changeDetectorRef.markForCheck();
      });
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: UserType) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.leaderboardService.getLiveLeaderboardByCycleByExcel(this.cycle).subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('leaderboard.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
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

  openCustomerModal(content: any, customer: CorporateUserType) {
    this.modalService.open(content, { centered: true });
    this.customerForm = this.formBuilder.group({
      title: [customer?.title || ''],
      about: [customer?.about || ''],
      pictures: this.formBuilder.array(
        customer?.pictures?.length
          ? map(customer?.pictures, (picture) => {
              return this.formBuilder.group({
                baseUrl: picture?.baseUrl,
                path: picture?.path,
              });
            })
          : [],
      ),
      phone: this.formBuilder.group({
        countryCode: [customer?.phone?.countryCode || ''],
        number: [customer?.phone?.number || ''],
      }),
      dateOfBirth: [customer?.dateOfBirth || null],
      lastName: [customer?.lastName || ''],
      firstName: [customer?.firstName || ''],
      email: [customer?.email || ''],
      residentialAddress: this.formBuilder.group({
        address: [customer?.residentialAddress?.[0]?.address || ''],
      }),
    });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.leaderboardService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.leaderboardService.getLiveLeaderboardByCyclePaginated(this.cycle).subscribe();
    }
  }

  getLeaderboards(value: string) {
    this.leaderboardService.getLiveLeaderboardByCyclePaginated(this.cycle).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.leaderboardService.pageIndex = 0;
    this.leaderboardService.searchString = '';
  }
}
