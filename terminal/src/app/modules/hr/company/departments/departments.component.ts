import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, Observable, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { DepartmentsService } from './departments.service';
import { DepartmentType } from '@sifca-monorepo/terminal-generator';
import { SharedService } from '../../../../shared/services/shared.service';
import { isEqual } from 'lodash';
import { IPagination } from '@diktup/frontend/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  content?: any;
  isLoading = true;
  pageChanged: boolean;
  pagination: IPagination;
  isButtonDisabled = true;
  departmentForm: FormGroup;
  breadCrumbItems!: Array<{}>;
  selectedDept: DepartmentType;
  departments: DepartmentType[];
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private departmentsService: DepartmentsService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.departmentsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.departmentsService.pageIndex || 0,
        size: this.departmentsService.limit,
        lastPage: pagination?.length - 1,
        startIndex: (this.departmentsService.pageIndex || 0) * this.departmentsService.limit,
        endIndex: Math.min(((this.departmentsService.pageIndex || 0) + 1) * this.departmentsService.limit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.departmentsService.departments$.pipe(takeUntil(this.unsubscribeAll)).subscribe((departments: DepartmentType[]) => {
      this.departments = departments;
      this.sharedService.isLoading$ = false;
      this.changeDetectorRef.markForCheck();
    });
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.HR').subscribe((hr: string) => {
      this.translate.get('MENUITEMS.TS.DEPARTMENTS').subscribe((departments: string) => {
        this.breadCrumbItems = [{ label: hr }, { label: departments, active: true }];
      });
    });

    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isLoading = true;
          this.changeDetectorRef.markForCheck();
          this.departmentsService.searchString = searchValues.searchString;
          return this.departmentsService.getDepartments();
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.departmentsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.departmentsService.getDepartments().subscribe();
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

  save() {
    this.isButtonDisabled = true;
    if (!this.selectedDept) {
      this.departmentsService
        .createDepartment(this.departmentForm.get('name').value)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.pagination.length++;
          this.pagination.endIndex++;
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    } else {
      const a = { ...this.selectedDept, name: this.departmentForm.get('name').value };
      this.departmentsService
        .updateDepartment(a)
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
    }
  }

  openDepartmentModal(content: any, dep: any) {
    this.selectedDept = dep;
    this.modalService.open(content, { size: 'md', centered: true });
    this.departmentForm = this.formBuilder.group({
      name: [dep?.name || '', Validators.required],
    });
    const initValues = this.departmentForm?.value;
    this.departmentForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val): void => {
      this.isButtonDisabled = isEqual(val, initValues);
    });
  }

  openDeleteLocation(content: any, dep: any) {
    this.selectedDept = dep;
    this.modalService.open(content, { centered: true });
  }

  deleteDepartment() {
    this.departmentsService
      .deleteDepartment(this.selectedDept.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.pagination.length--;
        this.pagination.endIndex--;
        this.modalService.dismissAll();
      });
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.departmentsService.pageIndex = 0;
    this.departmentsService.searchString = '';
  }
}
