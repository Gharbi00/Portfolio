import { findIndex } from 'lodash';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import {
  ActivityTypeWithActiveStatusType,
  CorporateEmailTemplateType,
  DeleteResponseDtoType,
  SeoType,
  CorporateEmailTemplateInput,
  CorporateTemplateInput,
  CorporateTemplateType,
  UpdateSeoInput,
  WebsiteIntegrationType,
  WebsiteIntegrationInput,
  UpdateWebsiteIntegrationGQL,
  GetWebsiteIntegrationByTargetGQL,
  CreateSeoGQL,
  FindSeoByTargetGQL,
  GenerateEcomSitemapXmlGQL,
  UpdateSeoGQL,
  CreateCorporateEmailTemplateGQL,
  CreateCorporateTemplateGQL,
  DeleteCorporateEmailTemplateGQL,
  DeleteCorporateTemplateGQL,
  FindCorporateTemplateByTargetGQL,
  GetCorporateEmailsByTargetPaginatedGQL,
  UpdateCorporateEmailTemplateGQL,
  UpdateCorporateTemplateGQL,
  GetPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class WebsiteService {
  private seo: BehaviorSubject<SeoType> = new BehaviorSubject(null);
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingEmails: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private website: BehaviorSubject<WebsiteIntegrationType> = new BehaviorSubject(null);
  private templates: BehaviorSubject<CorporateTemplateType[]> = new BehaviorSubject(null);
  private emails: BehaviorSubject<CorporateEmailTemplateType[]> = new BehaviorSubject(null);
  private activityTypes: BehaviorSubject<ActivityTypeWithActiveStatusType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  posId: string;
  pageLimit = 10;
  searchString = '';

  get activityTypes$(): Observable<ActivityTypeWithActiveStatusType[]> {
    return this.activityTypes.asObservable();
  }
  set activityTypes$(value: any) {
    this.activityTypes.next(value);
  }
  get website$(): Observable<WebsiteIntegrationType> {
    return this.website.asObservable();
  }

  get emails$(): Observable<CorporateEmailTemplateType[]> {
    return this.emails.asObservable();
  }
  set emails$(value: any) {
    this.emails.next(value);
  }

  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get loadingEmails$(): Observable<boolean> {
    return this.loadingEmails.asObservable();
  }

  get seo$(): Observable<SeoType> {
    return this.seo.asObservable();
  }
  constructor(
    private createSeoGQL: CreateSeoGQL,
    private updateSeoGQL: UpdateSeoGQL,
    private storageHelper: StorageHelper,
    private findSeoByTargetGQL: FindSeoByTargetGQL,
    private updateCorporateTemplateGQL: UpdateCorporateTemplateGQL,
    private generateEcomSitemapXmlGQL: GenerateEcomSitemapXmlGQL,
    private deleteCorporateTemplateGQL: DeleteCorporateTemplateGQL,
    private createCorporateTemplateGQL: CreateCorporateTemplateGQL,
    private updateWebsiteIntegrationGQL: UpdateWebsiteIntegrationGQL,
    private deleteCorporateEmailTemplateGQL: DeleteCorporateEmailTemplateGQL,
    private updateCorporateEmailTemplateGQL: UpdateCorporateEmailTemplateGQL,
    private createCorporateEmailTemplateGQL: CreateCorporateEmailTemplateGQL,
    private findCorporateTemplateByTargetGQL: FindCorporateTemplateByTargetGQL,
    private getWebsiteIntegrationByTargetGQL: GetWebsiteIntegrationByTargetGQL,
    private getCorporateEmailsByTargetPaginatedGQL: GetCorporateEmailsByTargetPaginatedGQL,
    private getPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL: GetPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL,
  ) {}

  findCorporateTemplateByTarget(): Observable<CorporateTemplateType> {
    return this.findCorporateTemplateByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map((response: any) => {
          if (response.data) {
            this.templates.next(response.data.findCorporateTemplateByTarget);
            return response.data.findCorporateTemplateByTarget;
          }
        }),
      );
  }

  get templates$(): Observable<CorporateTemplateType[]> {
    return this.templates.asObservable();
  }

  createCorporateTemplate(input: CorporateTemplateInput): Observable<CorporateTemplateType> {
    return this.createCorporateTemplateGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.templates.next([data.createCorporateTemplate, ...(this.templates.value || [])]);
          return data.createCorporateTemplate;
        }
      }),
    );
  }

  generateEcomSitemapXml(): Observable<CorporateTemplateType> {
    return this.generateEcomSitemapXmlGQL.mutate({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.generateEcomSitemapXml;
        }
      }),
    );
  }

  deleteCorporateTemplate(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteCorporateTemplateGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const templates = this.templates.value.filter((item) => item.id !== id);
          this.templates.next(templates);
          return data.deleteCorporateTemplate;
        }
      }),
    );
  }

  updateCorporateTemplate(id: string, input: CorporateTemplateInput): Observable<CorporateTemplateType> {
    return this.updateCorporateTemplateGQL.mutate({ id, input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          const index = findIndex(this.templates.value, (template) => template?.id === id);
          this.templates.value[index] = data.updateCorporateTemplate;
          this.templates.next(this.templates.value);
          return data.updateCorporateTemplate;
        }
      }),
    );
  }

  getSeo(): Observable<SeoType> {
    return this.findSeoByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map((response: any) => {
          if (response.data) {
            this.seo.next(response.data.findSEOByTarget);
            return response.data.findSEOByTarget;
          }
        }),
      );
  }

  createSeo(input: any): Observable<SeoType> {
    return this.createSeoGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map((response: any) => {
        if (response.data) {
          this.seo.next(response.data.createSEO);
          return response.data.createSEO;
        }
      }),
    );
  }

  updateSeo(id: string, input: UpdateSeoInput): Observable<SeoType> {
    return this.updateSeoGQL.mutate({ id, input }).pipe(
      map((response: any) => {
        if (response.data) {
          this.seo.next(response.data.updateSEO);
          return response.data.updateSEO;
        }
      }),
    );
  }

  getCorporateEmailsByTargetPaginated(): Observable<CorporateEmailTemplateType[]> {
    this.loadingEmails.next(true);
    return this.getCorporateEmailsByTargetPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: 0, limit: 20 } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingEmails.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getCorporateEmailsByTargetPaginated?.count,
            });
            this.emails.next(data.getCorporateEmailsByTargetPaginated.objects);
            this.isLast.next(data.getCorporateEmailsByTargetPaginated.isLast);
            return data.getCorporateEmailsByTargetPaginated.objects;
          }
        }),
      );
  }

  createCorporateEmailTemplate(input: CorporateEmailTemplateInput): Observable<CorporateEmailTemplateInput> {
    return this.createCorporateEmailTemplateGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.emails.next([data.createCorporateEmailTemplate, ...(this.emails.value || [])]);
          return data.createCorporateEmailTemplate;
        }
      }),
    );
  }

  deleteCorporateEmailTemplate(id: string): Observable<CorporateEmailTemplateInput> {
    return this.deleteCorporateEmailTemplateGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const emails = this.emails.value.filter((item) => item.id !== id);
          this.emails.next(emails);
          return data.deleteCorporateEmailTemplate;
        }
      }),
    );
  }

  updateCorporateEmailTemplate(id: string, input: CorporateEmailTemplateInput, reset = true): Observable<CorporateEmailTemplateType> {
    return this.updateCorporateEmailTemplateGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (reset) {
            const index = findIndex(this.emails.value, (email) => email?.id === id);
            this.emails.value[index] = data.updateCorporateEmailTemplate;
            this.emails.next(this.emails.value);
          }
          return data.updateCorporateEmailTemplate;
        }
      }),
    );
  }

  getPredefinedActivityTypesPaginated(): Observable<ActivityTypeWithActiveStatusType[]> {
    return this.getPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: this.pageIndex, limit: this.pageLimit } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.activityTypes.next([
              ...(this.activityTypes.value || []),
              ...data.getPredefinedActivityTypesByTargetWithActiveStatusPaginated.objects,
            ]);
            return data.getPredefinedActivityTypesByTargetWithActiveStatusPaginated.objects;
          }
        }),
      );
  }

  getWebsiteIntegrationByTarget(): Observable<WebsiteIntegrationType> {
    return this.getWebsiteIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.website.next(data.getWebsiteIntegrationByTarget);
          return data.getWebsiteIntegrationByTarget;
        }
      }),
    );
  }

  updateWebsiteIntegration(id: string, input: WebsiteIntegrationInput): Observable<WebsiteIntegrationType> {
    return this.updateWebsiteIntegrationGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.website.next(data.updateWebsiteIntegration);
          return data.updateWebsiteIntegration;
        }
      }),
    );
  }
}
