import Swal from 'sweetalert2';
import { isEqual, values } from 'lodash';
import { Observable, Subject, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';

import { UserType, JobDefinitionType, JobDefinitionStatusEnum } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { ConvertorHelper } from '@diktup/frontend/helpers';

import { JobPositionsService } from '../positions.service';
import { UserService } from '../../../../../core/services/user.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DepartmentType } from '@sifca-monorepo/terminal-generator';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'positions-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  posId: string;
  filtredStatus = [];
  pageChanged: boolean;
  emailForm: FormGroup;
  statusForm: FormGroup;
  pagination: IPagination;
  isButtonDisabled = true;
  paginationRange: number[];
  breadCrumbItems!: Array<{}>;
  isEmailButtonDisabled: boolean;
  jobDepartments: DepartmentType[];
  selelectedJob: JobDefinitionType;
  jobDefinitionStatus = values(JobDefinitionStatusEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  website$: Observable<WebsiteIntegrationType> = this.websiteService.website$;
  jobDefinitions$: Observable<JobDefinitionType[]> = this.jobsService.jobDefinitions$;
  loadingjobDefinitions$: Observable<boolean> = this.jobsService.loadingjobDefinitions$;

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
    private websiteService: WebsiteService,
    private convertorHelper: ConvertorHelper,
    private jobsService: JobPositionsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.translate.get('MENUITEMS.TS.HR').subscribe((hr: string) => {
      this.translate.get('MENUITEMS.TS.POSITIONS').subscribe((positions: string) => {
        this.breadCrumbItems = [{ label: hr }, { label: positions, active: true }];
      });
    });
    this.jobsService.searchString = '';
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.jobsService.searchString = searchValues.searchString;
          return this.jobsService.searchJobDefinitionsByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.jobsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: any) => {
      this.pagination = {
        length: pagination?.length,
        page: this.jobsService.pageIndex ? this.jobsService.pageIndex + 1 : 1,
        size: this.jobsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.jobsService.pageIndex || 0) * this.jobsService.pageLimit,
        endIndex: Math.min(((this.jobsService.pageIndex || 0) + 1) * this.jobsService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.jobsService
      .sendJobDefinitionsBymail(this.emailForm?.get('emails').value, this.filtredStatus)
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
      this.jobsService.getJobDefinitionsByExcel(this.filtredStatus).subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('positions.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  onStatusChnange(event: any) {
    if (event.target.value === 'all') {
      this.filtredStatus = [];
      this.jobsService.searchJobDefinitionsByTarget(null).subscribe();
    } else {
      this.jobsService.searchJobDefinitionsByTarget(event.target.value).subscribe();
      this.filtredStatus = event.target.value;
    }
  }

  openStatusModal(content: any, job: JobDefinitionType) {
    this.selelectedJob = job;
    this.modalService.open(content, { centered: true });
    this.statusForm = this.formBuilder.group({
      status: [job?.status || ''],
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
    this.jobsService
      .updateJobDefinition(this.selelectedJob?.id, input)
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.jobsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.jobsService.searchJobDefinitionsByTarget().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.jobsService.pageIndex = 0;
    this.jobsService.searchString = '';
  }
}
