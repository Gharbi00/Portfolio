import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  CreateDocumentGQL,
  DeleteDocumentGQL,
  DocumentInput,
  DocumentPaginatedType,
  DocumentType,
  FindDocumentByIdGQL,
  FindDocumentsByOwnerPaginationGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { ContentTypeType, DeleteResponseDtoType, FindContentTypeByTypeGQL } from '@sifca-monorepo/terminal-generator';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private docPagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);
  private documents: BehaviorSubject<DocumentType[] | null> = new BehaviorSubject(null);

  limit = 10;
  page = 0;

  constructor(
    private deleteDocumentGQL: DeleteDocumentGQL,
    private createDocumentGQL: CreateDocumentGQL,
    private findDocumentByIdGQL: FindDocumentByIdGQL,
    private findContentTypeByTypeGQL: FindContentTypeByTypeGQL,
    private findDocumentsByOwnerPaginationGQL: FindDocumentsByOwnerPaginationGQL,
  ) {}

  get documents$(): Observable<DocumentType[]> {
    return this.documents.asObservable();
  }

  get docPagination$(): Observable<IPagination> {
    return this.docPagination.asObservable();
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
        this.documents.next([data.createDocument, ...this.documents.value]);
        return data.createDocument;
      }),
    );
  }

  deleteDocument(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteDocumentGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        const documents = this.documents.value;
        const index = documents.findIndex((item) => item.id === id);
        documents.splice(index, 1);
        this.documents.next(documents);
        return data.deleteDocument;
      }),
    );
  }

  findDocumentById(id: string): Observable<DocumentType> {
    return this.findDocumentByIdGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        return data.findDocumentById;
      }),
    );
  }

  getUserDocuments(owner: string): Observable<DocumentPaginatedType> {
    return this.findDocumentsByOwnerPaginationGQL.fetch({ owner, pagination: { limit: this.limit, page: this.page } }).pipe(
      tap(({ data }: any) => {
        this.docPagination.next({
          page: this.page,
          size: this.limit,
          length: data.findDocumentsByOwnerPagination?.count,
        });
        this.documents.next(data.findDocumentsByOwnerPagination.objects);
        return data.findDocumentsByOwnerPagination;
      }),
    );
  }
}
