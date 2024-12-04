import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, combineLatest, of, throwError } from 'rxjs';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { cloneDeep, identity, isEqual, map, omit, pickBy, values } from 'lodash';
import { AbstractControlOptions, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AmazonS3Helper, FormHelper, StorageHelper, ValidationHelper } from '@diktup/frontend/helpers';
import {
  App,
  Gender,
  UserType,
  StateType,
  CountryType,
  AcademicLevel,
  MaritalStatus,
  ZoneTypesEnum,
  PermissionType,
  GenerateS3SignedUrlGQL,
  UserRole,
} from '@sifca-monorepo/terminal-generator';

import { TeamService } from '../team.service';
import { RolesService } from '../../roles/roles.service';
import { PosService } from '../../../../core/services/pos.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { SharedService } from '../../../../shared/services/shared.service';

@Component({
  selector: 'sifca-monorepo-team-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class TeamEditComponent implements OnInit {
  user: UserType;
  initialValues: any;
  states: StateType[];
  userForm: FormGroup;
  resetForm: FormGroup;
  socialForm: FormGroup;
  passwordForm: FormGroup;
  roles = values(UserRole);
  isButtonDisabled = true;
  countries: CountryType[];
  selectedRoles: any[] = [];
  isPwdButtonDisabled = true;
  selectedItems: string[] = [];
  isResetButtonDisabled = true;
  isUserButtonDisabled = true;
  genders: string[] = values(Gender);
  position: { lng: number; lat: number };
  levels: string[] = values(AcademicLevel);
  maritalStatuses: string[] = values(MaritalStatus);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  permissions$: Observable<PermissionType[]> = this.rolesService.permissions$;

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
    private modalService: NgbModal,
    private authService: AuthService,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.teamService.getCountries().subscribe((res) => {
      this.countries = res;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.teamService.user$.subscribe((user) => {
      this.user = user;
      this.userForm = this.formBuilder.group({
        work: this.formBuilder.array(
          user?.work?.length
            ? map(user?.work, (work) => {
                return this.formBuilder.group({
                  to: [work?.to || ''],
                  from: [work?.from || ''],
                  city: [work?.city?.id || undefined],
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
        apps: [this.user?.apps || [App.SIFCA]],
        phoneNumber: [this.user?.phone?.number || ''],
        permission: [this.user?.permission?.id || undefined],
        gender: [this.user?.gender || Gender.PREFER_NOT_TO_SAY],
        lastName: [this.user?.lastName || ''],
        username: [this.user?.username || ''],
        firstName: [this.user?.firstName || '', [Validators.required]],
        maritalStatus: [this.user?.maritalStatus || MaritalStatus.PREFER_NOT_TO_SAY],
        email: [this.user?.email || '', [Validators.compose([Validators.required, Validators.email])]],
        residentialAddress: this.formBuilder.group({
          address: [this.user?.residentialAddress[0]?.address || ''],
          postCode: [this.user?.residentialAddress[0]?.postCode || ''],
          city: [this.user?.residentialAddress[0]?.city || ''],
          country: [this.user?.residentialAddress[0]?.country?.id || ''],
          location: this.formBuilder.group({
            type: [this.user?.residentialAddress[0]?.location?.type || ZoneTypesEnum.POINT],
            coordinates: [this.user?.residentialAddress[0]?.location?.coordinates || []],
          }),
        }),
      });
      this.changeDetectorRef.markForCheck();
      this.initialValues = this.userForm.value;
      this.userForm.valueChanges.subscribe((values) => {
        this.isUserButtonDisabled = isEqual(this.initialValues, values);
      });
      this.posService.findSocialsPagination().subscribe((res) => {
        this.socialForm = this.formBuilder.group({
          facebook: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'FB')?.value || ''],
            name: [res?.find((item) => item.code === 'FB')?.id || ''],
          }),
          instagram: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'IG')?.value || ''],
            name: [res?.find((item) => item.code === 'IG')?.id || ''],
          }),
          twitter: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'TT')?.value || ''],
            name: [res?.find((item) => item.code === 'TT')?.id || ''],
          }),
          youtube: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'YT')?.value || ''],
            name: [res?.find((item) => item.code === 'YT')?.id || ''],
          }),
          tikTok: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'TK')?.value || ''],
            name: [res?.find((item) => item.code === 'TK')?.id || ''],
          }),
          linkedin: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'LI')?.value || ''],
            name: [res?.find((item) => item.code === 'LI')?.id || ''],
          }),
          pinterest: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'PR')?.value || ''],
            name: [res?.find((item) => item.code === 'PR')?.id || ''],
          }),
        });
        const initValues = this.socialForm?.value;
        this.socialForm?.valueChanges.subscribe((newname: any): void => {
          this.isButtonDisabled = isEqual(newname, initValues);
        });
        this.changeDetectorRef.markForCheck();
      });
      this.passwordForm = this.formBuilder.group({
        pwd: this.formBuilder.group(
          {
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
          },
          { validators: [ValidationHelper.matchingFields('password', 'confirmPassword')] } as AbstractControlOptions,
        ),
      });
      this.resetForm = this.formBuilder.group({
        email: ['', [Validators.compose([Validators.required, Validators.email])]],
      });
      this.resetForm.valueChanges.subscribe(() => {
        this.isResetButtonDisabled = false;
      });
      const initValues = this.passwordForm.value;
      this.passwordForm.valueChanges.subscribe((ivalues) => {
        this.isPwdButtonDisabled = isEqual(initValues, ivalues);
      });
      this.selectedRoles = this.user?.roles;
      if (this.user) {
        this.position = {
          lng: this.user?.residentialAddress[0]?.location?.coordinates[0],
          lat: this.user?.residentialAddress[0]?.location?.coordinates[1],
        };
      }
    });
  }

  ngAfterViewInit() {
    combineLatest([this.posService.findStatesPagination(), this.rolesService.getPermissionsByTarget()]).subscribe(([res]) => {
      this.states = res.objects;
      this.changeDetectorRef.markForCheck();
    });
  }

  saveExperience() {
    this.isUserButtonDisabled = true;
    const work: any[] = [
      ...map(this.work.value, (value) => {
        return pickBy(value, identity);
      }),
    ];
    const education: any[] = [
      ...map(this.education.value, (value) => {
        return pickBy(value, identity);
      }),
    ];
    const input: any = {
      ...(isEqual(this.work.value, this.initialValues.work) ? {} : { work }),
      ...(isEqual(this.education.value, this.initialValues.education) ? {} : { education }),
    };

    this.teamService
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
          this.changeDetectorRef.markForCheck();
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

  forgotPasswordModal(resetContent: NgbModal) {
    this.modalService.open(resetContent, {
      centered: true,
      backdrop: 'static',
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

  sendResetLink(): void {
    this.isResetButtonDisabled = true;
    if (this.resetForm.invalid) {
      return;
    }
    this.resetForm.disable();
    this.authService
      .forgotPassword(this.resetForm.get('email')?.value)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.translate.get('COMMON.CODE_SENT').subscribe((text: string) => {
            this.successModal(text);
          });
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  updatePassword() {
    this.isPwdButtonDisabled = true;
    this.authService
      .updateUserPasswordForApp(this.user.id, this.passwordForm.get(['pwd', 'password']).value)
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
          this.teamService
            .updateUser(this.user.id, {
              picture: pictures,
            })
            .pipe(
              catchError((error) => {
                return of(null);
              }),
            )
            .subscribe((res) => {
              if (res) {
                this.changeDetectorRef.markForCheck();
              }
            });
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  addSocial() {
    const newValues: any = {
      socialMedia: 'newFormValues',
    };
    this.posService.update(newValues).subscribe((pos) => {
      if (pos) {
        this.isButtonDisabled = true;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  pickAddress(event) {
    this.position = event.coords;
    this.userForm.get(['residentialAddress', 'location']).patchValue({
      type: ZoneTypesEnum?.POINT,
      coordinates: [event.coords.lng, event.coords.lat],
    });
  }

  onRoleChange(event: any, role: string) {
    if (event.target.checked) {
      this.selectedRoles.push(role);
    } else {
      const index = this.selectedRoles.indexOf(role);
      if (index !== -1) {
        this.selectedRoles.splice(index, 1);
      }
    }
    this.userForm.get('roles').patchValue(this.selectedRoles);
  }

  successModal(text?: string) {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: text ? text : workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }

  saveSocial(): void {
    this.isButtonDisabled = true;
    const socialPlatforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tikTok', 'linkedin', 'pinterest'];
    const newValues = socialPlatforms
      .filter((platform) => this.socialForm?.value[platform]?.value)
      .map((platform) => this.socialForm?.value[platform]);
    this.teamService
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

  save(): void {
    this.isButtonDisabled = true;
    this.isUserButtonDisabled = true;
    let args: any;
    let method: string;
    method = 'updateUser';
    args = [
      this.user.id,
      {
        ...FormHelper.getDifference(
          omit(this.initialValues, 'apps', 'phoneNumber', 'residentialAddress', 'education', 'work', 'socialMedia'),
          omit(this.userForm.value, 'apps', 'phoneNumber', 'residentialAddress', 'education', 'work', 'socialMedia'),
        ),
        ...(this.initialValues?.phoneNumber === this.userForm.value.phoneNumber
          ? {}
          : { phone: { number: this.userForm.value.phoneNumber, countryCode: '216' } }),
        ...(isEqual(this.initialValues.residentialAddress, this.userForm.value?.residentialAddress)
          ? {}
          : { residentialAddress: this.userForm.value.residentialAddress }),
        ...(isEqual(
          (this.initialValues.apps?.length ? cloneDeep(this.initialValues.apps) : []).sort(),
          (this.userForm.value?.apps?.length ? cloneDeep(this.userForm.value.apps) : []).sort(),
        )
          ? {}
          : { apps: this.userForm.value.apps }),
        ...(isEqual(
          (this.initialValues.apps?.length ? cloneDeep(this.initialValues.apps) : []).sort(),
          (this.userForm.value?.apps?.length ? cloneDeep(this.userForm.value.apps) : []).sort(),
        )
          ? {}
          : { apps: this.userForm.value.apps }),
      },
    ];
    this.teamService[method](...args)
      .pipe(
        catchError((error: any) => {
          this.modalError();
          return throwError(() => error);
        }),
      )
      .subscribe(() => {
        this.successModal();
        this.router.navigate(['/system/team']);
        this.changeDetectorRef.markForCheck();
      });
  }
}
