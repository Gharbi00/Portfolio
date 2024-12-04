import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { clone, cloneDeep, filter, isEqual, map, omit, pick, pickBy, sortBy, values } from 'lodash';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, map as rxMap, switchMap, take, takeUntil } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';
import { DayEnum, GenerateS3SignedUrlGQL, ZoneTypesEnum } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { CurrencyType, LanguageType, OpeningStatus } from '@sifca-monorepo/terminal-generator';
import { CountryType, PaymentType, PointOfSaleType, StateType } from '@sifca-monorepo/terminal-generator';

import { PosService } from '../../../core/services/pos.service';
import { AWS_CREDENTIALS } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'business-profile',
  templateUrl: './business-profile.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./business-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessProfileComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  step = 1;
  tags = [];
  position: any;
  initVals: any;
  initValues: any;
  removable = true;
  addOnBlur = true;
  initialVals: any;
  selectable = true;
  isEqualTags = true;
  infoForm: FormGroup;
  states: StateType[];
  days = values(DayEnum);
  selectedAddress: any;
  pos: PointOfSaleType;
  filteredDays: DayEnum[];
  activeTab = 'profile';
  selectedIndex: number;
  socialForm: FormGroup;
  addressForm: FormGroup;
  isButtonDisabled = true;
  locationForm: FormGroup;
  selectedLocIndex: number;
  countries: CountryType[];
  selectedPayment: string[];
  chatContactForm: FormGroup;
  isChatButtonDisabled = true;
  loadingPictureinside = false;
  selectedCountry: CountryType;
  loadingPictureoutside = false;
  paymentMethods: PaymentType[];
  isSocialButtonDisabled = true;
  isAddressButtonDisabled = true;
  time = { hour: 13, minute: 30 };
  isLocationButtonDisabled = true;
  originalStates: StateType[] = [];
  openingStatus = values(OpeningStatus);
  originalCountries: CountryType[] = [];
  pos$: Observable<PointOfSaleType> = this.posService.pos$;
  stateSearchInput$: Subject<string> = new Subject<string>();
  countrySearchInput$: Subject<string> = new Subject<string>();
  currencySearchInput$: Subject<string> = new Subject<string>();
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  states$: Observable<StateType[]> = this.posService?.infiniteStates$;
  countries$: Observable<CountryType[]> = this.posService?.infiniteCountries$;
  languages$: Observable<LanguageType[]> = this.posService?.infiniteLanguages$;
  currencies$: Observable<CurrencyType[]> = this.posService?.infiniteCurrencies$;
  originalCurrencies: CurrencyType[];
  currencies: CurrencyType[];

  get hours(): FormArray {
    return this.addressForm.get(['openingHours', 'hours']) as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private posService: PosService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {

    this.currencySearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.filterCurrencies(searchString);
          return of(this.countries);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.posService.paymentMethods$.pipe(takeUntil(this.unsubscribeAll)).subscribe((paymentMethods: PaymentType[]) => {
      this.paymentMethods = paymentMethods;
      this.changeDetectorRef.markForCheck();
    });
    this.posService.pos$.subscribe((pos: PointOfSaleType) => {
      this.pos = pos;
      this.filteredDays = this.days.filter((name) => {
        return !this.pos?.openingHours?.hours.some((hour) => hour?.day === name);
      });
      this.posService.socials$.subscribe((res) => {
        this.chatContactForm = this.fb.group({
          messenger: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'MSG')?.value || ''],
            name: [res.find((item) => item.code === 'MSG')?.id || ''],
          }),
          whatsapp: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'WAP')?.value || ''],
            name: [res.find((item) => item.code === 'WAP')?.id || ''],
          }),
        });
        const initVal = this.chatContactForm?.value;
        this.chatContactForm?.valueChanges.subscribe((newname: any): void => {
          this.isChatButtonDisabled = isEqual(newname, initVal);
        });
        this.socialForm = this.fb.group({
          facebook: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'FB')?.value || ''],
            name: [res?.find((item) => item.code === 'FB')?.id || ''],
          }),
          instagram: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'IG')?.value || ''],
            name: [res?.find((item) => item.code === 'IG')?.id || ''],
          }),
          twitter: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'TT')?.value || ''],
            name: [res?.find((item) => item.code === 'TT')?.id || ''],
          }),
          youtube: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'YT')?.value || ''],
            name: [res?.find((item) => item.code === 'YT')?.id || ''],
          }),
          tikTok: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'TK')?.value || ''],
            name: [res?.find((item) => item.code === 'TK')?.id || ''],
          }),
          linkedin: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'LI')?.value || ''],
            name: [res?.find((item) => item.code === 'LI')?.id || ''],
          }),
          pinterest: this.fb.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'PR')?.value || ''],
            name: [res?.find((item) => item.code === 'PR')?.id || ''],
          }),
        });
        const initValues = this.socialForm?.value;
        this.socialForm?.valueChanges.subscribe((newname: any): void => {
          this.isSocialButtonDisabled = isEqual(newname, initValues);
        });
        this.changeDetectorRef.markForCheck();
      });
      this.infoForm = this.fb.group({
        title: [pos?.title || ''],
        subtitle: [pos?.subtitle || ''],
        brandColor: [pos?.brandColor || ''],
        description: [pos?.description || ''],
        tags: [pos?.tags || ''],
        currencies: [pos?.currencies?.length ? map(pos?.currencies, 'currency') : undefined],
        languages: [pos?.languages?.length ? pos?.languages : undefined],
        paymentMethods: [map(pos?.paymentMethods, 'id')],
      });
      this.initValues = this.infoForm.value;
      this.infoForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
        this.isButtonDisabled = isEqual(val, this.initValues);
      });
      this.addressForm = this.fb.group({
        email: [pos?.email || []],
        phone: [pos?.phone || []],
        website: [pos?.website || ''],
        locations: this.fb.array([]),
        openingHours: this.fb.group({
          status: [pos?.openingHours?.status || undefined],
          hours: this.fb.array(
            pos?.openingHours?.hours?.length
              ? map(pos?.openingHours?.hours, (hour) => {
                  return this.fb.group({
                    day: [hour?.day || ''],
                    from: [hour?.from || ''],
                    to: [hour?.to || ''],
                  });
                })
              : [
                  this.fb.group({
                    day: [undefined],
                    from: [''],
                    to: [''],
                  }),
                ],
          ),
        }),
      });
      this.initVals = this.addressForm.value;
      this.addressForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
        this.isAddressButtonDisabled = isEqual(val, this.initVals);
        this.changeDetectorRef.markForCheck();
      });
    });

    this.posService?.infiniteStates$.pipe(takeUntil(this.unsubscribeAll)).subscribe((states) => {
      this.states = sortBy(states, ['name']);
      this.originalStates = sortBy(states, ['name']);
      this.changeDetectorRef.markForCheck();
    });

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
    this.changeDetectorRef.markForCheck();
  }

  ngOnInit(): void {
    this.findCountriesAndLanguagesAndCurrencies();
    const url = this.router.url.split('/');
    this.activeTab = url[url.length - 1];
  }

  filterCurrencies(searchTerm: string) {
    this.currencies = filter(this.originalCurrencies, (currency) =>
      currency.name?.toLowerCase().includes(searchTerm !== null ? searchTerm?.toLowerCase() : ''),
    );
  }

  onChangeTime(event, index: number, field: string) {
    this.hours.at(index).get(field).patchValue(event);
  }

  deleteHour(index: number) {
    this.hours.removeAt(index);
    this.filteredDays = this.days.filter((name) => {
      return !this.hours.value.some((hour) => hour?.day === name);
    });
  }

  addHour() {
    const form = this.fb.group({
      day: [undefined, Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
    });
    this.hours.push(form);
    this.filteredDays = this.days.filter((name) => {
      return !this.hours.value.some((hour) => hour?.day === name);
    });
  }

  filterStates(searchTerm: string) {
    this.states = filter(this.originalStates, (state) => state.name?.toLowerCase().includes(searchTerm !== null ? searchTerm?.toLowerCase() : ''));
  }

  filterCountries(searchTerm: string) {
    this.countries = filter(this.originalCountries, (country) =>
      country.name?.toLowerCase().includes(searchTerm !== null ? searchTerm?.toLowerCase() : ''),
    );
  }

  findCountriesAndLanguagesAndCurrencies() {
    combineLatest([
      this.posService.findCountriesPagination(),
      this.posService.findCurrenciesPagination(),
      this.posService.findlanguagesPagination(),
    ]).subscribe(([res, result]) => {
      if (res) {
        this.changeDetectorRef.markForCheck();
        this.countries = sortBy(res, ['name']);
        this.originalCountries = sortBy(res, ['name']);
        this.originalCurrencies = sortBy(result, ['name']);
        this.currencies = result;
      }
    });
  }

  onChangeCountry(country: CountryType) {
    this.posService.statesPageIndex = 0;
    this.posService.infiniteStates$ = null;
    this.locationForm.get('state').reset();
    this.selectedCountry = country;
    if (country) {
      this.posService.findStatesByCountryPagination(country?.id).subscribe();
    }
  }

  loadMoreStates() {
    this.posService.isLastStates$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.statesPageIndex++;
        this.posService.findStatesByCountryPagination(this.selectedCountry?.id).subscribe();
      }
    });
  }

  loadMoreLanguages() {
    this.posService.isLastLanguages$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.languagesPageIndex++;
        this.posService.findlanguagesPagination().subscribe();
      }
    });
  }

  loadMoreCurrencies() {
    this.posService.isLastCurrencies$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.currenciesPageIndex++;
        this.posService.findCurrenciesPagination().subscribe();
      }
    });
  }

  loadMoreCountries() {
    this.posService.isLastCountries$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.countriesPageIndex++;
        this.posService.findCountriesPagination().subscribe();
      }
    });
  }

  editSocial(): void {
    this.isSocialButtonDisabled = true;
    this.isChatButtonDisabled = true;
    let newFormValues: any[] = [];
    if (this.socialForm?.value.facebook.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.facebook];
    }
    if (this.socialForm?.value.instagram.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.instagram];
    }
    if (this.socialForm?.value.twitter.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.twitter];
    }
    if (this.socialForm?.value.youtube.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.youtube];
    }
    if (this.socialForm?.value.tikTok.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.tikTok];
    }
    if (this.socialForm?.value.linkedin.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.linkedin];
    }
    if (this.socialForm?.value.pinterest.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.pinterest];
    }
    if (this.chatContactForm?.value.whatsapp.value) {
      newFormValues = [...newFormValues, this.chatContactForm?.value.whatsapp];
    }
    if (this.chatContactForm?.value.messenger.value) {
      newFormValues = [...newFormValues, this.chatContactForm?.value.messenger];
    }
    this.update({ socialMedia: newFormValues });
  }

  update(values) {
    this.posService
      .update(values)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((pos) => {
        if (pos) {
          this.successPopUp();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  pickAddress(event) {
    this.position = event.coords;
    this.locationForm.get(['location', 'coordinates']).patchValue([event.coords.lng, event.coords.lat]);
  }

  openLocationModal(content: NgbModal, address: any, index: number) {
    this.position = null;
    this.step = 1;
    this.selectedIndex = index;
    this.selectedAddress = address;
    if (address?.country?.id) {
      this.posService.findStatesByCountryPagination(address?.country?.id).subscribe();
    }
    this.modalService.open(content, { size: 'md', centered: true });
    this.locationForm = this.fb.group({
      address: [this.selectedAddress?.address || '', Validators.required],
      country: [this.selectedAddress?.country || undefined, Validators.required],
      state: [this.selectedAddress?.state || undefined, Validators.required],
      postCode: [this.selectedAddress?.postCode || '', Validators.required],
      city: [this.selectedAddress?.city || '', Validators.required],
      location: this.fb.group({
        type: [ZoneTypesEnum?.POINT],
        coordinates: [[this.selectedAddress?.location?.coordinates[0], this.selectedAddress?.location?.coordinates[1]]],
      }),
    });
    this.initialVals = this.locationForm.value;
    this.locationForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isLocationButtonDisabled = isEqual(val, this.initialVals);
    });
    this.position = {
      lng: address?.location?.coordinates[0],
      lat: address?.location?.coordinates[1],
    };
  }

  next(): void {
    this.step = 2;
  }

  deleteShippingAddress() {
    let filteredLocations = clone(this.pos.locations) as any;
    filteredLocations = map(this.pos.locations, (location) => {
      return {
        ...pickBy(location, (value) => value !== null),
        country: location?.country?.id,
        state: location?.state?.id,
        location: {
          coordinates: location?.location?.coordinates,
          type: location?.location?.type || ZoneTypesEnum?.POINT,
        },
      };
    });
    filteredLocations.splice(this.selectedIndex, 1);
    this.posService
      .update({ locations: [...filteredLocations] as any })
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          // this.pos.locations.splice(this.selectedIndex, 1);
          this.successPopUp();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openDeleteModal(content: any, index: number) {
    this.selectedIndex = index;
    this.modalService.open(content, { centered: true });
  }

  onSelectShip(i: number) {
    this.selectedLocIndex = i;
  }

  saveLocation() {
    this.isLocationButtonDisabled = true;
    let filteredLocations;
    if (this.pos?.locations?.length) {
      filteredLocations = this.pos.locations.map((address) => {
        const filteredAddress: any = pickBy(address, (value) => value !== null);
        if (filteredAddress?.country?.id) {
          filteredAddress.country = filteredAddress?.country?.id;
        }
        if (filteredAddress?.state?.id) {
          filteredAddress.state = filteredAddress?.state?.id;
        }
        if (filteredAddress?.location?.type === null) {
          filteredAddress.location.type = ZoneTypesEnum?.POINT;
        }
        return filteredAddress;
      });
    }
    let input: any = {
      ...FormHelper.getNonEmptyValues(omit(this.locationForm.value, 'state', 'country')),
      state: this.locationForm.value?.state?.id,
      country: this.locationForm.value?.country?.id,
    };
    if (!this.selectedAddress) {
      this.posService
        .update({ locations: [input, ...(filteredLocations || [])] })
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.successPopUp();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
    if (this.selectedAddress) {
      const filteredLocations: any = this.pos.locations.map((address, i) => {
        const filteredAddress: any = pickBy(address, (value) => value !== null);
        if (filteredAddress.country?.id) {
          filteredAddress.country = filteredAddress?.country?.id;
        }
        if (filteredAddress.state?.id) {
          filteredAddress.state = filteredAddress?.state?.id;
        }
        if (filteredAddress?.location?.type === null) {
          filteredAddress.location.type = ZoneTypesEnum?.POINT;
        }
        return filteredAddress;
      });
      filteredLocations.splice(this.selectedIndex, 1);
      this.posService
        .update({ locations: [input, ...filteredLocations] })
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.successPopUp();
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  successPopUp() {
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

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  saveAddress() {
    this.isAddressButtonDisabled = true;
    this.pos$
      .pipe(
        take(1),
        rxMap((pos) => {
          return {
            ...FormHelper.getDifference(pick(pos, 'website'), omit(this.addressForm.value, 'email', 'phone', 'location', 'openingHours')),
            ...(isEqual(
              (pos.email?.length ? cloneDeep(pos.email) : []).sort(),
              (this.addressForm.value?.email?.length ? cloneDeep(this.addressForm.value.email) : []).sort(),
            )
              ? {}
              : { email: this.addressForm.value.email }),
            ...(isEqual(
              (pos.phone?.length ? cloneDeep(pos.phone) : []).sort(),
              (this.addressForm.value?.phone?.length ? cloneDeep(this.addressForm.value.phone) : []).sort(),
            )
              ? {}
              : { phone: this.addressForm.value.phone }),

            ...(isEqual(this.initVals?.openingHours, this.addressForm.value.openingHours) || !this.addressForm.value?.openingHours?.status
              ? {}
              : { openingHours: this.addressForm.value.openingHours }),
          };
        }),
        switchMap((input) => {
          return this.posService.update(input);
        }),
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.successPopUp();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  upload(): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          const pictures: any = {
            baseUrl: picture.baseUrl,
            path: picture.path,
          };
          this.loadingPictureoutside = true;
          this.posService
            .update({
              picture: pictures,
            })
            .pipe(
              catchError(() => {
                this.modalError();
                this.loadingPictureoutside = false;
                return of(null);
              }),
            )
            .subscribe((res) => {
              if (res) {
                this.position();
                this.loadingPictureoutside = false;
                this.changeDetectorRef.markForCheck();
              }
            });
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  add(event: any): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  save() {
    this.isButtonDisabled = true;
    let input: any = {
      ...FormHelper.getNonEmptyAndChangedValues(
        omit(this.infoForm.value, 'tags', 'paymentMethods', 'currencies', 'languages'),
        omit(this.initValues, 'tags', 'paymentMethods', 'currencies', 'languages'),
      ),
      ...(isEqual(
        (this.initValues.tags?.length ? cloneDeep(this.initValues.tags) : []).sort(),
        (this.infoForm.value?.tags?.length ? cloneDeep(this.infoForm.value.tags) : []).sort(),
      )
        ? {}
        : { tags: this.infoForm.value.tags }),

      ...(isEqual(
        (this.initValues.paymentMethods?.length ? cloneDeep(this.initValues.paymentMethods) : []).sort(),
        (this.infoForm.value?.paymentMethods?.length ? cloneDeep(this.infoForm.value.paymentMethods) : []).sort(),
      )
        ? {}
        : { paymentMethods: this.infoForm.value.paymentMethods }),

      ...(isEqual(
        (this.initValues.currencies?.length ? cloneDeep(this.initValues.currencies) : []).sort(),
        (this.infoForm.value?.currencies?.length ? cloneDeep(this.infoForm.value.currencies) : []).sort(),
      )
        ? {}
        : {
            currencies: map(this.infoForm.value.currencies, (currency) => ({
              currency: currency.id,
            })),
          }),

      ...(isEqual(
        (this.initValues.languages?.length ? cloneDeep(this.initValues.languages) : []).sort(),
        (this.infoForm.value?.languages?.length ? cloneDeep(this.infoForm.value.languages) : []).sort(),
      )
        ? {}
        : {
            languages: map(this.infoForm.value.languages, 'id'),
          }),
    };

    this.posService
      .update(input)
      .pipe(
        catchError((error) => {
          if (error) {
            this.modalError();
            return of(null);
          }
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.successPopUp();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  ngOnDestroy() {
    this.posService.currenciesPageIndex = 0;
    this.posService.languagesPageIndex = 0;
    this.posService.countriesPageIndex = 0;
    this.posService.statesPageIndex = 0;
    this.posService.infiniteCurrencies$ = null;
    this.posService.infiniteLanguages$ = null;
    this.posService.infiniteCountries$ = null;
    this.posService.infiniteStates$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
