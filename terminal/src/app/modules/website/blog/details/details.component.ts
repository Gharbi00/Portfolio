import moment from 'moment';
import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { catchError, takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep, find, findIndex, isEqual, keys, map, omit } from 'lodash';
import { Observable, Subject, combineLatest, throwError } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { BlogType, DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL, LanguageType } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';

import { BlogService } from '../blog.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { WebsiteService } from '../../../system/apps/apps/website/website.service';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { AltPicturesComponent } from '../../../../shared/components/alt-pictures/alt-pictures.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'blog-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetailsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  blog: BlogType;
  _moment = moment;
  initialValues: any;
  blogForm: FormGroup;
  numberOfBlog: any = {};
  selectedFilter = 'all';
  isButtonDisabled = true;
  breadCrumbItems!: Array<{}>;
  defaultLanguage: any = { name: 'Default', id: '1' };
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  website$: Observable<WebsiteIntegrationType> = this.websiteService.website$;
  languages: any[];
  fullPath: string;

  get pictures(): FormArray {
    return this.blogForm.get('pictures') as FormArray;
  }

  get metaKeywords() {
    return this.blogForm.get(['seo', 'metaKeywords']);
  }
  get sectionData(): FormArray {
    return this.blogForm.get('sectionData') as FormArray;
  }
  get translation() {
    return this.blogForm.get('translation');
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
    private blogService: BlogService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private websiteService: WebsiteService,
    private activatedRoute: ActivatedRoute,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.fullPath = this.router.url;
    combineLatest([this.blogService.blog$, this.websiteService.website$]).subscribe(([blog, website]) => {
      this.blog = blog;
      this.languages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
      this.blogForm = this.formBuilder.group({
        title: [this.blog?.title || ''],
        url: [this.blog?.url || ''],
        tags: [this.blog?.tags?.length ? this.blog?.tags : []],
        seo: this.formBuilder.group({
          metaTitle: [this.blog?.seo?.metaTitle || ''],
          metaDesription: [this.blog?.seo?.metaDesription || ''],
          metaKeywords: this.formBuilder.array(
            this.blog?.seo.metaKeywords?.length
              ? map(this.blog?.seo?.metaKeywords, (key) => {
                  return this.formBuilder.group({
                    name: key?.name,
                    content: key?.content,
                  });
                })
              : [],
          ),
        }),
        pictures: this.formBuilder.array(
          this.blog?.pictures?.length
            ? map(this.blog?.pictures, (picture) => {
                return this.formBuilder.group({
                  baseUrl: picture?.baseUrl,
                  path: picture?.path,
                  width: picture.width,
                  height: picture.height,
                  alt: picture.alt,
                });
              })
            : [],
        ),
        sectionData: this.formBuilder.array(
          this.blog?.sectionData?.length
            ? map(this.blog?.sectionData, (section) => {
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
        translation: this.formBuilder.group({
          language: [this.defaultLanguage],
          content: this.formBuilder.group({
            title: [''],
            sectionData: this.formBuilder.array([this.createSectionForm()]),
          }),
        }),
      });
      this.initialValues = this.blogForm.value;
      this.blogForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.WAREHOUSE').subscribe((warehouse: string) => {
        this.breadCrumbItems = [{ label: website }, { label: warehouse, active: true }];
      });
    });
  }

  onChangeLanguage(translate: LanguageType) {
    const selectedTranslation = find(this.blog?.translation, (trs) => trs?.language.id === translate?.id);
    if (translate) {
      this.blogForm = this.formBuilder.group({
        title: [this.blog?.title || ''],
        url: [this.blog?.url || ''],
        tags: [this.blog?.tags?.length ? this.blog?.tags : []],
        seo: this.formBuilder.group({
          metaTitle: [this.blog?.seo?.metaTitle || ''],
          metaDesription: [this.blog?.seo?.metaDesription || ''],
          metaKeywords: this.formBuilder.array(
            this.blog?.seo.metaKeywords?.length
              ? map(this.blog?.seo?.metaKeywords, (key) => {
                  return this.formBuilder.group({
                    name: key?.name,
                    content: key?.content,
                  });
                })
              : [],
          ),
        }),
        pictures: this.formBuilder.array(
          this.blog?.pictures?.length
            ? map(this.blog?.pictures, (picture) => {
                return this.formBuilder.group({
                  baseUrl: picture?.baseUrl,
                  path: picture?.path,
                  width: picture.width,
                  height: picture.height,
                  alt: picture.alt,
                });
              })
            : [],
        ),
        sectionData: this.formBuilder.array(
          this.blog?.sectionData?.length
            ? map(this.blog?.sectionData, (section) => {
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
        translation: this.formBuilder.group({
          language: [selectedTranslation?.language || translate],
          content: this.formBuilder.group({
            title: [selectedTranslation?.content?.title || ''],
            sectionData: this.formBuilder.array(
              this.blog?.translation?.length && selectedTranslation && selectedTranslation?.content?.sectionData?.length
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
      this.initialValues = this.blogForm.value;
      this.blogForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  openAltModal(j: number, field?: string, k?: number) {
    let input: any;
    const modalRef = this.modalService.open(AltPicturesComponent, { backdrop: 'static' });
    if (field === 'sectionData') {
      if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
        modalRef.componentInstance.picture = (
          (this.translation.get('content').get('sectionData') as FormArray).at(j).get('sectionPictures') as FormArray
        ).at(k).value;
      } else {
        modalRef.componentInstance.picture = this.sectionData.at(j).value.sectionPictures[j];
      }
    } else {
      modalRef.componentInstance.picture = this.pictures.value[j];
    }
    modalRef.result.then((result) => {
      if (result) {
        if (this.blog) {
          if (field === 'sectionData') {
            if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
              let translations = this.blog?.translation;
              let translation;
              ((this.translation.get('content').get('sectionData') as FormArray).at(j).get('sectionPictures') as FormArray)
                .at(k)
                .patchValue(result.picture);
              const index = findIndex(this.blog?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
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
          } else {
            this.pictures.at(j).patchValue(result.picture);
            input = {
              pictures: this.pictures.value,
            };
          }
          this.updatePicture(input);
        }
      }
    });
  }

  updatePicture(input: any) {
    this.blogService
      .updateBlog(this.blog?.id, input)
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

  createTranslationForm(): FormGroup {
    return this.formBuilder.group({
      language: [undefined],
      content: this.formBuilder.group({
        title: [''],
        sectionData: this.formBuilder.array([this.createSectionForm()]),
      }),
    });
  }

  createSectionForm(): FormGroup {
    return this.formBuilder.group({
      sectionContent: [''],
      sectionReference: [''],
      sectionTitle: [''],
      sectionPictures: this.formBuilder.array([]),
    });
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
    let translations = this.blog?.translation;
    if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
      const index = findIndex(this.blog?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
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
      ...FormHelper.getDifference(this.initialValues.seo, this.blogForm.value.seo),
    };
    const input: any = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'pictures', 'seo', 'sectionData', 'translation', 'tags'),
        omit(this.blogForm.value, 'pictures', 'seo', 'sectionData', 'translation', 'tags'),
      ),
      ...(keys(translation)?.length && this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
        ? { translation }
        : {}),
      ...(keys(seo)?.length ? { seo } : {}),
      ...(isEqual(
        (this.blog?.tags?.length ? cloneDeep(this.blog?.tags) : []).sort(),
        (this.blogForm.value?.tags?.length ? cloneDeep(this.blogForm.value?.tags) : []).sort(),
      )
        ? {}
        : { tags: this.blogForm.value.tags }),
      ...(isEqual(
        (this.blog?.tags?.length ? cloneDeep(this.blog?.tags) : []).sort(),
        (this.blogForm.value?.tags?.length ? cloneDeep(this.blogForm.value.tags) : []).sort(),
      )
        ? {}
        : { tags: this.blogForm.value.tags }),
      ...(isEqual(
        (this.initialValues.pictures?.length ? cloneDeep(this.initialValues.pictures) : []).sort(),
        (this.blogForm.value?.pictures?.length ? cloneDeep(this.blogForm.value.pictures) : []).sort(),
      )
        ? {}
        : { pictures: this.blogForm.value.pictures }),
      ...(isEqual(
        (this.initialValues.sectionData?.length ? cloneDeep(this.initialValues.sectionData) : []).sort(),
        (this.blogForm.value?.sectionData?.length ? cloneDeep(this.blogForm.value.sectionData) : []).sort(),
      )
        ? {}
        : { sectionData: this.blogForm.value.sectionData }),
    };
    if (this.blog) {
      this.blogService
        .updateBlog(this.blog?.id, input)
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
            this.exit();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.blogService
        .createBlog(input)
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
            this.exit();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  removePicture(i: number, j?: number): void {
    const pictureFormArray = this.pictures as FormArray;
    const fileName = pictureFormArray.at(i).value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        pictureFormArray.removeAt(i);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  newSection(): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.translation.get('content').get('sectionData') as FormArray).push(this.createSectionForm());
    } else {
      (this.blogForm.get('sectionData') as FormArray).push(this.createSectionForm());
    }
  }

  deleteSection(j?: number): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      (this.translation.get('content').get('sectionData') as FormArray).removeAt(j);
    } else {
      (this.blogForm.get('sectionData') as FormArray).removeAt(j);
    }
  }

  upload(field?: string, j?: number): void {
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
          if (field === 'sectionData') {
            if (this.translation?.value?.language?.name !== 'Default') {
              ((this.translation.get('content').get('sectionData') as FormArray).at(j).get('sectionPictures') as FormArray).push(
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
          } else {
            this.pictures.push(
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

  removeSectionPicture(j: number, k: number): void {
    if (this.translation?.value?.language?.name !== 'Default') {
      ((this.translation.get('content').get('sectionData') as FormArray).at(j).get('sectionPictures') as FormArray).removeAt(k);
    } else {
      const pictureFormArray = this.blogForm.get(['sectionData', j, 'sectionPictures']) as FormArray;
      pictureFormArray.removeAt(j);
    }
    this.changeDetectorRef.markForCheck();
  }

  publishBlog(blog: BlogType): void {
    this.blogService.publishBlog(blog?.id).subscribe((result: any) => {
      if (result.data) {
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  exit() {
    this.router.navigate(['/website/blog'], { relativeTo: this.activatedRoute });
  }

  ngOnDestroy(): void {
    this.blog = null;
    this.blogForm.reset();
    this.blogService.blog$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
