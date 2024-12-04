import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs/operators';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, combineLatest, takeUntil, throwError, map as rxMap } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { omit, values, map, pick, keys, isEqual, clone, cloneDeep, find, findIndex } from 'lodash';

import { IPagination } from '@diktup/frontend/models';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL, InternalProductWithStockType, ProductFlagEnum } from '@sifca-monorepo/terminal-generator';
import {
  TaxType,
  UserType,
  BrandType,
  LanguageType,
  ProductStatusEnum,
  ProductVarietyEnum,
  InternalProductType,
  ProductConditionEnum,
  ProductStructureEnum,
} from '@sifca-monorepo/terminal-generator';

import { ProductsService } from '../products.service';
import { BrandService } from '../../../brands/brands.service';
import { ICatalogueCategoryTreeType } from '../products.types';
import { SharedService } from '../../../../../shared/services/shared.service';
import { SettingsService } from '../../../../system/settings/settings.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AltPicturesComponent } from '../../../../../shared/components/alt-pictures/alt-pictures.component';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { DOCUMENT } from '@angular/common';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  signature: any;
  fullPath: string;
  languages: any[];
  initialValues: any;
  currentPageId: string;
  productForm: FormGroup;
  uploadingFiles: boolean;
  breadCrumbItems!: Array<{}>;
  flags = values(ProductFlagEnum);
  website: WebsiteIntegrationType;
  isButtonDisabled: boolean = true;
  statuses = values(ProductStatusEnum);
  product: InternalProductWithStockType;
  public files: NgxFileDropEntry[] = [];
  conditions = values(ProductConditionEnum);
  defaultLanguage: any = { name: 'Default', id: '1' };
  fields = ['name', 'status', 'condition', 'description'];
  brandSearchInput$: Subject<string> = new Subject<string>();
  pageId$: Observable<string> = this.inventoryService.pageId$;
  owners$: Observable<UserType[]> = this.productsService.owners$;
  allTaxes$: Observable<TaxType[]> = this.settingsService.allTaxes$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  brands$: Observable<BrandType[]> = this.brandService.infinteBrands$;
  parentLink$: Observable<string> = this.inventoryService.parentLink$;
  technicians$: Observable<UserType[]> = this.productsService.technicians$;
  website$: Observable<WebsiteIntegrationType> = this.websiteService.website$;
  product$: Observable<InternalProductWithStockType> = this.productsService.product$;
  ownersPagination$: Observable<IPagination> = this.productsService.ownersPagination$;
  categories$: Observable<ICatalogueCategoryTreeType[]> = this.productsService.categories$;
  techniciansPagination$: Observable<IPagination> = this.productsService.techniciansPagination$;

  get metaKeywords(): FormArray {
    return this.productForm.get(['seo', 'metaKeywords']) as FormArray;
  }

  get pictures(): FormArray {
    return this.productForm.get(['media', 'pictures']) as FormArray;
  }

  get translation() {
    return this.productForm.get('translation');
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
    private brandService: BrandService,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private amazonS3Helper: AmazonS3Helper,
    private activatedRoute: ActivatedRoute,
    private websiteService: WebsiteService,
    private productsService: ProductsService,
    private settingsService: SettingsService,
    private inventoryService: InventoryService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.fullPath = this.router.url;
    combineLatest([this.productsService.product$, this.websiteService.website$, this.inventoryService.pageId$])
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(([product, website, pageId]) => {
        this.website = website;
        this.languages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
        this.currentPageId = pageId;
        this.product = product;
        this.productForm = this.formBuilder.group({
          ...(pageId !== 'services'
            ? {
                seo: this.formBuilder.group({
                  urlKey: [product?.seo?.urlKey || ''],
                  metaTitle: [product?.seo?.metaTitle || ''],
                  metaDesription: [product?.seo?.metaDesription || ''],
                  metaKeywords: product?.seo?.metaKeywords?.length
                    ? this.formBuilder.array(
                        map(product.seo?.metaKeywords, (metaKeyword) => {
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
              }
            : {}),
          media: this.formBuilder.group({
            pictures: this.formBuilder.array(
              this.product?.media?.pictures?.length
                ? map(this.product?.media.pictures, (picture) => {
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
          }),
          status: [product?.status || ''],
          condition: [product?.condition || ''],
          description: [product?.description || ''],
          name: [product?.name || '', Validators.required],
          tags: [product?.tags?.length ? product?.tags : []],
          // suppliers: [product?.suppliers?.length ? map(product?.suppliers, 'id') : []],
          flags: [product?.flags || undefined],
          ...(pageId !== 'services' ? { sku: [product?.sku || ''] } : {}),
          ...(pageId !== 'services' ? { externalId: [product?.externalId || '', Validators.required] } : {}),
          ...(pageId !== 'services' ? { brand: [product?.brand || undefined, Validators.required] } : {}),
          ...(pageId !== 'equipments'
            ? {
                price: [product?.price || '', Validators.required],
                discount: this.formBuilder.group({
                  discountType: [product?.discount?.discountType || 'PERCENTAGE'],
                  amount: [product?.discount?.amount ? +product?.discount?.amount : ''],
                }),
              }
            : {}),
          // end product & service
          // only service
          ...(pageId === 'services' ? { barcode: [(product as any)?.barcode || '', Validators.required] } : {}),
          // only product
          ...(pageId === 'products'
            ? {
                catalogueCategory: [
                  product?.catalogueCategory?.length ? product?.catalogueCategory[product?.catalogueCategory.length - 1].id : '',
                  Validators.required,
                ],
                rent: [product?.rent === true || product?.rent === false ? product?.rent : undefined],
              }
            : {}),
          translation: this.formBuilder.group({
            language: [this.defaultLanguage],
            content: this.formBuilder.group({
              name: [''],
              description: [''],
              descriptionList: this.formBuilder.array(['']),
              specs: this.formBuilder.array([
                this.formBuilder.group({
                  key: [''],
                  value: [''],
                }),
              ]),
              // sectionData: this.formBuilder.array([this.createSectionForm()]),
            }),
          }),
          // equipment only
          // ...(pageId === 'equipments'
          //   ? {
          //       maintenance: this.formBuilder.group({
          //         owner: [product?.maintenance?.owner?.id || undefined],
          //         technician: [product?.maintenance?.technician?.id || undefined],
          //         expectedMeantime: [product?.maintenance?.expectedMeantime || 0],
          //         maintenanceDuration: [product?.maintenance?.maintenanceDuration || 0],
          //         prevMaintenanceDuration: [product?.maintenance?.prevMaintenanceDuration || 0],
          //       }),
          //     }
          //   : {}),
        });
        this.initialValues = this.productForm.value;
        this.productForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((newValues) => {
          if (product) {
            // const seo = {
            //   ...FormHelper.getDifference(omit(this.product.seo, 'metaKeywords'), omit(newValues.seo, 'metaKeywords')),
            //   ...(isEqual(
            //     (newValues.seo?.metaKeywords?.length ? cloneDeep(newValues.seo?.metaKeywords) : []).sort(),
            //     (this.product?.seo?.metaKeywords?.length ? cloneDeep(this.product.seo?.metaKeywords) : []).sort(),
            //   )
            //     ? {}
            //     : { metaKeywords: newValues.seo?.metaKeywords }),
            // };
            this.isButtonDisabled = isEqual(newValues, this.initialValues) || this.productForm.invalid;
            // this.isButtonDisabled =
            //   this.productForm.invalid ||
            //   !keys({
            //     ...(this.currentPageId !== 'services' && keys(seo).length ? { seo } : {}),
            //     ...(this.currentPageId !== 'services' && product?.brand?.id !== newValues?.brand ? { brand: newValues?.brand } : {}),
            //     ...(this.currentPageId !== 'equipments' && +product?.price !== +newValues?.price ? { price: `${newValues?.price}` } : {}),
            //     ...FormHelper.getDifference(pick(product, this.fields), pick(newValues, this.fields)),
            //     ...(pageId !== 'services' ? { sku: this.product?.sku } : {}),
            //     ...(pageId !== 'services' ? { externalId: this.product?.externalId } : {}),
            //     // ...(this.pageId === 'equipments' || isEqual(map(product?.taxes, 'tax.id').sort(), cloneDeep(newValues?.taxes).sort())
            //     //   ? {}
            //     //   : { taxes: newValues?.taxes }),
            //     ...(this.currentPageId === 'products' &&
            //     product?.catalogueCategory[product?.catalogueCategory.length - 1].id !== newValues.catalogueCategory
            //       ? { catalogueCategory: newValues?.catalogueCategory }
            //       : {}),
            //     ...(this.currentPageId === 'products' && this.product?.rent !== this.productForm.value?.rent
            //       ? { rent: this.productForm.value?.rent }
            //       : {}),
            //     ...(isEqual(clone(product?.tags || []).sort(), clone(newValues?.tags).sort()) ? {} : { tags: newValues?.tags }),
            //     ...(this.currentPageId !== 'equipments' &&
            //     (product?.discount?.discountType !== newValues?.discount?.discountType ||
            //       +product?.discount?.amount !== +newValues?.discount?.amount)
            //       ? { discount: newValues?.discount }
            //       : {}),
            //     // ...(this.pageId === 'equipments' &&
            //     // (this.product?.maintenance?.owner?.id !== this.productForm.value?.maintenance?.owner ||
            //     //   this.product?.maintenance?.technician?.id !== this.productForm.value?.maintenance?.technician ||
            //     //   this.product?.maintenance?.expectedMeantime !== this.productForm.value?.maintenance?.expectedMeantime ||
            //     //   this.product?.maintenance?.maintenanceDuration !== this.productForm.value?.maintenance?.maintenanceDuration ||
            //     //   this.product?.maintenance?.prevMaintenanceDuration !== this.productForm.value?.maintenance?.prevMaintenanceDuration)
            //     //   ? {
            //     //       maintenance: {
            //     //         ...(this.product?.maintenance?.owner?.id !== this.productForm.value?.maintenance?.owner
            //     //           ? { owner: this.productForm.value?.maintenance?.owner }
            //     //           : {}),
            //     //         ...(this.product?.maintenance?.technician?.id !== this.productForm.value?.maintenance?.technician
            //     //           ? { technician: this.productForm.value?.maintenance?.technician }
            //     //           : {}),
            //     //         ...(this.product?.maintenance?.expectedMeantime !== this.productForm.value?.maintenance?.expectedMeantime
            //     //           ? { expectedMeantime: this.productForm.value?.maintenance?.expectedMeantime }
            //     //           : {}),
            //     //         ...(this.product?.maintenance?.maintenanceDuration !== this.productForm.value?.maintenance?.maintenanceDuration
            //     //           ? { maintenanceDuration: this.productForm.value?.maintenance?.maintenanceDuration }
            //     //           : {}),
            //     //         ...(this.product?.maintenance?.prevMaintenanceDuration !==
            //     //         this.productForm.value?.maintenance?.prevMaintenanceDuration
            //     //           ? { prevMaintenanceDuration: this.productForm.value?.maintenance?.prevMaintenanceDuration }
            //     //           : {}),
            //     //       },
            //     //     }
            //     //   : {}),
            //   }).length;
          } else {
            this.isButtonDisabled = this.productForm.invalid;
          }
        });
      });
  }

  ngOnInit(): void {
    combineLatest([this.translate.get('MENUITEMS.TS.INVENTORY'), this.translate.get('MENUITEMS.TS.ADD_EQUIPEMENT')])
      .pipe(
        rxMap(([inventory, addEquipement]) => {
          this.breadCrumbItems = [{ label: inventory }, { label: addEquipement, active: true }];
        }),
      )
      .subscribe();
    this.brandSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.brandService.pageIndex = 0;
          this.brandService.searchString = searchString;
          return this.brandService.searchBrand();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  loadMoreBrands() {
    this.brandService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.brandService.pageIndex++;
        this.brandService.searchBrand().subscribe();
      }
    });
  }

  newSpecs(): void {
    (this.translation.get(['content', 'specs']) as FormArray).push(
      this.formBuilder.group({
        key: [''],
        value: [''],
      }),
    );
  }

  deleteSpecs(j?: number): void {
    (this.translation.get(['content', 'specs']) as FormArray).removeAt(j);
  }

  removeDescriptionField(j: number): void {
    (this.translation.get(['content', 'descriptionList']) as FormArray).removeAt(j);
  }

  addDescriptionListField(): void {
    (this.translation.get(['content', 'descriptionList']) as FormArray).push(new FormControl(''));
    this.changeDetectorRef.markForCheck();
  }

  onChangeLanguage(translate: LanguageType) {
    const selectedTranslation = this.product?.translation?.length
      ? find(this.product?.translation, (trs) => trs?.language.id === translate?.id)
      : null;
    if (translate) {
      this.productForm.get('translation').patchValue({
        language: selectedTranslation?.language || translate,
        content: {
          name: selectedTranslation?.content?.name || '',
          description: selectedTranslation?.content?.description || '',
          descriptionList: selectedTranslation?.content?.descriptionList?.length ? selectedTranslation?.content?.descriptionList : [],
          specs:
            this.product?.translation?.length && selectedTranslation && selectedTranslation?.content?.specs?.length
              ? map(selectedTranslation.content?.specs, (spec) => {
                  return {
                    key: spec?.key,
                    value: spec?.value,
                  };
                })
              : [],
        },
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  openAltMoadal(index: number) {
    const modalRef = this.modalService.open(AltPicturesComponent, { backdrop: 'static' });
    modalRef.componentInstance.picture = this.pictures.value[index];
    modalRef.result.then((result) => {
      if (result) {
        this.pictures.at(index).patchValue(result.picture);
        if (this.product) {
          this.productsService
            .updateSimpleProduct({ id: this.product.id, media: this.productForm.get('media').value })
            .pipe(
              catchError((error) => {
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return throwError(() => new Error(error));
              }),
            )
            .subscribe(() => {
              this.position();
              this.parentLink$
                .pipe(
                  take(1),
                  rxMap((parentLink) => {
                    this.router.navigate([parentLink], { relativeTo: this.activatedRoute });
                  }),
                )
                .subscribe();
              // this.router.navigate(['/inventory/products/products'], { relativeTo: this.activatedRoute });
              this.changeDetectorRef.markForCheck();
            });
        }
      }
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

  removePicture(index: number) {
    const fileName = this.pictures.at(0).value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        let request: Observable<InternalProductType>;
        this.pictures.removeAt(index);
        const input = {
          media: { pictures: [{ baseUrl: '', path: '' }] },
        };
        if (this.product) {
          request =
            this.currentPageId === 'services'
              ? this.productsService.updateSimpleService({ id: this.product.id, input })
              : this.productsService.updateSimpleProduct({ id: this.product.id, input });
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  // TODO: to delete
  addedFile(file: any) {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (file?.size > 2000000) {
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
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        if (!this.uploadingFiles) {
          this.uploadingFiles = true;
        }
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
            if (this.product) {
              this.productsService
                .updateSimpleProduct({ id: this.product.id, media: this.productForm.get('media').value })
                .pipe(
                  catchError((error) => {
                    this.modalError();
                    this.changeDetectorRef.markForCheck();
                    return throwError(() => new Error(error));
                  }),
                )
                .subscribe(() => {
                  this.position();
                  this.parentLink$
                    .pipe(
                      take(1),
                      rxMap((parentLink) => {
                        this.router.navigate([parentLink], { relativeTo: this.activatedRoute });
                      }),
                    )
                    .subscribe();
                  // this.router.navigate(['/inventory/products/products'], { relativeTo: this.activatedRoute });
                  this.changeDetectorRef.markForCheck();
                });
            }
            this.uploadingFiles = false;
            this.changeDetectorRef.markForCheck();
          });
      };
    };
    fileInput.click();
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  public fileOver(event) {
  }

  public fileLeave(event) {
  }

  loadMoreOwners() {
    this.productsService.isOwnersLastPage$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.productsService.ownersPageIndex += 1;
        this.productsService.getOwners().subscribe();
      }
    });
  }

  loadMoreTechnicians() {
    this.productsService.isTechniciansLastPage$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.productsService.techniciansPageIndex += 1;
        this.productsService.getTechnicians().subscribe();
      }
    });
  }

  save() {
    let translation;
    let translations = this.product?.translation;
    if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
      const index = findIndex(this.product?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
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
    this.isButtonDisabled = true;
    let request: Observable<InternalProductType>;
    const seo = {
      ...FormHelper.getNonEmptyValues(omit(this.productForm.value.seo, 'metaKeywords')),
      ...(isEqual(
        (this.productForm.value.seo?.metaKeywords?.length ? cloneDeep(this.productForm.value.seo?.metaKeywords) : []).sort(),
        (this.product?.seo?.metaKeywords?.length ? cloneDeep(this.product.seo?.metaKeywords) : []).sort(),
      )
        ? {}
        : { metaKeywords: this.productForm.value.seo?.metaKeywords }),
    };
    if (this.product) {
      const data = {
        ...(isEqual(clone(this.product?.tags || []).sort(), clone(this.productForm.value?.tags).sort())
          ? {}
          : { tags: this.productForm.value?.tags }),
        ...(this.currentPageId !== 'services' && keys(seo).length ? { seo } : {}),
        ...(this.currentPageId !== 'services' && this.product?.brand?.id !== this.productForm.value?.brand
          ? { brand: this.productForm.value?.brand?.id }
          : {}),
        ...(this.currentPageId !== 'equipments' && +this.product?.price !== +this.productForm.value?.price
          ? { price: `${this.productForm.value?.price}` }
          : {}),
        ...(this.currentPageId !== 'services' && this.product?.sku !== this.productForm.value?.sku ? { sku: this.productForm.value?.sku } : {}),
        ...(this.currentPageId !== 'services' && this.product?.externalId !== this.productForm.value?.externalId
          ? { externalId: this.productForm.value?.externalId }
          : {}),
        ...(keys(translation)?.length && this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
          ? { translation }
          : {}),
        ...FormHelper.getDifference(pick(this.product, this.fields), pick(this.productForm.value, this.fields)),
        // ...(this.pageId === 'equipments' ||
        // isEqual(map(this.product?.taxes, 'tax.id').sort(), cloneDeep(this.productForm.value?.taxes).sort())
        //   ? {}
        //   : { taxes: map(this.productForm.value.taxes, (tax, rank) => ({ tax, rank })) }),
        // ...(this.pageId === 'equipments' &&
        // (this.product?.maintenance?.owner?.id !== this.productForm.value?.maintenance?.owner ||
        //   this.product?.maintenance?.technician?.id !== this.productForm.value?.maintenance?.technician ||
        //   this.product?.maintenance?.expectedMeantime !== this.productForm.value?.maintenance?.expectedMeantime ||
        //   this.product?.maintenance?.maintenanceDuration !== this.productForm.value?.maintenance?.maintenanceDuration ||
        //   this.product?.maintenance?.prevMaintenanceDuration !== this.productForm.value?.maintenance?.prevMaintenanceDuration)
        //   ? {
        //       maintenance: {
        //         ...(this.product?.maintenance?.owner?.id !== this.productForm.value?.maintenance?.owner
        //           ? { owner: this.productForm.value?.maintenance?.owner }
        //           : {}),
        //         ...(this.product?.maintenance?.technician?.id !== this.productForm.value?.maintenance?.technician
        //           ? { technician: this.productForm.value?.maintenance?.technician }
        //           : {}),
        //         ...(this.product?.maintenance?.expectedMeantime !== this.productForm.value?.maintenance?.expectedMeantime
        //           ? { expectedMeantime: this.productForm.value?.maintenance?.expectedMeantime }
        //           : {}),
        //         ...(this.product?.maintenance?.maintenanceDuration !== this.productForm.value?.maintenance?.maintenanceDuration
        //           ? { maintenanceDuration: this.productForm.value?.maintenance?.maintenanceDuration }
        //           : {}),
        //         ...(this.product?.maintenance?.prevMaintenanceDuration !== this.productForm.value?.maintenance?.prevMaintenanceDuration
        //           ? { prevMaintenanceDuration: this.productForm.value?.maintenance?.prevMaintenanceDuration }
        //           : {}),
        //       },
        //     }
        //   : {}),
        ...(this.currentPageId === 'products' &&
        this.product?.catalogueCategory[this.product?.catalogueCategory.length - 1].id !== this.productForm.value.catalogueCategory
          ? { catalogueCategory: this.productForm.value?.catalogueCategory }
          : {}),
        ...(this.currentPageId === 'products' && this.initialValues?.rent !== this.productForm.value?.rent
          ? { rent: this.productForm.value?.rent }
          : {}),
        ...(this.initialValues?.flags !== this.productForm.value?.flags ? { flags: this.productForm.value?.flags } : {}),
        ...(isEqual(map(this.product?.media?.pictures, 'path').sort(), map(this.productForm.value?.media?.pictures, 'path').sort())
          ? {}
          : { media: this.productForm.value?.media }),
        ...(this.currentPageId !== 'equipments' &&
        +this.productForm.value?.discount?.amount > 0 &&
        this.productForm.value?.discount?.amount !== '' &&
        (this.product?.discount?.discountType !== this.productForm.value?.discount?.discountType ||
          +this.product?.discount?.amount !== +this.productForm.value?.discount?.amount)
          ? { discount: this.productForm.value?.discount }
          : {}),
      };
      request =
        this.currentPageId === 'services'
          ? this.productsService.updateSimpleService({ id: this.product.id, ...data })
          : this.productsService.updateSimpleProduct({ id: this.product.id, ...data });
    } else {
      const data = {
        ...(this.currentPageId !== 'services'
          ? {
              structure: ProductStructureEnum.STOCKABLE,
              variety: this.currentPageId === 'equipments' ? ProductVarietyEnum.EQUIPMENT : ProductVarietyEnum.PRODUCT,
            }
          : {}),
        ...(isEqual(clone(this.product?.tags || []).sort(), clone(this.productForm.value?.tags).sort())
          ? {}
          : { tags: this.productForm.value?.tags }),
        ...(this.currentPageId !== 'equipments' && this.productForm.value?.price ? { price: `${this.productForm.value.price}` } : {}),
        ...(this.currentPageId === 'products' && this.productForm.value?.catalogueCategory
          ? { catalogueCategory: this.productForm.value.catalogueCategory }
          : {}),
        ...(this.productForm.value?.flags ? { flags: this.productForm.value.flags } : {}),
        ...(this.currentPageId === 'products' && (this.productForm.value?.rent === true || this.productForm.value?.rent === false)
          ? { rent: this.productForm.value.rent }
          : {}),
        ...(this.currentPageId !== 'services' && keys(seo).length ? { seo } : {}),
        ...(this.currentPageId !== 'services' && this.productForm.value?.brand ? { brand: this.productForm.value.brand?.id } : {}),
        ...(this.productForm.value?.media?.pictures?.length ? { media: this.productForm.value.media } : {}),
        ...(this.currentPageId !== 'services' ? { sku: this.productForm.value?.sku } : {}),
        ...(this.currentPageId !== 'services' ? { externalId: this.productForm.value?.externalId } : {}),
        ...FormHelper.getNonEmptyValues(pick(this.productForm.value, this.fields)),
        ...(this.currentPageId !== 'equipments' && this.productForm.value?.taxes?.length
          ? { taxes: map(this.productForm.value.taxes, (tax, rank) => ({ tax, rank })) }
          : {}),
        ...(this.currentPageId !== 'equipments' && this.productForm.value?.discount?.amount >= 0 && this.productForm.value?.discount?.amount !== ''
          ? {
              discount: {
                amount: `${this.productForm.value.discount?.amount}`,
                discountType: this.productForm.value.discount?.discountType,
              },
            }
          : {}),
        // ...(this.pageId === 'equipments' &&
        // (this.productForm.value?.maintenance?.owner ||
        //   this.productForm.value?.maintenance?.technician ||
        //   this.productForm.value?.maintenance?.expectedMeantime ||
        //   this.productForm.value?.maintenance?.maintenanceDuration ||
        //   this.productForm.value?.maintenance?.prevMaintenanceDuration)
        //   ? {
        //       maintenance: {
        //         ...(this.productForm.value?.maintenance?.owner ? { owner: this.productForm.value?.maintenance?.owner } : {}),
        //         ...(this.productForm.value?.maintenance?.technician ? { technician: this.productForm.value?.maintenance?.technician } : {}),
        //         ...(this.productForm.value?.maintenance?.expectedMeantime
        //           ? { expectedMeantime: this.productForm.value?.maintenance?.expectedMeantime }
        //           : {}),
        //         ...(this.productForm.value?.maintenance?.maintenanceDuration
        //           ? { maintenanceDuration: this.productForm.value?.maintenance?.maintenanceDuration }
        //           : {}),
        //         ...(this.productForm.value?.maintenance?.prevMaintenanceDuration
        //           ? { prevMaintenanceDuration: this.productForm.value?.maintenance?.prevMaintenanceDuration }
        //           : {}),
        //       },
        //     }
        //   : {}),
      };
      request = this.currentPageId === 'services' ? this.productsService.createService(data) : this.productsService.createProduct(data);
    }
    combineLatest([request, this.inventoryService.parentLink$])
      .pipe(take(1))
      .subscribe(([response, parentLink]) => {
        this.position();
        this.parentLink$
          .pipe(
            take(1),
            rxMap((parentLink) => {
              this.router.navigate([parentLink], { relativeTo: this.activatedRoute });
            }),
          )
          .subscribe();
        this.productsService.resetProduct();
      });
  }

  exit() {
    this.parentLink$
      .pipe(
        take(1),
        rxMap((parentLink) => {
          this.router.navigate([parentLink], { relativeTo: this.activatedRoute });
        }),
      )
      .subscribe();
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
  ngOnDestroy() {
    this.productForm.reset();
    // this.productsService.product$ = null;
  }
}
