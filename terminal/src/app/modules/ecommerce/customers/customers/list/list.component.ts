import Swal from 'sweetalert2';
import { isEqual } from 'lodash';
import { Observable, ReplaySubject, Subject, combineLatest, of, map as rxMap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnInit, Component, ChangeDetectorRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs/operators';

import { IPagination } from '@diktup/frontend/models';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { UserStatus, UserType } from '@sifca-monorepo/terminal-generator';
import { CorporateUserType } from '@sifca-monorepo/terminal-generator';

import { CustomersService } from '../customers.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../../core/services/user.service';

@Component({
  selector: 'customers-list',
  styleUrls: ['./list.component.scss'],
  templateUrl: './list.component.html',
})
export class CustomersListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInputExcel = this.document.createElement('input');

  page = 0;
  initialValues: any;
  emailForm: FormGroup;
  pageChanged: boolean;
  loadingImport: boolean;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  isEmailButtonDisabled = true;
  contacts: CorporateUserType[];
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  isLoading$: Observable<boolean> = this.customersService.isLoading$;
  contacts$: Observable<CorporateUserType[]> = this.customersService.contacts$;

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
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private convertorHelper: ConvertorHelper,
    private customersService: CustomersService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.customersService.contacts$.subscribe((contacts) => {
      this.contacts = contacts;
      this.changeDetectorRef.markForCheck();
    })
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.customersService.searchString.next(searchValues.searchString);
          return this.customersService.searchCorporateUsersByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    combineLatest([this.translate.get('MENUITEMS.TS.ECOMMERCE'), this.translate.get('MENUITEMS.TS.CUSTOMERS')]).pipe(
      rxMap(([ecommerce, customers]) => (this.breadCrumbItems = [{ label: ecommerce }, { label: customers, active: true }])),
    );
    this.customersService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.customersService.pageIndex || 0,
        size: this.customersService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.customersService.pageIndex || 0) * this.customersService.filterLimit,
        endIndex: Math.min(((this.customersService.pageIndex || 0) + 1) * this.customersService.filterLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.fileInputExcel.type = 'file';
    this.fileInputExcel.name = 'file';
    this.fileInputExcel.multiple = true;
    this.fileInputExcel.style.display = 'none';
    this.fileInputExcel.addEventListener('change', () => {
      if (this.fileInputExcel.files.length) {
        this.convertFile(this.fileInputExcel.files[0]).subscribe((base64) => {
          this.loadingImport = true;
          this.customersService
            .importTargetUsersByExcel(base64)
            .pipe(
              catchError(() => {
                this.loadingImport = false;
                this.modalService.dismissAll();
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe((res) => {
              this.loadingImport = false;
              if (res) {
                this.modalService.dismissAll();
                this.position();
                this.changeDetectorRef.markForCheck();
              }
            });
        });
      }
    });
  }

  uploadExcel(): void {
    this.loadingImport = false;
    this.fileInputExcel.value = '';
    this.fileInputExcel.click();
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(window.btoa(event.target.result.toString()));
    return result;
  }

  openImportModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
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

  send() {
    this.isEmailButtonDisabled = true;
    this.customersService
      .sendTargetUsersBymail(this.emailForm.get('emails').value)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.customersService.getTargetUsersByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('customers.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  onChange(event: any) {
    this.customersService.status.next(
      event.target.checked === true ? [UserStatus.ONLINE] : [UserStatus.ONLINE, UserStatus.AWAY, UserStatus.OFFLINE, UserStatus.BUSY],
    );
    this.customersService.searchCorporateUsersByTarget().subscribe();
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.customersService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.customersService.searchCorporateUsersByTarget().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.customersService.pageIndex = 0;
    this.customersService.searchString.next('');
  }
}
