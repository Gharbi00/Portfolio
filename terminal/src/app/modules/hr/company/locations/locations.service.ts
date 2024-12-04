import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import {
  CreateLocationGQL,
  DeleteLocationGQL,
  GetLocationsByCompanyPaginatedGQL,
  LocationInput,
  UpdateLocationGQL,
  FindStatesPaginationGQL,
  LocationType,
  LocationTypeEnum,
  StatePaginatedType,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private locations: BehaviorSubject<LocationType[] | null> = new BehaviorSubject(null);
  private isLocationLastPage: BehaviorSubject<boolean | null> = new BehaviorSubject(null);
  private infinitLocations: BehaviorSubject<LocationType[] | null> = new BehaviorSubject(null);
  private locationPagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);

  companyId: string;

  locationLimit = 10;
  locationPage = 0;
  searchString = '';
  from: any;
  to: any;
  locationType: LocationTypeEnum[] = [];

  constructor(
    private storageHelper: StorageHelper,
    private createLocationGQL: CreateLocationGQL,
    private updateLocationGQL: UpdateLocationGQL,
    private deleteLocationGQL: DeleteLocationGQL,
    private findStatesPaginationGQL: FindStatesPaginationGQL,
    private getLocationsByCompanyPaginatedGQL: GetLocationsByCompanyPaginatedGQL,
  ) {
    this.companyId = this.storageHelper.getData('company');
  }

  get isLocationLastPage$(): Observable<boolean> {
    return this.isLocationLastPage.asObservable();
  }

  get locations$(): Observable<LocationType[]> {
    return this.locations.asObservable();
  }

  get infinitLocations$(): Observable<LocationType[]> {
    return this.infinitLocations.asObservable();
  }

  get locationPagination$(): Observable<IPagination> {
    return this.locationPagination.asObservable();
  }

  getLocations(): Observable<LocationType[]> {
    return this.getLocationsByCompanyPaginatedGQL
      .fetch({
        company: this.companyId,
        pagination: { limit: this.locationLimit, page: this.locationPage },
        searchString: this.searchString,
        ...(this.locationType?.length || this.from || this.to
          ? {
              filter: {
                ...(this.locationType?.length ? { locationType: this.locationType } : []),
                ...(this.from ? { from: this.from } : ''),
                ...(this.to ? { to: this.to } : ''),
              },
            }
          : {}),
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.locationPagination.next({
              page: this.locationPage,
              size: this.locationLimit,
              length: data.getLocationsByCompanyPaginated?.count,
            });
            this.isLocationLastPage.next(data.getLocationsByCompanyPaginated.isLast);
            this.infinitLocations.next([...(this.infinitLocations.value || []), ...data.getLocationsByCompanyPaginated.objects]);
            this.locations.next(data.getLocationsByCompanyPaginated.objects);
            return data.getLocationsByCompanyPaginated.objects;
          }
        }),
      );
  }

  createLocation(input: LocationInput): Observable<LocationType> {
    return this.createLocationGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const locations = [data.createLocation, ...this.locations.value];
          this.locations.next(locations);
          return data.createLocation;
        }
      }),
    );
  }

  findStatesPagination(): Observable<StatePaginatedType> {
    return this.findStatesPaginationGQL.fetch({ pagination: { page: 0, limit: 20000 } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.findStatesPagination;
        }
      }),
    );
  }

  deleteLocation(id: string): Observable<LocationType> {
    return this.deleteLocationGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const locations = this.locations.value;
          const index = locations.findIndex((item) => item.id === id);
          locations.splice(index, 1);
          this.locations.next(locations);
          return data.deleteLocation;
        }
      }),
    );
  }

  updateLocation(id: string, input: LocationInput): Observable<LocationType> {
    return this.updateLocationGQL.mutate({ input, id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const locations = this.locations.value;
          const index = locations?.findIndex((a) => a.id === id);
          locations[index] = data.updateLocation;
          this.locations.next(locations);
          return data.updateLocation;
        }
      }),
    );
  }
}
