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
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { find, findIndex, isEqual, keys, map, omit, values } from 'lodash';
import { catchError, combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL, SlideVisualTypeEnum } from '@sifca-monorepo/terminal-generator';

import { DOCUMENT } from '@angular/common';
import { LanguageType, SlidesType } from '@sifca-monorepo/terminal-generator';

import { SlidesService } from '../slides.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'content-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlidesDetailsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  fullPath: string;
  languages: any[];
  slide: SlidesType;
  initialValues: any;
  slideForm: FormGroup;
  isButtonDisabled = true;
  breadCrumbItems!: Array<{}>;
  visualTypes = values(SlideVisualTypeEnum);
  defaultLanguage: any = { name: 'Default', id: '1' };
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  website$: Observable<WebsiteIntegrationType> = this.websiteService.website$;

  get content(): FormArray {
    return this.slideForm.get('content') as FormArray;
  }

  get translation() {
    return this.slideForm.get('translation');
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private slidesService: SlidesService,
    private storageHelper: StorageHelper,
    private activatedRoute: ActivatedRoute,
    private websiteService: WebsiteService,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.fullPath = this.router.url;
    combineLatest([this.slidesService.slide$, this.websiteService.website$]).subscribe(([slide, website]) => {
      this.slide = slide;
      this.languages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
      this.slideForm = this.formBuilder.group({
        reference: [slide?.reference || ''],
        visualType: [slide?.visualType || ''],
        content: this.formBuilder.array(
          this.slide?.content?.length
            ? map(this.slide.content, (content) => {
                return this.formBuilder.group({
                  image: this.formBuilder.group({
                    baseUrl: [content?.image?.baseUrl || ''],
                    path: [content?.image?.path || ''],
                  }),
                  icon: [content?.icon || ''],
                  title: [content?.title || ''],
                  description: [content?.description || ''],
                  calltoaction: this.formBuilder.group({
                    label: [content?.calltoaction?.label || ''],
                    link: [content?.calltoaction?.link || ''],
                  }),
                });
              })
            : [
                this.formBuilder.group({
                  image: this.formBuilder.group({
                    baseUrl: [''],
                    path: [''],
                  }),
                  icon: [''],
                  title: [''],
                  description: [''],
                  calltoaction: this.formBuilder.group({
                    label: [''],
                    link: [''],
                  }),
                }),
              ],
        ),
        translation: this.formBuilder.group({
          language: [this.defaultLanguage],
          content: this.formBuilder.array([
            this.formBuilder.group({
              image: this.formBuilder.group({
                baseUrl: [''],
                path: [''],
              }),
              icon: [''],
              title: [''],
              description: [''],
              calltoaction: this.formBuilder.group({
                label: [''],
                link: [''],
              }),
            }),
          ]),
        }),
      });
      this.initialValues = this.slideForm.value;
      this.slideForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(values, this.initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.PAGE').subscribe((page: string) => {
        this.breadCrumbItems = [{ label: website }, { label: page, active: true }];
      });
    });
  }

  onChangeLanguage(translate: LanguageType) {
    const selectedTranslation = find(this.slide?.translation, (trs) => trs?.language.id === translate?.id);
    if (translate) {
      this.slideForm = this.formBuilder.group({
        reference: [this.slide?.reference || ''],
        visualType: [this.slide?.visualType || ''],
        content: this.formBuilder.array(
          this.slide?.content?.length
            ? map(this.slide.content, (content) => {
                return this.formBuilder.group({
                  image: this.formBuilder.group({
                    baseUrl: [content?.image?.baseUrl || ''],
                    path: [content?.image?.path || ''],
                  }),
                  icon: [content?.icon || ''],
                  title: [content?.title || ''],
                  description: [content?.description || ''],
                  calltoaction: this.formBuilder.group({
                    label: [content?.calltoaction?.label || ''],
                    link: [content?.calltoaction?.link || ''],
                  }),
                });
              })
            : [
                this.formBuilder.group({
                  image: this.formBuilder.group({
                    baseUrl: [''],
                    path: [''],
                  }),
                  icon: [''],
                  title: [''],
                  description: [''],
                  calltoaction: this.formBuilder.group({
                    label: [''],
                    link: [''],
                  }),
                }),
              ],
        ),
        translation: this.formBuilder.group({
          language: [selectedTranslation?.language || translate],
          content: this.formBuilder.array(
            this.slide?.translation?.length && selectedTranslation?.content?.length
              ? map(selectedTranslation?.content, (content) => {
                  return this.formBuilder.group({
                    image: this.formBuilder.group({
                      baseUrl: [content?.image?.baseUrl || ''],
                      path: [content?.image?.path || ''],
                    }),
                    icon: [content?.icon || ''],
                    title: [content?.title || ''],
                    description: [content?.description || ''],
                    calltoaction: this.formBuilder.group({
                      label: [content?.calltoaction?.label || ''],
                      link: [content?.calltoaction?.link || ''],
                    }),
                  });
                })
              : [
                  this.formBuilder.group({
                    image: this.formBuilder.group({
                      baseUrl: [''],
                      path: [''],
                    }),
                    icon: [''],
                    title: [''],
                    description: [''],
                    calltoaction: this.formBuilder.group({
                      label: [''],
                      link: [''],
                    }),
                  }),
                ],
          ),
        }),
      });
      this.initialValues = this.slideForm.value;
      this.slideForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  buildContentFormArray() {
    this.formBuilder.array(
      this.slide?.translation?.length
        ? map(this.slide.translation, (trans) => {
            return this.formBuilder.group({
              language: [trans?.language?.id || undefined],
              content: this.formBuilder.array(
                trans?.content?.length
                  ? map(trans.content, (content) => {
                      return this.formBuilder.group({
                        image: this.formBuilder.group({
                          baseUrl: [content?.image?.baseUrl || ''],
                          path: [content?.image?.path || ''],
                        }),
                        icon: [content?.icon || ''],
                        title: [content?.title || ''],
                        description: [content?.description || ''],
                        calltoaction: this.formBuilder.group({
                          label: [content?.calltoaction?.label || ''],
                          link: [content?.calltoaction?.link || ''],
                        }),
                      });
                    })
                  : [
                      this.formBuilder.group({
                        image: this.formBuilder.group({
                          baseUrl: [''],
                          path: [''],
                        }),
                        icon: [''],
                        title: [''],
                        description: [''],
                        calltoaction: this.formBuilder.group({
                          label: [''],
                          link: [''],
                        }),
                      }),
                    ],
              ),
            });
          })
        : [
            this.formBuilder.group({
              language: [undefined],
              content: this.formBuilder.array([
                this.formBuilder.group({
                  image: this.formBuilder.group({
                    baseUrl: [''],
                    path: [''],
                  }),
                  icon: [''],
                  title: [''],
                  description: [''],
                  calltoaction: this.formBuilder.group({
                    label: [''],
                    link: [''],
                  }),
                }),
              ]),
            }),
          ],
    );
  }

  newContent(): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.slideForm.get('translation').get('content') as FormArray).push(this.createContentForm());
    } else {
      (this.slideForm.get('content') as FormArray).push(this.createContentForm());
    }
  }

  newTranslation(): void {
    (this.slideForm.get('translation') as FormArray).push(this.createTranslationForm());
  }

  deleteTranslation(index: number): void {
    (this.slideForm.get('translation') as FormArray).removeAt(index);
  }

  removePicture(j?: number): void {
    let input: any;
    if (this.translation?.value?.language?.name !== 'Default') {
      const fileName = (this.slideForm.get('translation').get('content') as FormArray).at(j).get('image').value.path;
      this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
        if (data.deleteFileFromAws) {
          (this.slideForm.get('translation').get('content') as FormArray).at(j).get('image').patchValue({ path: '', baseUrl: '' });
          input = {
            translation: { content: { image: null } },
          };
          this.changeDetectorRef.markForCheck();
        }
      });
    } else {
      const fileName = (this.content.at(j) as FormGroup).get('image').get('image').value.path;
      this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
        if (data.deleteFileFromAws) {
          (this.slideForm.get('translation').get('content') as FormArray).at(j).get('image').patchValue({ path: '', baseUrl: '' });
          (this.content.at(j) as FormGroup).get('image').patchValue({ path: '', baseUrl: '' });
          input = {
            image: null,
          };
          this.changeDetectorRef.markForCheck();
        }
        if (this.slide) {
          this.slidesService
            .updateSlide(this.slide?.id, input)
            .pipe(
              catchError(() => {
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe((res: any) => {
              if (res) {
                this.position();
                this.back();
                this.changeDetectorRef.markForCheck();
              }
            });
        }
      });
    }
    this.changeDetectorRef.markForCheck();
  }

  deleteContent(j?: number): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.slideForm.get('translation').get('content') as FormArray).removeAt(j);
    } else {
      (this.slideForm.get('content') as FormArray).removeAt(j);
    }
  }

  back(): void {
    this.router.navigate(['/website/content/slides'], { relativeTo: this.activatedRoute });
    this.changeDetectorRef.markForCheck();
  }

  upload(j?: number): void {
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
          if (this.translation?.value?.language?.name !== 'Default') {
            (this.slideForm.get(['translation', 'content']) as FormArray).at(j).patchValue({
              image: {
                path: picture.path,
                baseUrl: picture.baseUrl,
              },
            });
          } else {
            (this.content.at(j) as FormGroup).patchValue({
              image: {
                path: picture.path,
                baseUrl: picture.baseUrl,
              },
            });
          }
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  createContentForm(): FormGroup {
    return this.formBuilder.group({
      image: this.formBuilder.group({
        baseUrl: [''],
        path: [''],
      }),
      icon: [''],
      title: [''],
      description: [''],
      calltoaction: this.formBuilder.group({
        label: [''],
        link: [''],
      }),
    });
  }

  createTranslationForm(): FormGroup {
    return this.formBuilder.group({
      language: [undefined],
      content: this.formBuilder.array([
        this.formBuilder.group({
          image: this.formBuilder.group({
            baseUrl: [''],
            path: [''],
          }),
          icon: [''],
          title: [''],
          description: [''],
          calltoaction: this.formBuilder.group({
            label: [''],
            link: [''],
          }),
        }),
      ]),
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
    let translations = this.slide?.translation;
    if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
      const index = findIndex(this.slide?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
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
    const content = {
      ...FormHelper.getDifference(this.initialValues.content, this.slideForm.value.content),
    };
    const input: any = {
      ...(keys(content)?.length ? { content: this.slideForm.value.content } : {}),
      ...(keys(translation)?.length && this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
        ? { translation }
        : {}),
      ...FormHelper.getDifference(omit(this.initialValues, 'translation'), omit(this.slideForm.value, 'translation')),
    };
    if (this.slide) {
      this.slidesService
        .updateSlide(this.slide?.id, input)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
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
      this.slidesService.createSlide(input).subscribe((res: any) => {
        if (res) {
          this.back();
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.slide = null;
    this.slideForm.reset();
    this.slidesService.slide$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
