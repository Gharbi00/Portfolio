import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnInit, Component, ChangeDetectorRef, OnDestroy, Inject } from '@angular/core';
import { filter, identity, isEqual, keys, map, omit, pickBy, sortBy, values } from 'lodash';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs/operators';

import {
  App,
  Gender,
  UserRole,
  StateType,
  CountryType,
  AcademicLevel,
  MaritalStatus,
  ZoneTypesEnum,
  CorporateUserType,
  GenerateS3SignedUrlGQL,
} from '@sifca-monorepo/terminal-generator';
import { UserExistType } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { CustomersService } from '../customers.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { SharedService } from '../../../../../shared/services/shared.service';
import { PosService } from '../../../../../core/services/pos.service';

@Component({
  selector: 'customers-details',
  styleUrls: ['./details.component.scss'],
  templateUrl: './details.component.html',
})
export class CustomersDetailsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  position: any;
  rStrings: string;
  initialValues: any;
  userForm: FormGroup;
  states: StateType[];
  socialForm: FormGroup;
  user: CorporateUserType;
  isButtonDisabled = true;
  countries: CountryType[];
  genders = values(Gender);
  isEmailButtonDisabled = true;
  selectedCountry: CountryType;
  levels = values(AcademicLevel);
  isProfileButtonDisabled = true;
  originalStates: StateType[] = [];
  isEducationButtonDisabled = true;
  isExperienceButtonDisabled = true;
  maritalStatus = values(MaritalStatus);
  originalCountries: CountryType[] = [];
  stateSearchInput$: Subject<string> = new Subject<string>();
  countrySearchInput$: Subject<string> = new Subject<string>();
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  get picture() {
    return this.userForm.get('picture');
  }

  get work(): FormArray {
    return this.userForm.get('work') as FormArray;
  }

  get education(): FormArray {
    return this.userForm.get('education') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private customersService: CustomersService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.findCountriesAndStates();
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
      .subscribe(() => {
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
  }

  ngOnInit(): void {
    this.rStrings = this.randomString(10);
    this.customersService.contact$.pipe(takeUntil(this.unsubscribeAll)).subscribe((user) => {
      this.user = user;
      this.position = {
        lng: this.user?.residentialAddress?.[0]?.location?.coordinates?.[0],
        lat: this.user?.residentialAddress?.[0]?.location?.coordinates?.[1],
      };
      this.userForm = this.formBuilder.group({
        title: [user?.title || ''],
        about: [user?.about || ''],
        picture: this.formBuilder.group({
          baseUrl: [user?.picture?.baseUrl || ''],
          path: [user?.picture?.path || ''],
        }),
        phone: this.formBuilder.group({
          countryCode: [user?.phone?.countryCode || ''],
          number: [user?.phone?.number || ''],
        }),
        dateOfBirth: [user?.dateOfBirth || null],
        apps: [App.SIFCA],
        maritalStatus: [MaritalStatus.PREFER_NOT_TO_SAY],
        gender: [user?.gender || undefined],
        lastName: [user?.lastName || ''],
        firstName: [user?.firstName || ''],
        roles: [[UserRole.CONSUMER]],
        email: [user?.email || '', [Validators.compose([Validators.required, Validators.email])]],
        residentialAddress: this.formBuilder.group({
          address: [this.user?.residentialAddress?.[0]?.address || ''],
          postCode: [this.user?.residentialAddress?.[0]?.postCode || ''],
          city: [this.user?.residentialAddress?.[0]?.city || ''],
          country: [this.user?.residentialAddress?.[0]?.country?.id || undefined],
          location: this.formBuilder.group({
            type: [this.user?.residentialAddress?.[0]?.location?.type || ZoneTypesEnum.POINT],
            coordinates: [this.user?.residentialAddress?.[0]?.location?.coordinates || []],
          }),
        }),
        work: this.formBuilder.array(
          user?.work?.length
            ? map(user?.work, (work) => {
                return this.formBuilder.group({
                  to: [work?.to || ''],
                  from: [work?.from || ''],
                  city: [work?.city || undefined],
                  company: [work?.company || ''],
                  position: [work?.position || ''],
                  current: [work?.current || false],
                  description: [work?.description || ''],
                });
              })
            : [
                this.formBuilder.group({
                  to: [''],
                  from: [''],
                  city: [undefined],
                  company: [''],
                  position: [''],
                  current: [false],
                  description: [''],
                }),
              ],
        ),
        education: this.formBuilder.array(
          user?.education?.length
            ? map(user?.education, (education) => {
                return this.formBuilder.group({
                  to: [education?.to || ''],
                  name: [education?.name || ''],
                  from: [education?.from || ''],
                  level: [education?.level || undefined],
                  graduated: [education?.graduated || false],
                  description: [education?.description || ''],
                });
              })
            : [
                this.formBuilder.group({
                  to: [''],
                  name: [''],
                  from: [''],
                  level: [undefined],
                  description: [''],
                  graduated: [false],
                }),
              ],
        ),
      });
      this.initialValues = this.userForm.value;
      this.userForm
        .get('education')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((value) => {
          this.isEducationButtonDisabled = isEqual(value, this.initialValues.education);
        });
      this.userForm
        .get('work')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((value) => {
          this.isExperienceButtonDisabled = isEqual(value, this.initialValues.work);
        });
      this.userForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((value) => {
        this.isProfileButtonDisabled = isEqual(omit(value, 'work', 'education'), omit(this.initialValues, 'work', 'education'));
      });
    });
    this.posService.findSocialsPagination().subscribe((res) => {
      this.socialForm = this.formBuilder.group({
        facebook: this.formBuilder.group({
          value: [this.user?.socialMedia?.find((item) => item.name.code === 'FB')?.value || ''],
          name: [res?.find((item) => item.code === 'FB')?.id || ''],
        }),
        instagram: this.formBuilder.group({
          value: [this.user?.socialMedia?.find((item) => item.name.code === 'IG')?.value || ''],
          name: [res?.find((item) => item.code === 'IG')?.id || ''],
        }),
        twitter: this.formBuilder.group({
          value: [this.user?.socialMedia?.find((item) => item.name.code === 'TT')?.value || ''],
          name: [res?.find((item) => item.code === 'TT')?.id || ''],
        }),
        youtube: this.formBuilder.group({
          value: [this.user?.socialMedia?.find((item) => item.name.code === 'YT')?.value || ''],
          name: [res?.find((item) => item.code === 'YT')?.id || ''],
        }),
        tikTok: this.formBuilder.group({
          value: [this.user?.socialMedia?.find((item) => item.name.code === 'TK')?.value || ''],
          name: [res?.find((item) => item.code === 'TK')?.id || ''],
        }),
        linkedin: this.formBuilder.group({
          value: [this.user?.socialMedia?.find((item) => item.name.code === 'LI')?.value || ''],
          name: [res?.find((item) => item.code === 'LI')?.id || ''],
        }),
        pinterest: this.formBuilder.group({
          value: [this.user?.socialMedia?.find((item) => item.name.code === 'PR')?.value || ''],
          name: [res?.find((item) => item.code === 'PR')?.id || ''],
        }),
      });
      const initValues = this.socialForm?.value;
      this.socialForm?.valueChanges.subscribe((newname: any): void => {
        this.isButtonDisabled = isEqual(newname, initValues);
      });
      this.changeDetectorRef.markForCheck();
    });
    this.posService?.infiniteStates$.pipe(takeUntil(this.unsubscribeAll)).subscribe((states) => {
      this.states = sortBy(states, ['name']);
      this.changeDetectorRef.markForCheck();
    });
    this.sharedService.navigating$ = false;
  }

  saveSocial(): void {
    this.isButtonDisabled = true;
    const socialPlatforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tikTok', 'linkedin', 'pinterest'];
    const newValues = socialPlatforms
      .filter((platform) => this.socialForm?.value[platform]?.value)
      .map((platform) => this.socialForm?.value[platform]);
    this.customersService
      .updateUser(this.user.id, { socialMedia: newValues })
      .pipe(
        catchError(() => {
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.successModal();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  saveProfile(): void {
    this.isProfileButtonDisabled = true;
    const phone = {
      ...FormHelper.getDifference(this.initialValues.phone, this.userForm.get('phone').value),
    };
    const residentialAddress = {
      ...FormHelper.getNonEmptyValues(
        omit(this.userForm.get('residentialAddress').value, 'location'),
      ),
      ...this.userForm.get(['residentialAddress', 'location', 'coordinates']).value?.length ? {location: this.userForm.get(['residentialAddress', 'location']).value} : {}
    };
    const input: any = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'picture', 'phone', 'residentialAddress', 'work', 'education'),
        omit(this.userForm.value, 'picture', 'phone', 'residentialAddress', 'work', 'education'),
      ),
      ...(!this.user ? { password: this.rStrings } : {}),
      ...(!this.user ? { roles: [UserRole?.CONSUMER] } : {}),
      ...(this.initialValues.picture?.baseUrl === this.userForm.get('picture').value?.baseUrl ? {} : { picture: this.userForm.get('picture').value }),
      ...(keys(residentialAddress)?.length ? { residentialAddress } : {}),
      ...(keys(phone)?.length ? { phone } : {}),
    };
    if (!this.user) {
      this.customersService
        .isLoginForTargetExist(this.userForm.value.email)
        .pipe(
          switchMap((response: UserExistType) => {
            if (response.exist) {
              this.translate.get('MENUITEMS.TS.USER_EXISTS').subscribe((userExists: string) => {
                Swal.fire({
                  title: 'Oops...',
                  text: userExists,
                  icon: 'warning',
                  showCancelButton: false,
                  confirmButtonColor: 'rgb(3, 142, 220)',
                  cancelButtonColor: 'rgb(243, 78, 78)',
                });
              });
              return;
            }
            return this.customersService.addUserForTarget(input);
          }),
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.router.navigate(['/ecommerce/customers/customers']);
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.customersService
        .updateUser(this.user.id, input)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.successModal();
            this.router.navigate(['/ecommerce/customers/customers']);
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  randomString = (length: number): string => {
    return Array.from({ length }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
  };

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
      this.changeDetectorRef.markForCheck();
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
        this.picture.patchValue({
          baseUrl: picture.baseUrl,
          path: picture.path,
        });
        if (this.user) {
          this.customersService
            .updateUser(this.user?.id, {
              picture: this.picture.value,
            })
            .pipe(
              catchError(() => {
                this.modalError();
                return of(null);
              }),
            )
            .subscribe((res) => {
              if (res) {
                this.successModal();
                this.changeDetectorRef.markForCheck();
              }
            });
        }
        this.changeDetectorRef.markForCheck();
      });
    };
    fileInput.click();
  }

  pickAddress(event) {
    this.position = event.coords;
    this.userForm.get(['residentialAddress', 'location']).patchValue({
      type: ZoneTypesEnum?.POINT,
      coordinates: [event.coords.lng, event.coords.lat],
    });
  }

  save(field: string) {
    if (field === 'education') {
      this.isEducationButtonDisabled = true;
    } else {
      this.isExperienceButtonDisabled = true;
    }
    const work: any[] = [
      ...map(this.work.value, (value) => {
        return {
          ...pickBy(omit(value, 'city'), identity),
          ...(value?.city?.id ? { city: value?.city?.id } : {}),
        };
      }),
    ];
    const education: any[] = [
      ...map(this.education.value, (value) => {
        return pickBy(value, identity);
      }),
    ];
    const input: any = {
      ...(isEqual(this.work.value, this.initialValues.work) && field !== 'work' ? {} : { work }),
      ...(isEqual(this.education.value, this.initialValues.education) && field !== 'education' ? {} : { education }),
    };

    this.customersService
      .updateUser(this.user?.id, input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.successModal();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  resetWorkDate(field: string, index: number) {
    if (this.work.at(index).get(field).value) {
      this.work.at(index).get(field).reset();
    }
  }

  resetEducationDate(field: string, index: number) {
    if (this.education.at(index).get(field).value) {
      this.education.at(index).get(field).reset();
    }
  }

  onChangeCountry(country: CountryType, index: number) {
    this.posService.statesPageIndex = 0;
    this.posService.infiniteStates$ = null;
    this.work.at(index).get('city').reset();
    this.selectedCountry = country;
    if (country) {
      this.posService.findStatesByCountryPagination(country?.id).subscribe();
    }
  }

  filterStates(searchTerm: string) {
    if (!this.originalStates.length) {
      this.originalStates = [...this.states];
    }
    this.states = filter(this.originalStates, (state) => state.name.toLowerCase().includes(searchTerm?.toLowerCase()));
  }

  filterCountries(searchTerm: string) {
    this.countries = filter(this.originalCountries, (country) => country.name.toLowerCase().includes(searchTerm?.toLowerCase()));
  }

  findCountriesAndStates() {
    combineLatest([this.posService.findCountriesPagination(), this.posService.findlanguagesPagination()]).subscribe(([res]) => {
      if (res) {
        this.countries = sortBy(res, ['name']);
        this.originalCountries = sortBy(res, ['name']);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  loadMoreStates() {
    this.posService.isLastStates$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.statesPageIndex++;
        this.posService.findStatesByCountryPagination(this.selectedCountry?.id).subscribe();
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

  removeWorkField(index: number): void {
    this.work.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addWorkField(): void {
    const workFormGroup = this.formBuilder.group({
      to: [''],
      from: [''],
      city: [undefined],
      company: [''],
      position: [''],
      current: [false],
      description: [''],
    });
    (this.work as FormArray).push(workFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  removeEducationField(index: number): void {
    this.education.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addEducationField(): void {
    const educationFormGroup = this.formBuilder.group({
      to: [''],
      name: [''],
      from: [''],
      level: [undefined],
      description: [''],
      graduated: [false],
    });
    this.education.push(educationFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  successModal() {
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

  ngOnDestroy() {
    this.customersService.contact$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
