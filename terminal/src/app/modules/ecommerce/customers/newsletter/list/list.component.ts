import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { isEqual } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, throwError } from 'rxjs';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs/operators';
import { Component, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { NewsletterType, UserType } from '@sifca-monorepo/terminal-generator';

import { NewsletterService } from '../newsletter.service';
import { UserService } from '../../../../../core/services/user.service';
import { SharedService } from '../../../../../shared/services/shared.service';

@Component({
  selector: 'coupons-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsLetterListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  emailForm: FormGroup;
  pageChanged: boolean;
  selectedUser: UserType;
  pagination: IPagination;
  paginationRange: number[];
  breadCrumbItems!: Array<{}>;
  subscribers$: Observable<NewsletterType[]> = this.newsletterService.subscribers$;
  loadingNewsLetter$: Observable<boolean> = this.newsletterService.loadingNewsLetter$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  isEmailButtonDisabled = true;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private convertorHelper: ConvertorHelper,
    private changeDetectorRef: ChangeDetectorRef,
    private newsletterService: NewsletterService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Newsletter' }, { label: 'Gallery', active: true }];
    this.newsletterService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.newsletterService.pageIndex || 0,
        size: this.newsletterService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.newsletterService.pageIndex || 0) * this.newsletterService.pageLimit,
        endIndex: Math.min(((this.newsletterService.pageIndex || 0) + 1) * this.newsletterService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.newsletterService.searchString = searchValues.searchString;
          return this.newsletterService.getSubscribersToNewsletterPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.newsletterService
      .sendNewslettreBymail(this.emailForm.get('emails').value)
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
      this.newsletterService.getNewslettersByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('newsletters.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  position() {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Your work has been saved',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  modalError() {
    Swal.fire({
      title: 'Oops...',
      text: 'Something went wrong!',
      icon: 'warning',
      showCancelButton: false,
      confirmButtonColor: 'rgb(3, 142, 220)',
      cancelButtonColor: 'rgb(243, 78, 78)',
    });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.newsletterService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.newsletterService.getSubscribersToNewsletterPaginated().subscribe();
    }
  }

  exportUsers(): void {
    this.newsletterService.getSubscribersToNewsletterPaginated().subscribe((users) => {
      const worksheet = XLSX.utils.json_to_sheet(users);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      XLSX.writeFile(workbook, 'users.xlsx');
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.newsletterService.pageIndex = 0;
    this.newsletterService.searchString = '';
  }
}
