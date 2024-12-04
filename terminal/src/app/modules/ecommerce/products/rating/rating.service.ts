import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  DeleteResponseDtoType,
  CorporateRatingAssignmentType,
  CorporateRatingDefinitionType,
  CorporateRatingAssignmentInput,
  CreateCorporateRatingAssignmentGQL,
  DeleteCorporateRatingAssignmentGQL,
  GetAllCorporateRatingDefinitionsGQL,
  GetCorporateRatingAssignmentByTargetGQL,
  UpdateCorporateRatingAssignmentStatusGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private ratingDefinition: BehaviorSubject<CorporateRatingDefinitionType[] | null> = new BehaviorSubject(null);
  private corporateRatingAssignments: BehaviorSubject<CorporateRatingAssignmentType[] | null> = new BehaviorSubject(null);

  posId: string;

  constructor(
    private storageHelper: StorageHelper,
    private deleteCorporateRatingAssignmentGQL: DeleteCorporateRatingAssignmentGQL,
    private createCorporateRatingAssignmentGQL: CreateCorporateRatingAssignmentGQL,
    private getAllCorporateRatingDefinitionsGQL: GetAllCorporateRatingDefinitionsGQL,
    private getCorporateRatingAssignmentByTargetGQL: GetCorporateRatingAssignmentByTargetGQL,
    private updateCorporateRatingAssignmentStatusGQL: UpdateCorporateRatingAssignmentStatusGQL,
  ) {}

  get ratingDefinitions$(): Observable<CorporateRatingDefinitionType[]> {
    return this.ratingDefinition.asObservable();
  }

  get corporateRatingAssignments$(): Observable<CorporateRatingAssignmentType[]> {
    return this.corporateRatingAssignments.asObservable();
  }

  getRatingDefinitions(): Observable<CorporateRatingDefinitionType[]> {
    return this.getAllCorporateRatingDefinitionsGQL.fetch().pipe(
      tap((response: any) => {
        if (response.data) {
          this.ratingDefinition.next(response.data.getAllCorporateRatingDefinitions);
        }
      }),
    );
  }

  deleteCorporateRatingAssignment(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteCorporateRatingAssignmentGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const corporateRatingAssignments = this.corporateRatingAssignments.value;
          const index = corporateRatingAssignments.findIndex((item) => item.id === id);
          corporateRatingAssignments.splice(index, 1);
          this.corporateRatingAssignments.next(corporateRatingAssignments);
          return data.deleteCorporateRatingAssignment;
        }
      }),
    );
  }

  getCorporateRatingAssignmentByTarget(): Observable<CorporateRatingAssignmentType[]> {
    return this.getCorporateRatingAssignmentByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.corporateRatingAssignments.next(response.data.getCorporateRatingAssignmentByTarget);
        }
      }),
    );
  }

  createCorporateRatingAssignment(input: CorporateRatingAssignmentInput): Observable<CorporateRatingAssignmentType[]> {
    return this.createCorporateRatingAssignmentGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      tap((response: any) => {
        if (response.data) {
          const values = this.corporateRatingAssignments.value;
          values.unshift(response.data.createCorporateRatingAssignment);
          this.corporateRatingAssignments.next(values);
        }
      }),
    );
  }

  updateCorporateRatingAssignment(id: string, active: boolean): Observable<CorporateRatingAssignmentType[]> {
    return this.updateCorporateRatingAssignmentStatusGQL.mutate({ active, id }).pipe(
      tap((response: any) => {
        if (response.data) {
          const values = this.corporateRatingAssignments.value;
          values[values.map((v) => v.id).indexOf(id)] = response.data.updateCorporateRatingAssignmentStatus;
          this.corporateRatingAssignments.next(values);
        }
      }),
    );
  }
}
