/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  DepartmentType,
  CreateDepartmentGQL,
  DeleteDepartmentGQL,
  SearchDepartmentsByTargetGQL,
  UpdateDepartmentGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  private pagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);
  private departments: BehaviorSubject<DepartmentType[] | null> = new BehaviorSubject(null);

  pageIndex = 0;
  limit = 10;
  searchString = '';
  pageLimit = 10;

  constructor(
    private storageHelper: StorageHelper,
    private createDepartmentGQL: CreateDepartmentGQL,
    private deleteDepartmentGQL: DeleteDepartmentGQL,
    private updateDepartmentGQL: UpdateDepartmentGQL,
    private searchDepartmentsByTargetGQL: SearchDepartmentsByTargetGQL,
  ) {}

  get departments$(): Observable<DepartmentType[]> {
    return this.departments.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  getDepartments(): Observable<DepartmentType[]> {
    return this.searchDepartmentsByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        pagination: { page: this.pageIndex, limit: this.limit },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.limit,
              length: data.searchDepartmentsByTarget?.count,
            });
            this.departments.next(data.searchDepartmentsByTarget.objects);
            return data.searchDepartmentsByTarget.objects;
          }
        }),
      );
  }

  searchJobDepartmentsByTarget(): Observable<DepartmentType[]> {
    return this.searchDepartmentsByTargetGQL
      .fetch({
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.departments.next(data.searchDepartmentsByTarget.objects);
          }
        }),
      );
  }

  createDepartment(name: string): Observable<DepartmentType> {
    return this.createDepartmentGQL.mutate({ input: { name, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const departments = [data.createDepartment, ...this.departments.value];
          this.departments.next(departments);
          return data.createDepartment;
        }
      }),
    );
  }

  deleteDepartment(id: string): Observable<DepartmentType[]> {
    return this.deleteDepartmentGQL.mutate({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          const departments = this.departments.value.filter((a) => a.id !== id);
          this.departments.next(departments);
          return departments;
        }
      }),
    );
  }

  updateDepartment(department: DepartmentType): Observable<DepartmentType[]> {
    return this.updateDepartmentGQL.mutate({ id: department.id, input: { name: department.name } }).pipe(
      tap((response: any) => {
        if (response.data) {
          const index = this.departments.value.map((a) => a.id).indexOf(department.id);
          const departments = this.departments.value;
          departments[index] = department;
          this.departments.next(departments);
          return departments;
        }
      }),
    );
  }
}
