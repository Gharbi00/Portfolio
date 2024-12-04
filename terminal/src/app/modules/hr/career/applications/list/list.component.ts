import { isEqual, values } from 'lodash';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { OnInit, Component, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { IPagination } from '@diktup/frontend/models';
import { ConvertorHelper, FormHelper } from '@diktup/frontend/helpers';
import { JobApplicationBaseType, JobApplicationStatusEnum, JobDefinitionType, UserType } from '@sifca-monorepo/terminal-generator';

import { ApplicationsService } from '../applications.service';
import { JobPositionsService } from '../../positions/positions.service';
import { UserService } from '../../../../../core/services/user.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-applications-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ApplicationsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  jobApp: any;
  pageChanged: boolean;
  emailForm: FormGroup;
  statusForm: FormGroup;
  filterForm: FormGroup;
  pagination: IPagination;
  isButtonDisabled = true;
  paginationRange: number[];
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  isEmailButtonDisabled = true;
  isFilterButtonDisabled = true;
  statuses = values(JobApplicationStatusEnum);
  selelectedApplication: JobApplicationBaseType;
  JobApplicationStatus = values(JobApplicationStatusEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingApplications$: Observable<boolean> = this.jobApplicationService.loadingApplications$;
  jobDefinitions$: Observable<JobDefinitionType[]> = this.jobPositionsService.jobDef$;
  applications$: Observable<JobApplicationBaseType[]> = this.jobApplicationService.applications$;
  searchForm: FormGroup = this.formBuilder.group({
    searchString: [''],
  });
  chanedValues: any;
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
    private convertorHelper: ConvertorHelper,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private jobPositionsService: JobPositionsService,
    private jobApplicationService: ApplicationsService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.jobApplicationService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.jobApplicationService.pageIndex ? this.jobApplicationService.pageIndex + 1 : 1,
        size: this.jobApplicationService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.jobApplicationService.pageIndex || 0) * this.jobApplicationService.filterLimit,
        endIndex: Math.min(((this.jobApplicationService.pageIndex || 0) + 1) * this.jobApplicationService.filterLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.HR').subscribe((hr: string) => {
      this.translate.get('MENUITEMS.TS.APPLICATIONS').subscribe((applications: string) => {
        this.breadCrumbItems = [{ label: hr }, { label: applications, active: true }];
      });
    });
    this.jobApplicationService.jobDefinition = [];
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.jobApplicationService.searchString = searchValues.searchString;
          return this.jobApplicationService.getJobApplicationsByTargetWithFilterPagination();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  resetDate(field: String) {
    if (field === 'from') {
      this.filterForm.get('from').patchValue('');
    } else {
      this.filterForm.get('to').patchValue('');
    }
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.jobApplicationService
      .sendJobApplicationsByMail(this.emailForm.get('emails').value)
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

  downloadAppDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.jobApplicationService.getJobApplicationsByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('applications.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  loadMoreJobs() {
    this.jobPositionsService.isLastJob$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.jobPositionsService.pageIndex++;
        this.jobPositionsService.searchJobDefinitionsByTarget().subscribe();
      }
    });
  }

  openFilterModal(content: any) {
    this.isFilterButtonDisabled = true;
    this.jobPositionsService.jobDef$ = null;
    this.jobPositionsService.pageIndex = 0;
    this.jobPositionsService.searchJobDefinitionsByTarget().subscribe();
    this.modalService.open(content, { centered: true });
    this.filterForm = this.formBuilder.group({
      jobDefinition: [this.chanedValues?.jobDefinition || []],
      status: [this.chanedValues?.status || []],
      from: [this.chanedValues?.from || ''],
      to: [this.chanedValues?.to || ''],
    });
    const initialValues = this.filterForm.value;
    this.filterForm.valueChanges.subscribe((val) => {
      this.isFilterButtonDisabled = isEqual(val, initialValues);
    });
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  reset() {
    this.filterForm.reset();
  }

  resetForm() {
    this.filterForm.reset();
  }

  onStatusChange(status: string, isChecked: boolean, field: string) {
    if (isChecked) {
      this.selectedStatus.push(status);
    } else {
      const index = this.selectedStatus.indexOf(status);
      if (index > -1) {
        this.selectedStatus.splice(index, 1);
      }
    }
    if (field === 'drop') {
      const input: any = {
        status: this.selectedStatus,
      };
      this.jobApplicationService
        .getJobApplicationsByTargetWithFilterPagination(input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.filterForm.get('status').patchValue(this.selectedStatus);
    }
  }

  saveFilter() {
    const input: any = {
      ...FormHelper.getNonEmptyValues(this.filterForm.value),
    };
    this.jobApplicationService
      .getJobApplicationsByTargetWithFilterPagination(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.chanedValues = this.filterForm.value;
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  openStatusModal(content: any, application: JobApplicationBaseType) {
    this.selelectedApplication = application;
    this.modalService.open(content, { centered: true });
    this.statusForm = this.formBuilder.group({
      status: [application?.status || ''],
    });
    const initialValues = this.statusForm.value;
    this.statusForm.valueChanges.subscribe((jobDefValues) => {
      this.isButtonDisabled = isEqual(jobDefValues, initialValues);
    });
  }

  save() {
    this.isButtonDisabled = true;
    const input: any = {
      status: this.statusForm.get('status').value,
    };
    this.jobApplicationService
      .updateJobApplication(this.selelectedApplication?.id, input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
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

  downloadDocument(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.jobApplicationService.findDocumentById(id).subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res.content.base64, res.content.type.type);
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String(res.name);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.jobApplicationService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.jobApplicationService.getJobApplicationsByTargetWithFilterPagination().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.jobApplicationService.pageIndex = 0;
    this.jobApplicationService.searchString = '';
  }
}
