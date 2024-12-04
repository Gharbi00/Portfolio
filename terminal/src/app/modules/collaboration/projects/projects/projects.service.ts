import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { IPagination } from '@diktup/frontend/models';
import {
  GetBrandColorsGQL,
  FindContentTypeByTypeGQL,
  ProjectGQL,
  CreateProjectGQL,
  DeleteProjectGQL,
  UpdateProjectGQL,
  CreateDocumentGQL,
  SendProjectsBymailGQL,
  GetProjectsByExcelGQL,
  GetProjectsByTargetGQL,
  GetProjectsByTargetWithFilterGQL,
  KeyValueListType,
  MailResponseDto,
  ProjectType,
  ContentTypeType,
  DeleteResponseDtoType,
  ProjectInput,
  DocumentInput,
  ProjectFilterInput,
  ProjectUpdateInput,
  ProjectPaginateType,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';
import { InvoicePdfType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private loadingProjects: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private project: BehaviorSubject<ProjectType> = new BehaviorSubject<ProjectType>(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private projects: BehaviorSubject<ProjectType[]> = new BehaviorSubject<ProjectType[]>(null);
  private infiniteProjects: BehaviorSubject<ProjectType[]> = new BehaviorSubject<ProjectType[]>(null);
  private brandColors: BehaviorSubject<KeyValueListType[]> = new BehaviorSubject<KeyValueListType[]>(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';

  get loadingProjects$(): Observable<boolean> {
    return this.loadingProjects.asObservable();
  }
  get projects$(): Observable<ProjectType[]> {
    return this.projects.asObservable();
  }
  get infiniteProjects$(): Observable<ProjectType[]> {
    return this.infiniteProjects.asObservable();
  }
  set infiniteProjects$(value: any) {
    this.infiniteProjects.next(value);
  }
  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }
  get brandColors$(): Observable<KeyValueListType[]> {
    return this.brandColors.asObservable();
  }
  get project$(): Observable<ProjectType> {
    return this.project.asObservable();
  }
  set project$(value: any) {
    this.project.next(value);
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private projectGQL: ProjectGQL,
    private storageHelper: StorageHelper,
    private createProjectGQL: CreateProjectGQL,
    private updateProjectGQL: UpdateProjectGQL,
    private deleteProjectGQL: DeleteProjectGQL,
    private createDocumentGQL: CreateDocumentGQL,
    private getBrandColorsGQL: GetBrandColorsGQL,
    private getProjectsByExcelGQL: GetProjectsByExcelGQL,
    private sendProjectsBymailGQL: SendProjectsBymailGQL,
    private getProjectsByTargetGQL: GetProjectsByTargetGQL,
    private findContentTypeByTypeGQL: FindContentTypeByTypeGQL,
    private getProjectsByTargetWithFilterGQL: GetProjectsByTargetWithFilterGQL,
  ) {}

  getProjectsByExcel(filter?: ProjectFilterInput): Observable<InvoicePdfType> {
    return this.getProjectsByExcelGQL
      .fetch({
        filter,
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getProjectsByExcel.content;
          }
        }),
      );
  }

  sendProjectsBymail(emails: string, filter?: ProjectFilterInput): Observable<MailResponseDto> {
    return this.sendProjectsBymailGQL
      .fetch({
        emails,
        subject: 'Your export of projects',
        filter,
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          return data.sendTicketsBymail;
        }),
      );
  }

  getProjectsByTargetWithFilter(filter?: ProjectFilterInput, reset: boolean = false): Observable<ProjectType[]> {
    if (reset) {
      this.pageIndex = 0;
      this.infiniteProjects.next([]);
      this.pagination.next({
        page: 0,
        length: 0,
        size: this.filterLimit,
      });
    }
    this.loadingProjects.next(true);
    return this.getProjectsByTargetWithFilterGQL
      .fetch({
        filter,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.getProjectsByTargetWithFilter?.count,
            });
            this.loadingProjects.next(false);
            this.isLast.next(data.getProjectsByTargetWithFilter.isLast);
            this.projects.next(data.getProjectsByTargetWithFilter.objects);
            this.infiniteProjects.next([...(this.infiniteProjects.value || []), ...data.getProjectsByTargetWithFilter.objects]);
            return data.getProjectsByTargetWithFilter.objects;
          }
        }),
      );
  }

  getProjectById(id: string): Observable<ProjectType> {
    return this.projectGQL.fetch({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.project.next(response.data.project);
          return response.data.project;
        }
      }),
    );
  }

  getProjectsByTarget(): Observable<ProjectPaginateType> {
    return this.getProjectsByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.projects.next(response.data.getProjectsByTarget);
          return response.data.getProjectsByTarget;
        }
      }),
    );
  }

  findContentTypeByType(type: string): Observable<ContentTypeType> {
    return this.findContentTypeByTypeGQL.fetch({ type }).pipe(
      map(({ data }: any) => {
        return data.findContentTypeByType;
      }),
    );
  }

  createDocument(input: DocumentInput): Observable<DocumentType> {
    return this.createDocumentGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        return data.createDocument;
      }),
    );
  }

  createProject(input: ProjectInput): Observable<ProjectType> {
    return this.createProjectGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        return data.createProject;
      }),
    );
  }

  getBrandColors(): Observable<KeyValueListType[]> {
    return this.getBrandColorsGQL.fetch().pipe(
      tap((response: any) => {
        this.brandColors.next(response.data.getBrandColors);
      }),
    );
  }

  updateProject(input: ProjectUpdateInput): Observable<ProjectType> {
    if (this.projects.value?.length) {
      return this.updateProjectGQL.mutate({ input }).pipe(
        map(({ data }: any) => {
          const projects = this.projects.value;
          const index = projects?.findIndex((a) => a.id === input.id);
          projects[index] = data.updateProject;
          this.projects.next(projects);
          this.project.next(data.updateProject);
          return data.updateProject;
        }),
      );
    } else {
      return this.getProjectsByTargetWithFilter().pipe(
        switchMap(() => {
          return this.updateProjectGQL.mutate({ input }).pipe(
            map(({ data }: any) => {
              const projects = this.projects.value;
              const index = projects?.findIndex((a) => a.id === input.id);
              projects[index] = data.updateProject;
              this.projects.next(projects);
              this.project.next(data.updateProject);
              return data.updateProject;
            }),
          );
        }),
      );
    }
  }

  deleteProject(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteProjectGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        const projects = this.projects.value.filter((item) => item.id !== id);
        this.projects.next(projects);
        return data.deleteProject;
      }),
    );
  }
}
