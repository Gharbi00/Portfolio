import { isEqual, values } from 'lodash';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { OnInit, Component, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { IPagination } from '@diktup/frontend/models';
import { RequestsService } from '../requests.service';
import { RequestStatusEnum, RequestType, RequestTypeEnum } from '@sifca-monorepo/terminal-generator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from '../../../../core/services/user.service';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bosk-requests-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  emailForm: FormGroup;
  pageChanged: boolean;
  requestForm: FormGroup;
  requests: RequestType[];
  pagination: IPagination;
  isButtonDisabled = true;
  breadCrumbItems!: Array<{}>;
  selectedRequest: RequestType;
  types = values(RequestTypeEnum);
  status = values(RequestStatusEnum);
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  isEmailButtonDisabled = true;
  requests$: Observable<RequestType[]> = this.requestsService.requests$;
  loadingRequests$: Observable<boolean> = this.requestsService.loadingRequests$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private convertorHelper: ConvertorHelper,
    private requestsService: RequestsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.requestsService.searchString = searchValues.searchString;
          return this.requestsService.getRequestsByTypeAndTargetPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.requestsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.requestsService.pageIndex || 0,
        size: this.requestsService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.requestsService.pageIndex || 0) * this.requestsService.filterLimit,
        endIndex: Math.min(((this.requestsService.pageIndex || 0) + 1) * this.requestsService.filterLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.REQUESTS').subscribe((requests: string) => {
        this.breadCrumbItems = [{ label: website }, { label: requests, active: true }];
      });
    });
  }

  openFilterModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.requestsService.getRequestsByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('requests.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: any) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.requestsService
      .sendRequestsBymail(this.emailForm.get('emails').value)
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.requestsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.requestsService.getRequestsByTypeAndTargetPaginated().subscribe();
    }
  }

  onTypeChange(event: any) {
    event.target.value !== 'All' ? (this.requestsService.type = event.target.value) : (this.requestsService.type = null);
    this.requestsService.pageIndex = 0;
    this.requestsService.getRequestsByTypeAndTargetPaginated().subscribe();
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
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  save() {
    this.isButtonDisabled = true;
    this.requestsService
      .updateRequestStatus(this.selectedRequest.id, this.requestForm.get('status').value)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  openRequestModal(content: any, request: RequestType) {
    this.selectedRequest = request;
    this.requestForm = this.formBuilder.group({
      status: [request?.status || '', Validators.required],
    });
    const initialValues = this.requestForm.value;
    this.requestForm.valueChanges.subscribe((requestFormValues) => (this.isButtonDisabled = isEqual(initialValues, requestFormValues)));
    this.modalService.open(content, { centered: true });
  }

  ngOnDestroy() {
    this.requestsService.pageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
