import Swal from 'sweetalert2';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DndDropEvent } from 'ngx-drag-drop';
import { cloneDeep, find, findIndex, isEqual, keys, map, omit } from 'lodash';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { catchError, Observable, of, ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ChangeDetectorRef, TemplateRef, Inject, PLATFORM_ID } from '@angular/core';

import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL, WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { CatalogueCategoryType, LanguageType, ProductVarietyEnum, UserType } from '@sifca-monorepo/terminal-generator';

import { CategoriesService } from '../categories.service';
import { ICatalogueCategoryTreeType } from '../categories.types';
import { SharedService } from '../../../../../shared/services/shared.service';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { AltPicturesComponent } from '../../../../../shared/components/alt-pictures/alt-pictures.component';
import { SheetsNames } from '@sifca-monorepo/terminal-generator';
import { ProductsService } from '../../products/products.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../../core/services/user.service';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  selector: 'sifca-monorepo-categories-list',
})
export class CategoriesListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInput = this.document.createElement('input');
  private fileInputExcel = this.document.createElement('input');

  term: any;
  todoDatas: any;
  ListJsDatas: any;
  languages: any[];
  submitted = false;
  sifcaAdmin = false;
  initialValues: any;
  todoForm!: FormGroup;
  selectedType: string;
  emailForm: FormGroup;
  skoteCollapsed = true;
  selectForm: FormGroup;
  selectedLayer: number;
  loadingImport: boolean;
  projectCollapsed = true;
  categoryForm: FormGroup;
  projectForm!: FormGroup;
  isButtonDisabled = true;
  ecommerceCollapsed = true;
  subCategoryForm: FormGroup;
  isSubButtonDisabled = true;
  isEmailButtonDisabled = true;
  loadingImportPictures: boolean;
  website: WebsiteIntegrationType;
  projectList!: CatalogueCategoryType[];
  selectedCategory: ICatalogueCategoryTreeType;
  selectedSubCategory: ICatalogueCategoryTreeType;
  defaultLanguage: any = { name: 'Default', id: '1' };
  dataSource: MatTableDataSource<ICatalogueCategoryTreeType>;
  pageId$: Observable<string> = this.inventoryService.pageId$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  pageTitle$: Observable<string> = this.inventoryService.pageTitle$;
  loadingCategories$: Observable<boolean> = this.categoriesService.loadingCategories$;
  categories$: Observable<ICatalogueCategoryTreeType[]> = this.categoriesService.categories$;

  get translation() {
    return this.categoryForm.get('translation');
  }
  get pictures(): FormArray {
    return this.categoryForm.get('pictures') as FormArray;
  }

  get metaKeywords(): FormArray {
    return this.categoryForm.get(['seo', 'metaKeywords']) as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private websiteService: WebsiteService,
    private offcanvasService: NgbOffcanvas,
    private amazonS3Helper: AmazonS3Helper,
    private convertorHelper: ConvertorHelper,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    public categoriesService: CategoriesService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.fileInput.type = 'file';
    this.fileInput.name = 'file';
    this.fileInput.multiple = true;
    this.fileInput.style.display = 'none';
    this.fileInputExcel.type = 'file';
    this.fileInputExcel.name = 'file';
    this.fileInputExcel.multiple = true;
    this.fileInputExcel.style.display = 'none';
    this.fileInputExcel.addEventListener('change', () => {
      if (this.fileInputExcel.files.length) {
        this.convertFile(this.fileInputExcel.files[0]).subscribe((base64) => {
          this.loadingImport = true;
          this.productsService
            .importSimpleFullCorporateCatalogueByExcel(base64)
            .pipe(
              catchError((error) => {
                this.loadingImport = false;
                this.modalService.dismissAll();
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe(() => {
              this.modalService.dismissAll();
              this.position();
              this.loadingImport = false;
              this.changeDetectorRef.markForCheck();
            });
        });
      }
    });
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files.length) {
        this.loadingImportPictures = true;
        this.productsService.uploadFiles(this.fileInput.files).then((res) => {
          this.modalService.dismissAll();
          this.position();
          this.loadingImportPictures = false;
        });
      }
    });
    this.websiteService.website$.pipe(takeUntil(this.unsubscribeAll)).subscribe((website: WebsiteIntegrationType) => {
      this.website = website;
      this.languages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
      this.changeDetectorRef.markForCheck();
    });
  }

  sectionDropped(event: CdkDragDrop<any[]>): void {
    this.categories$.pipe(take(1)).subscribe((categories) => {
      const item = categories[event.previousIndex];
      let rank = event.currentIndex === 0 ? 1 : categories[event.currentIndex].rank;
      moveItemInArray(categories, event.previousIndex, event.currentIndex);
      this.categoriesService
        .reorderCatalogueCategories(item.id, rank)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    });
  }
  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  send() {
    this.pageId$.pipe(take(1)).subscribe((pageTitle) => {
      const input: any = {
        emails: this.emailForm.get('emails').value,
        ...(pageTitle === 'products'
          ? {
              sheets: [SheetsNames?.CATEGORIES],
              variety: ProductVarietyEnum.PRODUCT,
            }
          : {}),
        ...(pageTitle === 'equipments'
          ? {
              sheets: [SheetsNames?.CATEGORIES],
              variety: ProductVarietyEnum.EQUIPMENT,
            }
          : {}),
      };
      this.isEmailButtonDisabled = true;
      this.productsService
        .sendSimpleCatalogueByMail(input)
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
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    });
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: UserType) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  uploadExcel(): void {
    this.loadingImport = false;
    this.fileInputExcel.value = '';
    this.fileInputExcel.click();
  }

  bulkUploadPicture() {
    this.fileInput.value = '';
    this.fileInput.click();
  }

  openImportModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  downloadExcel() {
    if (isPlatformBrowser(this.platformId)) {
      this.pageId$.pipe(take(1)).subscribe((pageId) => {
        const input: any = {
          ...(pageId === 'services'
            ? {
                sheets: [SheetsNames?.CATEGORIES],
                variety: ProductVarietyEnum.SERVICE,
              }
            : {}),
          ...(pageId === 'products'
            ? {
                sheets: [SheetsNames?.CATEGORIES],
                variety: ProductVarietyEnum.PRODUCT,
              }
            : {}),
          ...(pageId === 'equipments'
            ? {
                sheets: [SheetsNames?.CATEGORIES],
                variety: ProductVarietyEnum.EQUIPMENT,
              }
            : {}),
        };
        this.productsService.getSimpleCatalogueByExcel(input).subscribe((res) => {
          const blob = this.convertorHelper.b64toBlob(res, 'application/vnd.openxmlformats-officethis.document.spreadsheetml.sheet');
          const a = this.document.createElement('a');
          this.document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = String('suppliers.xlsx');
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          this.changeDetectorRef.markForCheck();
        });
      });
    }
  }

  onChangeLanguage(translate: LanguageType) {
    const selectedTranslation = find(this.selectedCategory?.translation, (trs) => trs?.language.id === translate?.id);
    if (translate) {
      this.categoryForm.get('translation').patchValue({
        language: selectedTranslation?.language || translate,
        content: {
          name: selectedTranslation?.content?.name || '',
          description: selectedTranslation?.content?.description || '',
        },
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  openAltMoadal(i: number) {
    const modalRef = this.modalService.open(AltPicturesComponent, { backdrop: 'static' });
    modalRef.componentInstance.picture = this.pictures.value[i];
    modalRef.result.then((result) => {
      if (result) {
        this.pictures.at(i).patchValue(result.picture);
        if (this.selectedCategory) {
          this.updatePicture();
        }
      }
    });
  }

  updatePicture() {
    this.categoriesService
      .updateCatalogueCategory({ id: this.selectedCategory.id, pictures: this.pictures.value, icon: '' })
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.position();
        this.offcanvasService.dismiss();
        this.changeDetectorRef.markForCheck();
      });
  }

  save() {
    let translation;
    let translations = this.selectedCategory?.translation;
    if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
      const index = findIndex(this.selectedCategory?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
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

    if (this.categoryForm.invalid) {
      return;
    }
    this.isButtonDisabled = true;
    const seo = {
      ...(isEqual(
        (this.initialValues?.seo?.metaKeywords?.length ? cloneDeep(this.initialValues?.seo?.metaKeywords) : []).sort(),
        (this.categoryForm.value?.seo?.metaKeywords?.length ? cloneDeep(this.categoryForm.value?.seo?.metaKeywords) : []).sort(),
      )
        ? {}
        : { metaKeywords: this.categoryForm.value.seo?.metaKeywords }),
      ...FormHelper.getDifference(omit(this.initialValues?.seo, 'metaKeywords'), omit(this.categoryForm.value?.seo, 'metaKeywords')),
    };
    if (this.selectedCategory?.id) {
      const input = {
        id: this.selectedCategory.id,
        ...FormHelper.getDifference(
          omit(this.selectedCategory, 'pictures', 'translation', 'icon', 'seo'),
          omit(this.categoryForm.value, 'pictures', 'translation', 'icon', 'seo'),
        ),
        ...(keys(seo)?.length ? { seo } : {}),
        ...(this.selectedType === 'icon' && this.categoryForm.get('icon').value !== this.initialValues.icon
          ? {
              icon: this.categoryForm.get('icon').value,
              pictures: [],
            }
          : {}),
        ...(keys(translation)?.length && this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
          ? { translation }
          : {}),
        // ...(this.translation?.get('language').value?.name !== 'Default' ? { translation } : {}),
      };
      this.categoriesService
        .updateCatalogueCategory(input, this.selectedLayer)
        .pipe(
          catchError(() => {
            this.offcanvasService.dismiss();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.offcanvasService.dismiss();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      const input = {
        ...(keys(seo)?.length ? { seo } : {}),
        ...FormHelper.getNonEmptyValues(omit(this.categoryForm.value, 'seo', 'translation')),
        layer: 1,
        ...(keys(translation)?.length && this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
          ? { translation }
          : {}),
      };
      this.categoriesService
        .createCatalogueCategory(input)
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
            this.offcanvasService.dismiss();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
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
          this.pictures.push(
            this.formBuilder.group({
              path: picture.path,
              baseUrl: picture.baseUrl,
            }),
          );
          if (this.selectedCategory) {
            this.updatePicture();
          }
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
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

  removePicture(i: number): void {
    const fileName = this.pictures.at(i).value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        const pictureFormArray = this.pictures as FormArray;
        pictureFormArray.removeAt(i);
        if (this.selectedCategory) {
          this.updatePicture();
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  openSubCategoryModal(subCatModal: NgbModal, subCategory: ICatalogueCategoryTreeType) {
    this.selectedSubCategory = subCategory;
    this.isButtonDisabled = true;
    this.modalService.open(subCatModal, {
      centered: true,
      backdrop: 'static',
    });
    this.subCategoryForm = this.formBuilder.group({
      description: [''],
      name: ['', Validators.required],
      externalId: ['', Validators.required],
    });
    this.subCategoryForm.valueChanges.subscribe(() => {
      this.isSubButtonDisabled = false;
    });
  }

  saveSubCategory() {
    const input = {
      parent: this.selectedCategory.id,
      layer: this.selectedCategory.layer + 1,
      ...this.subCategoryForm.value,
    };
    this.categoriesService
      .createCatalogueCategory(input)
      .pipe(
        catchError(() => {
          this.offcanvasService.dismiss();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.offcanvasService.dismiss();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  categorySideMenu(content: TemplateRef<any>, category: ICatalogueCategoryTreeType, layer?: number) {
    this.selectedType = category?.pictures?.length && category?.pictures[0]?.baseUrl !== '' ? 'picture' : 'icon';
    this.selectedLayer = layer;
    this.selectedCategory = category;
    this.offcanvasService.open(content, { position: 'end', panelClass: 'overflow-auto h-auto' });
    this.categoryForm = this.formBuilder.group({
      pictures: this.formBuilder.array(
        category?.pictures?.length
          ? map(category?.pictures, (picture) => {
              return this.formBuilder.group({
                baseUrl: [picture?.baseUrl || ''],
                path: [picture?.path || ''],
                alt: [picture?.alt || ''],
                width: [picture?.width],
                height: [picture?.height],
              });
            })
          : [],
      ),
      description: [category?.description || ''],
      name: category?.name ? [category?.name] : ['', Validators.required],
      icon: [category?.icon, ''],
      externalId: [category?.externalId, Validators.required],
      seo: this.formBuilder.group({
        urlKey: [category?.seo?.urlKey || '', Validators.required],
        metaTitle: [category?.seo?.metaTitle || ''],
        metaDesription: [category?.seo?.metaDesription || ''],
        metaKeywords: category?.seo?.metaKeywords?.length
          ? this.formBuilder.array(
              map(category?.seo?.metaKeywords, (metaKeyword) => {
                return this.formBuilder.group({
                  name: [metaKeyword?.name || ''],
                  content: [metaKeyword?.content || ''],
                });
              }),
            )
          : this.formBuilder.array([
              this.formBuilder.group({
                name: [''],
                content: [''],
              }),
            ]),
      }),
      translation: this.formBuilder.group({
        language: [this.defaultLanguage],
        content: this.formBuilder.group({
          name: [''],
          description: [''],
        }),
      }),
    });
    this.initialValues = this.categoryForm.value;
    this.categoryForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.initialValues);
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

  openDeleteModal(deleteModal: NgbModal, category: ICatalogueCategoryTreeType) {
    this.selectedCategory = category;
    this.modalService.open(deleteModal, { centered: true });
  }

  deleteCategory() {
    this.categoriesService
      .deleteCatalogueCategory(this.selectedCategory.id)
      .pipe(
        catchError((error) => {
          this.modalError(error.graphQLErrors[0].extensions.exception.response.error);
          return of(null);
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.offcanvasService.dismiss();
        this.changeDetectorRef.markForCheck();
      });
  }

  modalError(text: string = 'Something went wrong!') {
    Swal.fire({
      title: 'Oops...',
      text,
      icon: 'warning',
      showCancelButton: false,
      confirmButtonColor: 'rgb(3, 142, 220)',
      cancelButtonColor: 'rgb(243, 78, 78)',
    });
  }

  onDragged(item: any, list: any[]) {
    const index = list.indexOf(item);
    list.splice(index, 1);
  }

  onDrop(event: DndDropEvent, filteredList?: any[], targetStatus?: string) {
    if (filteredList && event.dropEffect === 'move') {
      let index = event.index;
      if (typeof index === 'undefined') {
        index = filteredList.length;
      }
      filteredList.splice(index, 0, event.data);
    }
  }

  loadSubCategories(category: ICatalogueCategoryTreeType): void {
    if (category?.children?.length) {
      this.deleteChildren(category);
    } else {
      this.getCatalogueCategoriesByLayerAndParent(category.layer + 1, category.id);
    }
  }

  getCatalogueCategoriesByLayerAndParent(layer: number, parent?: string) {
    this.categoriesService.getCategories(layer, parent, false, false).subscribe();
  }

  deleteChildren(category: ICatalogueCategoryTreeType): void {
    this.categoriesService.deleteSubCategories(category);
  }
}
