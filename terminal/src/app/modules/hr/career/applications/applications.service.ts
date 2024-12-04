import { Injectable } from '@angular/core';
import { map as rxMap, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { UserType, DocumentType } from '@sifca-monorepo/terminal-generator';
import {
  JobApplicationGQL,
  JobApplicationType,
  InvoicePdfType,
  JobApplicationInput,
  JobApplicationBaseType,
  UpdateJobApplicationGQL,
  JobApplicationBasePaginatedType,
  GetJobApplicationsByTargetWithFilterPaginationGQL,
  JobApplicationFilterInput,
  MailResponseDto,
  SendJobApplicationsByMailGQL,
  GetJobApplicationsByExcelGQL,
  FindDocumentByIdGQL
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private users: BehaviorSubject<UserType[]> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingApplications: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private application: BehaviorSubject<JobApplicationBaseType> = new BehaviorSubject(null);
  private applications: BehaviorSubject<JobApplicationBaseType[]> = new BehaviorSubject(null);

  to: string;
  status: [];
  from: string;
  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  jobDefinition = [];

  get applications$(): Observable<JobApplicationBaseType[]> {
    return this.applications.asObservable();
  }

  get loadingApplications$(): Observable<boolean> {
    return this.loadingApplications.asObservable();
  }

  set applications$(value: any) {
    this.application.next(value);
  }

  get application$(): Observable<JobApplicationBaseType> {
    return this.application.asObservable();
  }

  get users$(): Observable<UserType[]> {
    return this.users.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private jobApplicationGQL: JobApplicationGQL,
    private findDocumentByIdGQL: FindDocumentByIdGQL,
    // private getJobApplicationsGQL: GetJobApplicationsGQL,
    private updateJobApplicationGQL: UpdateJobApplicationGQL,
    private sendJobApplicationsByMailGQL: SendJobApplicationsByMailGQL,
    private getJobApplicationsByExcelGQL: GetJobApplicationsByExcelGQL,
    private getJobApplicationsByTargetWithFilterPaginationGQL: GetJobApplicationsByTargetWithFilterPaginationGQL,
  ) {}

  sendJobApplicationsByMail(emails: string): Observable<MailResponseDto> {
    return this.sendJobApplicationsByMailGQL
      .fetch({
        emails,
        subject: 'Your export of subscribers',
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.sendTargetSubscribersBymail;
          }
        }),
      );
  }

  getJobApplicationsByExcel(filter?: JobApplicationFilterInput): Observable<InvoicePdfType> {
    return this.getJobApplicationsByExcelGQL
      .fetch({
        filter,
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getJobApplicationsByExcel.content;
          }
        }),
      );
  }

  updateJobApplication(id: string, input: JobApplicationInput): Observable<JobApplicationType> {
    return this.applications$.pipe(
      take(1),
      switchMap((applications) =>
        this.updateJobApplicationGQL
          .mutate({
            id,
            input,
          })
          .pipe(
            rxMap((response: any) => {
              if (response.data) {
                const index = applications.findIndex((item) => item.id === id);
                applications[index] = response.data.updateJobApplication;
                this.applications.next(applications);
                return response.data.updateJobApplication;
              }
              return null;
            }),
          ),
      ),
    );
  }

  findDocumentById(id: string): Observable<DocumentType> {
    return this.findDocumentByIdGQL.fetch({ id }).pipe(
      rxMap(({ data }: any) => {
        return data.findDocumentById;
      }),
    );
  }

  getJobApplicationsByTargetWithFilterPagination(filter: JobApplicationFilterInput = {}): Observable<JobApplicationBasePaginatedType> {
    this.loadingApplications.next(true);
    return this.getJobApplicationsByTargetWithFilterPaginationGQL
      .fetch({
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: {
          page: this.pageIndex,
          limit: this.filterLimit,
        },
        filter,
      })
      .pipe(
        map((response: any) => {
          if (response) {
            this.loadingApplications.next(false);
            this.applications.next(response.data.getJobApplicationsByTargetWithFilterPagination.objects);
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: response.data.getJobApplicationsByTargetWithFilterPagination?.count,
            });
            return response.data.getJobApplicationsByTargetWithFilterPagination.objects;
          }
        }),
      );
  }

  // getjobApplications(): Observable<JobApplicationBaseType[]> {
  //   return this.getJobApplicationsGQL.fetch().pipe(
  //     map((response: any) => {
  //       if (response) {
  //         this.applications.next(response.data.getJobApplications);
  //         return response.data.getJobApplications;
  //       }
  //     }),
  //   );
  // }

  getjobApplicationById(id: string): Observable<JobApplicationType> {
    return this.jobApplicationGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.application.next(data.jobApplication);
          return data.jobApplication;
        }
      }),
    );
  }
}
