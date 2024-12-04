import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import {
  Inject,
  OnInit,
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep, isEqual, keys, map, omit, values, find, findIndex } from 'lodash';
import { catchError, combineLatest, Observable, Subject, takeUntil, throwError, map as rxMap } from 'rxjs';

import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { GenerateS3SignedUrlGQL, LandingPagesType, LandingPageTypeEnum, LanguageType } from '@sifca-monorepo/terminal-generator';

import { PagesService } from '../pages.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { SharedService } from '../../../../../shared/services/shared.service';
import { AltPicturesComponent } from '../../../../../shared/components/alt-pictures/alt-pictures.component';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'content-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentDetailsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  fullPath: string;
  languages: any[];
  initialValues: any;
  pageForm: FormGroup;
  enabledPage: boolean;
  page: LandingPagesType;
  isButtonDisabled = true;
  breadCrumbItems!: Array<{}>;
  pageTypes = values(LandingPageTypeEnum);
  defaultLanguage: any = { name: 'Default', id: '1' };
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  website$: Observable<WebsiteIntegrationType> = this.websiteService.website$;

  get sectionData(): FormArray {
    return this.pageForm.get('sectionData') as FormArray;
  }
  get metaKeywords() {
    return this.pageForm?.get(['seo', 'metaKeywords']) as FormArray;
  }
  get tags() {
    return this.pageForm.get('tags');
  }
  get translation() {
    return this.pageForm.get('translation');
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private pagesService: PagesService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private activatedRoute: ActivatedRoute,
    private websiteService: WebsiteService,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.fullPath = this.router.url;
    combineLatest([this.pagesService.landingPage$, this.websiteService.website$]).subscribe(([page, website]) => {
      this.page = page;
      this.languages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
      this.pageForm = this.formBuilder.group({
        pageType: [this.page?.pageType, Validators.required],
        pageReference: [this.page?.pageReference, Validators.required],
        pageTitle: [this.page?.pageTitle, Validators.required],
        pageDescription: [this.page?.pageDescription],
        url: [this.page?.url || ''],
        tags: [this.page?.tags || []],
        seo: this.formBuilder.group({
          metaTitle: [this.page?.seo?.metaTitle || ''],
          metaDesription: [this.page?.seo?.metaDesription || ''],
          metaKeywords: this.formBuilder.array(
            this.page?.seo?.metaKeywords.length
              ? map(this.page?.seo?.metaKeywords, (metaKeyword) => {
                  return this.formBuilder.group({
                    name: [metaKeyword?.name || ''],
                    content: [metaKeyword?.content || ''],
                  });
                })
              : [this.createMetaSectionForm()],
          ),
        }),
        sectionData: this.formBuilder.array(
          this.page?.sectionData?.length
            ? map(this.page?.sectionData, (section) => {
                return this.formBuilder.group({
                  sectionTitle: [section.sectionTitle || ''],
                  sectionContent: [section.sectionContent || ''],
                  sectionReference: [section.sectionReference || ''],
                  sectionPictures: this.formBuilder.array(
                    section?.sectionPictures?.length
                      ? map(section?.sectionPictures, (picture) => {
                          return this.formBuilder.group({
                            baseUrl: [picture?.baseUrl || ''],
                            path: [picture?.path || ''],
                            width: [picture?.width],
                            height: [picture?.height],
                            alt: [picture?.alt || ''],
                          });
                        })
                      : [],
                  ),
                });
              })
            : [this.createSectionForm()],
        ),
        translation: this.formBuilder.group({
          language: [this.defaultLanguage],
          content: this.formBuilder.group({
            pageTitle: [''],
            pageDescription: [''],
            sectionData: this.formBuilder.array([this.createSectionForm()]),
          }),
        }),
      });
      this.initialValues = this.pageForm.value;
      this.pageForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((pageValues) => {
        this.isButtonDisabled = isEqual(pageValues, this.initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate
      .get(['MENUITEMS.TS.WEBSITE', 'MENUITEMS.TS.PAGE'])
      .pipe(
        rxMap((translations) => {
          this.breadCrumbItems = [{ label: translations['MENUITEMS.TS.WEBSITE'] }, { label: translations['MENUITEMS.TS.PAGE'], active: true }];
        }),
      )
      .subscribe();
  }

  onChangeLanguage(translate: LanguageType) {
    const selectedTranslation = find(this.page?.translation, (trs) => trs?.language.id === translate?.id);
    if (translate) {
      this.pageForm = this.formBuilder.group({
        pageType: [this.page?.pageType, Validators.required],
        pageReference: [this.page?.pageReference, Validators.required],
        pageTitle: [this.page?.pageTitle, Validators.required],
        pageDescription: [this.page?.pageDescription],
        url: [this.page?.url || ''],
        tags: [this.page?.tags || []],
        seo: this.formBuilder.group({
          metaTitle: [this.page?.seo?.metaTitle || ''],
          metaDesription: [this.page?.seo?.metaDesription || ''],
          metaKeywords: this.formBuilder.array(
            this.page?.seo?.metaKeywords.length
              ? map(this.page?.seo?.metaKeywords, (metaKeyword) => {
                  return this.formBuilder.group({
                    name: [metaKeyword?.name || ''],
                    content: [metaKeyword?.content || ''],
                  });
                })
              : [this.createMetaSectionForm()],
          ),
        }),
        sectionData: this.formBuilder.array(
          this.page?.sectionData?.length
            ? map(this.page?.sectionData, (section) => {
                return this.formBuilder.group({
                  sectionTitle: [section.sectionTitle || ''],
                  sectionContent: [section.sectionContent || ''],
                  sectionReference: [section.sectionReference || ''],
                  sectionPictures: this.formBuilder.array(
                    section?.sectionPictures?.length
                      ? map(section?.sectionPictures, (picture) => {
                          return this.formBuilder.group({
                            baseUrl: [picture?.baseUrl || ''],
                            path: [picture?.path || ''],
                            width: [picture?.width],
                            height: [picture?.height],
                            alt: [picture?.alt || ''],
                          });
                        })
                      : [],
                  ),
                });
              })
            : [this.createSectionForm()],
        ),
        translation: this.formBuilder.group({
          language: [selectedTranslation?.language || translate],
          content: this.formBuilder.group({
            pageTitle: [this.page?.translation?.length ? selectedTranslation?.content?.pageTitle : ''],
            pageDescription: [this.page?.translation?.length ? selectedTranslation?.content?.pageDescription : ''],
            sectionData: this.formBuilder.array(
              this.page?.translation?.length && selectedTranslation?.content?.sectionData?.length
                ? map(selectedTranslation.content?.sectionData, (section) => {
                    return this.formBuilder.group({
                      sectionTitle: section?.sectionTitle,
                      sectionContent: section?.sectionContent,
                      sectionReference: section?.sectionReference,
                      sectionPictures: this.formBuilder.array(
                        section?.sectionPictures?.length
                          ? map(section?.sectionPictures, (picture) => {
                              return this.formBuilder.group({
                                baseUrl: picture.baseUrl,
                                path: picture?.path,
                                width: picture?.width,
                                height: picture?.height,
                                alt: picture?.alt,
                              });
                            })
                          : [],
                      ),
                    });
                  })
                : [this.createSectionForm()],
            ),
          }),
        }),
      });
      this.initialValues = this.pageForm.value;
      this.pageForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  openAltModal(j: number, k?: number) {
    let input;
    const modalRef = this.modalService.open(AltPicturesComponent, { backdrop: 'static' });
    if (this.translation?.get('language').value?.language?.name && this.translation?.get('language').value?.language?.name !== 'Default') {
      modalRef.componentInstance.picture = (
        (this.pageForm.get('translation').get('content').get('sectionData') as FormArray).at(j).get('sectionPictures') as FormArray
      ).at(k).value;
    } else {
      modalRef.componentInstance.picture = this.sectionData.at(j).value.sectionPictures[j];
    }
    modalRef.result.then((result) => {
      if (result) {
        if (this.translation?.get('language').value?.language?.name && this.translation?.get('language').value?.language?.name !== 'Default') {
          let translations = this.page?.translation;
          let translation;
          ((this.pageForm.get('translation').get('content').get('sectionData') as FormArray).at(j).get('sectionPictures') as FormArray)
            .at(k)
            .patchValue(result.picture);
          const index = findIndex(this.page?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
          if (index > -1) {
            translations.splice(index, 1);
          }
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
              content: this.translation.value?.content,
            },
          ];
          input = {
            translation,
          };
        } else {
          ((this.sectionData.at(j) as FormGroup).get('sectionPictures') as FormArray).at(j).patchValue(result.picture);
          input = {
            sectionData: this.sectionData.value,
          };
        }
        if (this.page) {
          this.pagesService
            .updateLandingPage(this.page?.id, input)
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
                this.changeDetectorRef.markForCheck();
              }
            });
        }
      }
    });
  }

  upload(j: number): void {
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
          if (this.translation?.get('language').value?.language?.name && this.translation?.get('language').value?.language?.name !== 'Default') {
            ((this.pageForm.get('translation').get('content').get('sectionData') as FormArray).at(j).get('sectionPictures') as FormArray).push(
              this.formBuilder.group({
                baseUrl: picture.baseUrl,
                path: picture.path,
              }),
            );
          } else {
            ((this.sectionData.at(j) as FormGroup).get('sectionPictures') as FormArray).push(
              this.formBuilder.group({
                baseUrl: picture.baseUrl,
                path: picture.path,
              }),
            );
          }
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  createMetaSectionForm(): FormGroup {
    return this.formBuilder.group({
      name: [''],
      content: [''],
    });
  }

  back(): void {
    this.router.navigate(['/website/content/pages'], { relativeTo: this.activatedRoute });
    this.changeDetectorRef.markForCheck();
  }

  createSectionForm(): FormGroup {
    return this.formBuilder.group({
      sectionContent: [''],
      sectionReference: [''],
      sectionTitle: [''],
      sectionPictures: this.formBuilder.array([]),
    });
  }

  removePicture(j: number, k: number): void {
    if (this.translation?.get('language').value?.language?.name && this.translation?.get('language').value?.language?.name !== 'Default') {
      const pictureFormArray = this.pageForm.get('translation').get('content').get(['sectionData', j, 'sectionPictures']) as FormArray;
      pictureFormArray.removeAt(k);
    } else {
      const pictureFormArray = this.pageForm.get(['sectionData', j, 'sectionPictures']) as FormArray;
      pictureFormArray.removeAt(k);
      this.changeDetectorRef.markForCheck();
    }
  }

  removeKeywordField(index: number): void {
    const meatKeyFormArray = this.metaKeywords as FormArray;
    meatKeyFormArray.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addKeywordField(): void {
    const keyFormGroup = this.formBuilder.group({
      name: [''],
      content: [''],
    });
    (this.metaKeywords as FormArray).push(keyFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  newSection(): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.pageForm.get('translation').get('content').get('sectionData') as FormArray).push(this.createSectionForm());
    } else {
      (this.pageForm.get('sectionData') as FormArray).push(this.createSectionForm());
    }
  }

  deleteSection(j?: number): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.pageForm.get('translation').get('content').get('sectionData') as FormArray).removeAt(j);
    } else {
      (this.pageForm.get('sectionData') as FormArray).removeAt(j);
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

  save(): void {
    this.isButtonDisabled = true;
    let translation;
    let translations = this.page?.translation;
    if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
      const index = findIndex(this.page?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
      if (index > -1) {
        translations.splice(index, 1);
      }
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
          content: this.translation.value?.content,
        },
      ];
    }
    const seo = {
      ...FormHelper.getDifference(this.initialValues?.seo, this.pageForm.value?.seo),
    };
    const input: any = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'tags', 'seo', 'sectionData', 'translation'),
        omit(this.pageForm.value, 'tags', 'seo', 'sectionData', 'translation'),
      ),
      ...(keys(translation)?.length && this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
        ? { translation }
        : {}),
      ...(keys(seo)?.length ? { seo } : {}),
      ...(isEqual(
        (this.initialValues.tags?.length ? cloneDeep(this.initialValues.tags) : []).sort(),
        (this.pageForm.value?.tags?.length ? cloneDeep(this.pageForm.value.tags) : []).sort(),
      )
        ? {}
        : { tags: this.pageForm.value.tags }),

      ...(isEqual(
        (this.pageForm.value.sectionData?.length ? cloneDeep(this.initialValues.sectionData) : []).sort(),
        (this.pageForm.value?.sectionData?.length ? cloneDeep(this.pageForm.value.sectionData) : []).sort(),
      )
        ? {}
        : { sectionData: this.pageForm.value.sectionData }),
    };
    if (this.page) {
      this.pagesService
        .updateLandingPage(this.page?.id, input)
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
            this.back();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.pagesService
        .createPage(input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.back();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.page = null;
    this.pageForm.reset();
    this.pagesService.landingPage$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
