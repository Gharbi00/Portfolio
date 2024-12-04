import { isEqual, map, values } from 'lodash';
import { Observable, Subject, takeUntil, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { LoyaltySettingsType, SubscriptionStatus, UserRole, UserType } from '@sifca-monorepo/terminal-generator';
import { CorporateUserType } from '@sifca-monorepo/terminal-generator';
import { SubscribersFullWithReputationType } from '@sifca-monorepo/terminal-generator';

import { SubscribersService } from '../subscribers.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../../../core/services/user.service';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'subscribers',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribersListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  subscribers: SubscribersFullWithReputationType[];
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  status = values(SubscriptionStatus);
  page = 0;
  pageChanged: boolean;
  emailForm: FormGroup;
  customerForm: FormGroup;
  selectedStatus: any[] = [];
  isEmailButtonDisabled = true;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingSubscribers$: Observable<boolean> = this.subscribersService.loadingSubscribers$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;
  subscribers$: Observable<SubscribersFullWithReputationType[]> = this.subscribersService.subscribers$;
  searchForm: FormGroup = this.formBuilder.group({
    searchString: [''],
  });

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
    private userService: UserService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private loyaltyService: LoyaltyService,
    private convertorHelper: ConvertorHelper,
    private subscribersService: SubscribersService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.translate.get('MENUITEMS.TS.ENGAGEMENT').subscribe((engagement: string) => {
      this.translate.get('MENUITEMS.TS.SUBSCRIBERS').subscribe((subcribers: string) => {
        this.breadCrumbItems = [{ label: engagement }, { label: subcribers, active: true }];
      });
    });
    this.subscribersService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.subscribersService.pageIndex ? this.subscribersService.pageIndex + 1 : 1,
        size: this.subscribersService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.subscribersService.pageIndex || 0) * this.subscribersService.pageLimit,
        endIndex: Math.min(((this.subscribersService.pageIndex || 0) + 1) * this.subscribersService.pageLimit - 1, pagination?.length - 1),
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
          this.changeDetectorRef.markForCheck();
          this.subscribersService.searchString = searchValues.searchString;
          return this.subscribersService.searchTargetSubscribers();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.subscribersService
      .sendTargetSubscribersBymail(this.emailForm.get('emails').value)
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
      this.subscribersService.getTargetSubscribersByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('subscribers.xlsx');
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

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.subscribersService.status.push(status);
    } else {
      const index = this.subscribersService.status.indexOf(status);
      if (index > -1) {
        this.subscribersService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.subscribersService.status;
    this.subscribersService.searchTargetSubscribers().subscribe();
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
      roles: [[UserRole.CONSUMER]],
      email: [customer?.email || ''],
      residentialAddress: this.formBuilder.group({
        address: [customer?.residentialAddress[0]?.address || ''],
      }),
    });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.subscribersService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.subscribersService.searchTargetSubscribers().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.subscribersService.pageIndex = 0;
    this.subscribersService.searchString = '';
    this.subscribersService.status = [];
  }
}
