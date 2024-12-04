import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  MailResponseDto,
  JobDefinitionGQL,
  JobDefinitionType,
  JobDefinitionInput,
  CreateJobDefinitionGQL,
  UpdateJobDefinitionGQL,
  JobDefinitionStatusEnum,
  JobDefinitionUpdateInput,
  JobDefinitionPaginatedType,
  GetJobDefinitionsByExcelGQL,
  SendJobDefinitionsBymailGQL,
  SearchJobDefinitionsByTargetGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import { InvoicePdfType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class JobPositionsService {
  private isLastJob: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private jobDef: BehaviorSubject<JobDefinitionType[]> = new BehaviorSubject(null);
  private loadingjobDefinitions: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private jobDefinition: BehaviorSubject<JobDefinitionType> = new BehaviorSubject(null);
  private jobDefinitions: BehaviorSubject<JobDefinitionType[]> = new BehaviorSubject(null);

  pageLimit = 10;
  pageIndex = 0;
  searchString = '';

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get jobDefinition$(): Observable<JobDefinitionType> {
    return this.jobDefinition.asObservable();
  }
  set jobDefinition$(value: any) {
    this.jobDefinition.next(value);
  }
  get jobDef$(): Observable<JobDefinitionType[]> {
    return this.jobDef.asObservable();
  }
  set jobDef$(value: any) {
    this.jobDef.next(value);
  }

  get jobDefinitions$(): Observable<JobDefinitionType[]> {
    return this.jobDefinitions.asObservable();
  }

  get loadingjobDefinitions$(): Observable<boolean> {
    return this.loadingjobDefinitions.asObservable();
  }

  get isLastJob$(): Observable<boolean> {
    return this.isLastJob.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private jobDefinitionGQL: JobDefinitionGQL,
    private createJobDefinitionGQL: CreateJobDefinitionGQL,
    private updateJobDefinitionGQL: UpdateJobDefinitionGQL,
    private getJobDefinitionsByExcelGQL: GetJobDefinitionsByExcelGQL,
    private sendJobDefinitionsBymailGQL: SendJobDefinitionsBymailGQL,
    private searchJobDefinitionsByTargetGQL: SearchJobDefinitionsByTargetGQL,
  ) {}

  getJobDefinitionsByExcel(status?: JobDefinitionStatusEnum[]): Observable<MailResponseDto> {
    return this.getJobDefinitionsByExcelGQL
      .fetch({
        ...(status?.length ? { status } : {}),
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getJobDefinitionsByExcel.content;
          }
        }),
      );
  }

  sendJobDefinitionsBymail(emails: string, status?: JobDefinitionStatusEnum[]): Observable<InvoicePdfType> {
    return this.sendJobDefinitionsBymailGQL
      .fetch({
        emails,
        ...(status?.length ? { status } : {}),
        subject: 'Your export of positions',
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.sendJobDefinitionsBymail;
          }
        }),
      );
  }

  jobDefinitionById(id: string): Observable<JobDefinitionType> {
    return this.jobDefinitionGQL.fetch({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.jobDefinition.next(response.data.jobDefinition);
          return response.data.jobDefinition;
        }
      }),
    );
  }

  searchJobDefinitionsByTarget(status?: JobDefinitionStatusEnum[]): Observable<JobDefinitionPaginatedType> {
    this.loadingjobDefinitions.next(true);
    return this.searchJobDefinitionsByTargetGQL
      .fetch({
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
        ...(status?.length ? { status } : {}),
        pagination: {
          page: this.pageIndex,
          limit: 4,
        },
      })
      .pipe(
        map((response: any) => {
          if (response.data) {
            this.loadingjobDefinitions.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: response.data.searchJobDefinitionsByTarget?.count,
            });
            this.isLastJob.next(response.data.searchJobDefinitionsByTarget.isLast);
            this.jobDefinitions.next(response.data.searchJobDefinitionsByTarget.objects);
            this.jobDef.next(
              this.pageIndex === 0
                ? response.data.searchJobDefinitionsByTarget.objects
                : [...this.jobDef.value, ...response.data.searchJobDefinitionsByTarget.objects],
            );
            return response.data.searchJobDefinitionsByTarget.objects;
          }
        }),
      );
  }

  createJobDefinition(input: JobDefinitionInput): Observable<JobDefinitionType> {
    return this.createJobDefinitionGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      tap((response: any) => {
        if (response.data) {
          if (this.jobDefinitions.value?.length) {
            this.jobDefinitions.next([response.data.createJobDefinition, ...this.jobDefinitions.value]);
          } else {
            this.jobDefinitions.next(response.data.createJobDefinition);
          }
          return response.data.createJobDefinition;
        }
      }),
    );
  }

  updateJobDefinition(id: string, input: JobDefinitionUpdateInput): Observable<JobDefinitionType> {
    return this.updateJobDefinitionGQL.mutate({ id, input }).pipe(
      tap(({ data }: any) => {
        if (data) {
          if (this.jobDefinitions.value?.length) {
            const jobDefinitions = this.jobDefinitions.value;
            const index = jobDefinitions?.findIndex((a) => a.id === id);
            jobDefinitions[index] = data.updateJobDefinition;
            this.jobDefinitions.next(jobDefinitions);
          }
          return data.updateJobDefinition;
        }
      }),
    );
  }
}
