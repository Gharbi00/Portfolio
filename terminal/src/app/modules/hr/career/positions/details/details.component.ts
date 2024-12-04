import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { chain, find, findIndex, isEmpty, isEqual, keys, map, omit, values } from 'lodash';
import { Observable, Subject, catchError, combineLatest, takeUntil, throwError } from 'rxjs';

import { FormHelper } from '@diktup/frontend/helpers';
import { JobDefinitionStatusEnum, JobDefinitionType } from '@sifca-monorepo/terminal-generator';
import { DepartmentType, JobDefinitionSpecEnum, LanguageType } from '@sifca-monorepo/terminal-generator';

import { JobPositionsService } from '../positions.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { DepartmentsService } from '../../../company/departments/departments.service';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-job-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class PositionDetailsComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  fullPath: string;
  languages: any[];
  initialValues: any;
  enabledPage: boolean;
  isButtonDisabled = true;
  jobDefinitionForm: FormGroup;
  jobDefinition: JobDefinitionType;
  jobDepartments: DepartmentType[];
  defaultLanguage: any = { name: 'Default', id: '1' };
  jobDefinitionStatus = values(JobDefinitionStatusEnum);
  jobDefinitionSpecEnum = values(JobDefinitionSpecEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  website$: Observable<WebsiteIntegrationType> = this.websiteService.website$;

  get specs(): FormArray {
    return this.jobDefinitionForm.get('specs') as FormArray;
  }
  get translation() {
    return this.jobDefinitionForm.get('translation');
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private websiteService: WebsiteService,
    private activatedRoute: ActivatedRoute,
    private jobsService: JobPositionsService,
    private changeDetectorRef: ChangeDetectorRef,
    private jobDepartmentService: DepartmentsService,
  ) {
    this.fullPath = this.router.url;
    combineLatest([this.jobsService.jobDefinition$, this.websiteService.website$]).subscribe(([jobDefinition, website]) => {
      this.jobDefinition = jobDefinition;
      this.languages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
      this.jobDefinitionForm = this.formBuilder.group({
        department: [this.jobDefinition?.department?.id || ''],
        status: [this.jobDefinition?.status || ''],
        title: [this.jobDefinition?.title || ''],
        specs: this.formBuilder.array(
          this.jobDefinition?.specs?.length
            ? map(this.jobDefinition?.specs, (spec) => {
                return this.formBuilder.group({
                  key: [spec?.key],
                  value: [spec?.value],
                });
              })
            : [],
        ),
        description: this.formBuilder.group({
          description: [this.jobDefinition?.description?.description || ''],
          descriptionList: this.formBuilder.array(
            this.jobDefinition?.description?.descriptionList?.length ? this.jobDefinition?.description?.descriptionList : [''],
          ),
        }),
        responsibility: this.formBuilder.group({
          description: [this.jobDefinition?.responsibility?.description || ''],
          descriptionList: this.formBuilder.array(
            this.jobDefinition?.responsibility?.descriptionList?.length ? this.jobDefinition?.responsibility?.descriptionList : [''],
          ),
        }),
        offer: this.formBuilder.group({
          description: [this.jobDefinition?.offer?.description || ''],
          descriptionList: this.formBuilder.array(
            this.jobDefinition?.offer?.descriptionList?.length ? this.jobDefinition?.offer?.descriptionList : [''],
          ),
        }),
        translation: this.formBuilder.group({
          language: [this.defaultLanguage],
        }),
      });
      this.changeDetectorRef.markForCheck();
      this.initialValues = this.jobDefinitionForm.value;
      this.jobDefinitionForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((jobDefValues) => {
        this.isButtonDisabled = isEqual(jobDefValues, this.initialValues);
      });
    });
    this.jobDepartmentService.departments$.pipe(takeUntil(this.unsubscribeAll)).subscribe((jobDeps: DepartmentType[]) => {
      this.jobDepartments = jobDeps;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {}

  onChangeLanguage(translate: LanguageType) {
    const selectedTranslation = find(this.jobDefinition?.translation, (trs) => trs?.language.id === translate?.id);
    if (translate) {
      this.jobDefinitionForm = this.formBuilder.group({
        department: [this.jobDefinition?.department?.id || ''],
        status: [this.jobDefinition?.status || ''],
        title: [this.jobDefinition?.title || ''],
        specs: this.formBuilder.array(
          this.jobDefinition?.specs?.length
            ? map(this.jobDefinition?.specs, (spec) => {
                return this.formBuilder.group({
                  key: [spec?.key],
                  value: [spec?.value],
                });
              })
            : [],
        ),
        description: this.formBuilder.group({
          description: [this.jobDefinition?.description?.description || ''],
          descriptionList: this.formBuilder.array(
            this.jobDefinition?.description?.descriptionList?.length ? this.jobDefinition?.description?.descriptionList : [''],
          ),
        }),
        responsibility: this.formBuilder.group({
          description: [this.jobDefinition?.responsibility?.description || ''],
          descriptionList: this.formBuilder.array(
            this.jobDefinition?.responsibility?.descriptionList?.length ? this.jobDefinition?.responsibility?.descriptionList : [''],
          ),
        }),
        offer: this.formBuilder.group({
          description: [this.jobDefinition?.offer?.description || ''],
          descriptionList: this.formBuilder.array(
            this.jobDefinition?.offer?.descriptionList?.length ? this.jobDefinition?.offer?.descriptionList : [''],
          ),
        }),
        translation: this.formBuilder.group({
          language: [selectedTranslation?.language || translate],
          content: this.formBuilder.group({
            title: [selectedTranslation?.content?.title || ''],
            specs: this.formBuilder.array(
              this.jobDefinition?.translation?.length && selectedTranslation?.content?.specs?.length
                ? map(selectedTranslation?.content?.specs, (spec) => {
                    return this.formBuilder.group({
                      key: spec?.key,
                      value: spec?.value,
                    });
                  })
                : [
                    this.formBuilder.group({
                      key: [''],
                      value: [''],
                    }),
                  ],
            ),
            description: this.formBuilder.group({
              description: [selectedTranslation?.content?.description?.description || ''],
              descriptionList: this.formBuilder.array(selectedTranslation?.content?.description?.descriptionList || ['']),
            }),
            responsibility: this.formBuilder.group({
              description: [selectedTranslation?.content?.responsibility?.description || ''],
              descriptionList: this.formBuilder.array(selectedTranslation?.content?.responsibility?.descriptionList || ['']),
            }),
            offer: this.formBuilder.group({
              description: [selectedTranslation?.content?.offer?.description || ''],
              descriptionList: this.formBuilder.array(selectedTranslation?.content?.offer?.descriptionList || ['']),
            }),
          }),
        }),
      });
      this.initialValues = this.jobDefinitionForm.value;
      this.jobDefinitionForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  createSectionForm(): FormGroup {
    return this.formBuilder.group({
      item: [''],
    });
  }

  addResponsibilityField(): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.jobDefinitionForm.get('translation').get('content').get(['responsibility', 'descriptionList']) as FormArray).push(new FormControl(''));
    } else {
      (this.jobDefinitionForm?.get(['responsibility', 'descriptionList']) as FormArray)?.push(new FormControl(''));
    }
    this.changeDetectorRef.markForCheck();
  }

  removeResponsibilityField(j: number): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.jobDefinitionForm.get('translation').get('content').get(['responsibility', 'descriptionList']) as FormArray).removeAt(j);
    } else {
      const meatKeyFormArray = this.jobDefinitionForm.get('responsibility').get('descriptionList') as FormArray;
      meatKeyFormArray.removeAt(j);
      this.changeDetectorRef.markForCheck();
    }
  }

  removeDescriptionField(j: number): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.jobDefinitionForm.get('translation').get(['content', 'description', 'descriptionList']) as FormArray).removeAt(j);
    } else {
      const meatKeyFormArray = this.jobDefinitionForm.get('description').get('descriptionList') as FormArray;
      meatKeyFormArray.removeAt(j);
    }
    this.changeDetectorRef.markForCheck();
  }

  addDescriptionListField(): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.jobDefinitionForm.get('translation').get(['content', 'description', 'descriptionList']) as FormArray).push(new FormControl(''));
    } else {
      (this.jobDefinitionForm?.get(['description', 'descriptionList']) as FormArray)?.push(new FormControl(''));
    }
    this.changeDetectorRef.markForCheck();
  }

  addOfferField(): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.jobDefinitionForm.get('translation').get(['content', 'offer', 'descriptionList']) as FormArray).push(new FormControl(''));
    } else {
      (this.jobDefinitionForm?.get(['offer', 'descriptionList']) as FormArray)?.push(new FormControl(''));
    }
    this.changeDetectorRef.markForCheck();
  }

  removeOfferField(j: number): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.jobDefinitionForm.get('translation').get(['content', 'offer', 'descriptionList']) as FormArray).removeAt(j);
    } else {
      const meatKeyFormArray = this.jobDefinitionForm.get(['offer', 'descriptionList']) as FormArray;
      meatKeyFormArray.removeAt(j);
    }
    this.changeDetectorRef.markForCheck();
  }

  addSpecsField(): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.jobDefinitionForm.get('translation').get('content').get('specs') as FormArray).push(
        this.formBuilder.group({
          key: [''],
          value: [''],
        }),
      );
    } else {
      (this.specs as FormArray).push(
        this.formBuilder.group({
          key: [''],
          value: [''],
        }),
      );
    }
  }

  removeSpecs(j?: number): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.jobDefinitionForm.get('translation').get('content').get('specs') as FormArray).removeAt(j);
    } else {
      this.specs.removeAt(j);
    }
    this.changeDetectorRef.markForCheck();
  }

  newResponsibilitySection(): void {
    (this.jobDefinitionForm.get('responsibility') as FormArray).push(this.createSectionForm());
  }

  newOfferSection(): void {
    (this.jobDefinitionForm.get('offer') as FormArray).push(this.createSectionForm());
  }

  close(): void {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }

  deleteResponsibilitySection(index: number): void {
    (this.jobDefinitionForm.get('responsibility') as FormArray).removeAt(index);
    if (!(this.jobDefinitionForm.get('responsibility') as FormArray)?.length) {
      this.newResponsibilitySection();
    }
  }

  deleteOfferSection(index: number): void {
    (this.jobDefinitionForm.get('offer') as FormArray).removeAt(index);
    if (!(this.jobDefinitionForm.get('offer') as FormArray)?.length) {
      this.newOfferSection();
    }
  }

  save(): void {
    this.isButtonDisabled = true;
    let translation;
    let translations = this.jobDefinition?.translation;
    if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
      const index = findIndex(this.jobDefinition?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
      if (index > -1) {
        translations.splice(index, 1);
      }
      const specs = chain(this.translation.value?.content?.specs)
        .filter((spec) => !(isEmpty(spec?.key) || isEmpty(spec?.value)))
        .map((spec) => ({
          key: spec?.key,
          value: spec?.value,
        }))
        .value();

      translation = [
        ...map(translations, (trans) => {
          return {
            ...omit(trans, 'language', 'default'),
            language: trans?.language?.id,
            content: trans?.content,
          };
        }),
        {
          ...omit(this.translation.value, 'language', 'default'),
          language: this.translation.value?.language?.id,
          content: {
            ...omit(this.translation.value?.content, 'specs'),
            ...(specs?.length ? { specs } : {}),
          },
        },
      ];
    }
    const specs = chain(this.jobDefinitionForm.value?.content?.specs)
      .filter((spec) => !(isEmpty(spec?.key) || isEmpty(spec?.value)))
      .map((spec) => ({
        key: spec?.key,
        value: spec?.value,
      }))
      .value();
    const input: any = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'description', 'responsibility', 'offer', 'specs', 'translation'),
        omit(this.jobDefinitionForm.value, 'description', 'responsibility', 'offer', 'specs', 'translation'),
      ),
      ...(keys(translation)?.length && this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
        ? { translation }
        : {}),
      ...(isEqual(this.jobDefinitionForm.value?.offer, this.initialValues.offer) ? {} : { offer: this.jobDefinitionForm.value?.offer }),

      ...(isEqual(this.jobDefinitionForm.value?.description, this.initialValues.description)
        ? {}
        : { description: this.jobDefinitionForm.value?.description }),

      ...(isEqual(this.jobDefinitionForm.value?.responsibility, this.initialValues.responsibility)
        ? {}
        : { responsibility: this.jobDefinitionForm.value?.responsibility }),
      ...(specs?.length ? { specs } : {}),
    };
    if (this.jobDefinition) {
      this.jobsService
        .updateJobDefinition(this.jobDefinition?.id, input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.router.navigate(['/hr/career/positions/all'], { relativeTo: this.activatedRoute });
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.jobsService
        .createJobDefinition(input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.router.navigate(['/hr/career/positions/all'], { relativeTo: this.activatedRoute });
            this.changeDetectorRef.markForCheck();
          }
        });
    }
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

  ngOnDestroy(): void {
    this.jobDefinitionForm.reset(), (this.jobsService.jobDefinition$ = null);
    this.jobDefinition = null;
    this.jobDefinitionForm.reset();
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
