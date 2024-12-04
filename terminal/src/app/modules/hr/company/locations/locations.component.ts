import Swal from 'sweetalert2';
import { filter, isEqual, keys, omit, sortBy, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  throwError,
  Observable,
  of,
  combineLatest,
  map as rxMap,
} from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { CountryType, LocationType, LocationTypeEnum, StateType } from '@sifca-monorepo/terminal-generator';

import { LocationsService } from './locations.service';
import { TeamService } from '../../../system/team/team.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { NgbdAdvancedSortableHeader } from './locations-sortable.directive';
import { PosService } from '../../../../core/services/pos.service';

@Component({
  selector: 'sifca-monorepo-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit, OnDestroy {
  @ViewChild('datePicker') datePicker: any;
  @ViewChildren(NgbdAdvancedSortableHeader) headers!: QueryList<NgbdAdvancedSortableHeader>;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 1;
  checkedList: any;
  isLoading = true;
  pageChanged: any;
  selectedDate: any;
  companyId: string;
  states: StateType[];
  filterForm: FormGroup;
  locationForm: FormGroup;
  isButtonDisabled = true;
  pagination: IPagination;
  countries: CountryType[];
  locations: LocationType[];
  breadCrumbItems!: Array<{}>;
  originalStates: StateType[];
  selectedCountry: CountryType;
  selectedLocation: LocationType;
  originalCountries: CountryType[];
  locationTypes = values(LocationTypeEnum);
  stateSearchInput$: Subject<string> = new Subject<string>();
  countrySearchInput$: Subject<string> = new Subject<string>();
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  intialValues: any;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  get tags() {
    return this.locationForm?.get('tags') as FormArray;
  }

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private modulesService: PosService,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private locationsService: LocationsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    combineLatest([this.translate.get('MENUITEMS.TS.HR'), this.translate.get('MENUITEMS.TS.LOCATIONS')]).pipe(
      rxMap(([hr, locations]) => {
        this.breadCrumbItems = [{ label: hr }, { label: locations, active: true }];
      }),
    );
    this.filterForm = this.formBuilder.group({
      date: [''],
      locationType: [[]],
    });
    this.filterForm?.valueChanges.subscribe((val): void => {
      if (val.date) {
        if (val.date?.from) {
          this.locationsService.from = val?.date?.from;
        }
        if (val?.date?.to) {
          this.locationsService.to = val?.date?.to;
        }
      }
      this.locationsService.getLocations().subscribe();
    });
    this.companyId = this.storageHelper.getData('company');
    this.locationsService.locations$.pipe(takeUntil(this.unsubscribeAll)).subscribe((locations: LocationType[]) => {
      this.locations = locations;
      this.sharedService.isLoading$ = false;
      this.changeDetectorRef.markForCheck();
    });
    this.isLoading = false;
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  reset() {
    this.filterForm.reset();
  }

  ngOnInit(): void {
    this.countrySearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.filterCountries(searchString);
          return of(this.countries);
        }),
      )
      .subscribe((res) => {
        this.changeDetectorRef.markForCheck();
      });

    this.stateSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.filterStates(searchString);
          return of(this.states);
        }),
      )
      .subscribe();
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isLoading = true;
          this.changeDetectorRef.markForCheck();
          this.locationsService.searchString = searchValues.searchString;
          return this.teamService.searchAccount();
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
    this.locationsService.locationPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.locationsService.locationPage || 0,
        size: this.locationsService.locationLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.locationsService.locationPage || 0) * this.locationsService.locationLimit,
        endIndex: Math.min(((this.locationsService.locationPage || 0) + 1) * this.locationsService.locationLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.modulesService.findCountriesPagination().subscribe((res) => {
      this.countries = sortBy(res, ['name']);
      this.originalCountries = sortBy(res, ['name']);
    });
  }

  filterStates(searchTerm: string) {
    if (!this.originalStates.length) {
      this.originalStates = [...this.states];
    }
    this.states = filter(this.originalStates, (state) => state.name?.toLowerCase().includes(searchTerm?.toLowerCase()));
  }

  filterCountries(searchTerm: string) {
    if (!this.originalCountries.length) {
      this.originalCountries = [...this.countries];
    }
    this.countries = filter(this.originalCountries, (country) =>
      country.name?.toLowerCase().includes(searchTerm !== null ? searchTerm?.toLowerCase() : ''),
    );
  }

  onChangeCountry(country: CountryType) {
    this.modulesService.statesPageIndex = 0;
    this.modulesService.infiniteStates$ = null;
    this.locationForm.get(['address', 'state']).reset();
    this.selectedCountry = country;
    if (country) {
      this.modulesService.findStatesByCountryPagination(country?.id).subscribe((res) => {
        this.states = sortBy(res, ['name']);
        this.originalStates = sortBy(res, ['name']);
      });
    }
  }

  onSelectType(event: any) {
    this.locationsService.locationType.push(event.target.value);
    this.locationsService.getLocations().subscribe();
  }

  openLocationModal(content: any, location: LocationType) {
    this.selectedLocation = location;
    if (location?.address?.country?.id) {
      this.modulesService.findStatesByCountryPagination(location?.address?.country?.id).subscribe((res) => {
        this.states = sortBy(res, ['name']);
        this.originalStates = sortBy(res, ['name']);
      });
    }
    this.modalService.open(content, { size: 'md', centered: true });
    this.locationForm = this.formBuilder.group({
      name: [location?.name || '', [Validators.required]],
      externalId: [location?.externalId || '', [Validators.required]],
      company: [this.companyId],
      tags: this.formBuilder.array(location?.tags?.length ? location?.tags : ['']),
      address: this.formBuilder.group({
        owner: this.formBuilder.group({
          name: [location?.address?.owner?.name || ''],
          phone: this.formBuilder.group({
            countryCode: '216',
            number: [location?.address?.owner?.phone?.number || ''],
          }),
        }),
        address: [location?.address?.address || ''],
        postCode: [location?.address?.postCode || ''],
        city: [location?.address?.city || ''],
        country: [location?.address?.country?.id || undefined],
        state: [location?.address?.state?.id || undefined],
      }),
      locationType: [location?.locationType || '', [Validators.required]],
    });
    this.intialValues = this.locationForm?.value;
    this.locationForm?.valueChanges.subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, this.intialValues);
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

  save() {
    let field = this.selectedLocation ? 'updateLocation' : 'createLocation';
    const owner = {
      ...(this.intialValues.address.owner?.name !== this.locationForm.value.address.owner?.name
        ? { name: this.locationForm.value.address.owner?.name }
        : {}),
      ...(this.intialValues.address.owner?.phone?.number !== this.locationForm.value.address.owner?.phone?.number
        ? { name: this.locationForm.value.address.owner?.phone?.number }
        : {}),
    };
    const address = {
      ...FormHelper.getDifference(omit(this.intialValues.address, 'owner'), omit(this.locationForm.value.address, 'owner')),
      ...(keys(owner)?.length ? { owner } : {}),
    };
    const input: any = {
      ...FormHelper.getDifference(omit(this.intialValues, 'address', 'tags'), omit(this.locationForm.value, 'address', 'tags')),
      ...(keys(address)?.length ? { address } : {}),
      ...(isEqual(this.intialValues.tags, this.locationForm.value.tags) ? {} : { tags: this.locationForm.value.tags }),
    };
    const args = this.selectedLocation ? [this.selectedLocation.id, input] : [input];
    this.isButtonDisabled = true;
    this.locationsService[field](...args)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          if (field === 'createLocation') {
            this.pagination.length++;
            this.pagination.endIndex++;
          }
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  deleteLocation() {
    this.locationsService
      .deleteLocation(this.selectedLocation.id)
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
        this.position();
      });
  }

  addTagField(): void {
    const tagFormControl = this.formBuilder.control('');
    this.tags?.push(tagFormControl);
    this.changeDetectorRef.markForCheck();
  }

  removeTagField(index: number): void {
    const tagsArray = this.tags as FormArray;
    tagsArray.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.locationsService.locationPage = page - 1;
    if (this.pageChanged) {
      this.locationsService.getLocations().subscribe();
    }
  }

  openDeleteLocation(content: any, location: any) {
    this.selectedLocation = location;
    this.modalService.open(content, { centered: true });
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.locationsService.locationPage = 0;
    this.locationsService.searchString = '';
  }
}
