import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { take, Subject, takeUntil, catchError, throwError, combineLatest } from 'rxjs';
import { Observable, debounceTime, distinctUntilChanged, of, map as rxMap, switchMap } from 'rxjs';
import { cloneDeep, find, findIndex, forEach, includes, isEqual, keys, map, omit, values, without } from 'lodash';

import { BarcodeService } from '../articles.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import {
  CompanyType,
  DiscountType,
  AttributeType,
  ProductStatusEnum,
  AttributeValueType,
  InternalProductType,
  BarcodeWithStockType,
  ProductConditionEnum,
  LanguageType,
  UserType,
} from '@sifca-monorepo/terminal-generator';
import { FormHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../../shared/services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../products/products.service';
import { NgbPanel, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { SupplierService } from '../../../../purchases/suppliers/suppliers.service';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./add-article.component.scss'],
  templateUrl: './add-article.component.html',
  selector: 'sifca-monorepo-add-article',
})
export class AddArticleComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChildren(NgbPanel) panels: QueryList<NgbPanel>;

  fullPath: string;
  languages: any[];
  initialValues: any;
  barcodeForm: FormGroup;
  isButtonDisabled = true;
  openPanels: string[] = [];
  breadCrumbItems!: Array<{}>;
  attributes: AttributeType[];
  barcode: BarcodeWithStockType;
  selectedAttributeValue: string;
  website: WebsiteIntegrationType;
  selectedAttribute: AttributeType;
  statuses = values(ProductStatusEnum);
  discountTypes = values(DiscountType);
  selectedAttributeNames: string[] = [];
  attributeValues: AttributeValueType[];
  selectedAttributeValues: string[] = [];
  conditions = values(ProductConditionEnum);
  defaultLanguage: any = { name: 'Default', id: '1' };
  pageId$: Observable<string> = this.inventoryService.pageId$;
  supplierSearchInput$: Subject<string> = new Subject<string>();
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  suppliers$: Observable<CompanyType[]> = this.suppliersService.suppliers$;
  products$: Observable<InternalProductType[]> = this.barcodeService.products$;
  isLastAttributeValues$: Observable<boolean> = this.barcodeService.isLastAttributeValues$;
  suppliersSearchString$: Observable<string> = this.suppliersService.suppliersSearchString$;
  infiniteProducts$: Observable<InternalProductType[]> = this.productsService.infiniteProducts$;
  owners$: Observable<UserType[]> = this.productsService.owners$;
  parentLink$: Observable<string> = this.inventoryService.parentLink$;
  technicians$: Observable<UserType[]> = this.productsService.technicians$;
  techniciansPagination$: Observable<IPagination> = this.productsService.techniciansPagination$;
  ownersPagination$: Observable<IPagination> = this.productsService.ownersPagination$;
  suppliers: CompanyType[];

  get translation() {
    return this.barcodeForm.get('translation');
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private websiteService: WebsiteService,
    private barcodeService: BarcodeService,
    private activatedRoute: ActivatedRoute,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private suppliersService: SupplierService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.suppliersService.suppliers$.subscribe((res) => {
      this.suppliers = res;
      this.changeDetectorRef.markForCheck();
    });
    this.supplierSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.suppliersService.suppliers$ = [];
          this.suppliersService.suppliersPageIndex = 0;
          this.suppliersService.suppliersSearchString$ = searchString;
          return this.suppliersService.searchSuppliersByTarget();
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }

  ngOnInit(): void {
    this.fullPath = this.router.url;
    this.translate.get('MENUITEMS.TS.INVENTORY').subscribe((inventory: string) => {
      this.translate.get('MENUITEMS.TS.ARTICLE_ADD').subscribe((articleAdd: string) => {
        this.breadCrumbItems = [{ label: inventory }, { label: articleAdd, active: true }];
      });
    });
    combineLatest([this.pageId$, this.barcodeService.targetServiceProduct$, this.barcodeService.barcodeWithStock$, this.websiteService.website$])
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap(([pageId, targetServiceProduct, barcode, website]) => {
          this.website = website;
          this.languages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
          this.barcode = barcode;
          this.selectedAttributeValues = map(barcode?.productAttributesValues?.attributesValues, 'id');
          this.selectedAttributeNames = map(barcode?.productAttributesValues?.attributesValues, 'label');
          this.barcodeForm = this.formBuilder.group({
            name: [barcode?.name || ''],
            ...(pageId !== 'services'
              ? {
                  productAttributesValues: [
                    barcode?.productAttributesValues?.attributesValues?.length ? map(barcode?.productAttributesValues?.attributesValues, 'id') : [],
                  ],
                }
              : {}),
            internalProduct: [
              targetServiceProduct && pageId === 'services' && !barcode?.internalProduct ? targetServiceProduct : barcode?.internalProduct,
            ],
            ...(pageId !== 'services' ? { supplier: [barcode?.supplier?.id || undefined] } : {}),
            barcode: [barcode?.barcode || '', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
            discount: this.formBuilder.group({
              amount: [
                {
                  value: this.barcode?.discount?.amount || '0',
                  disabled: !this.barcode?.discount?.discountType || +this.barcode?.discount?.amount === 0,
                },
              ],
              discountType: [+this.barcode?.discount?.amount === 0 ? 'No discount' : this.barcode?.discount?.discountType || 'No discount'],
            }),
            price: [barcode?.price || ''],
            status: [barcode?.status || 'No status selected'],
            condition: [barcode?.condition || 'No condition selected'],
            pixel: this.formBuilder.group({
              include: [barcode?.pixel?.include || false],
            }),
            // equipment only
            ...(pageId === 'equipments-articles'
              ? {
                  maintenance: this.formBuilder.group({
                    owner: [barcode?.maintenance?.owner?.id || undefined],
                    technician: [barcode?.maintenance?.technician?.id || undefined],
                    expectedMeantime: [barcode?.maintenance?.expectedMeantime || 0],
                    maintenanceDuration: [barcode?.maintenance?.maintenanceDuration || 0],
                    prevMaintenanceDuration: [barcode?.maintenance?.prevMaintenanceDuration || 0],
                  }),
                }
              : {}),
            // services only
            ...(pageId === 'services'
              ? {
                  catalogueCategory: [barcode?.catalogueCategory?.length ? barcode?.catalogueCategory[barcode?.catalogueCategory.length - 1].id : ''],
                }
              : {}),
            translation: this.formBuilder.group({
              language: [this.defaultLanguage],
              content: this.formBuilder.group({
                name: [''],
              }),
            }),
          });
          this.initialValues = this.barcodeForm.value;
          this.barcodeForm
            .get('barcode')
            .valueChanges.pipe(takeUntil(this.unsubscribeAll))
            .subscribe((ivalues) => {
              if (this.barcodeForm.get('barcode').valid) {
                this.barcodeService
                  .getSimpleBarcodeByBarcodeAndTarget(ivalues)
                  .pipe(
                    catchError((error) => {
                      if (this.barcodeForm.get('barcode').hasError('alreadyExists')) {
                        let otherErrors: string[] = [];
                        if (this.barcodeForm.get('barcode').hasError('required')) {
                          otherErrors.push('required');
                        }
                        if (this.barcodeForm.get('barcode').hasError('invalid')) {
                          otherErrors.push('invalid');
                        }
                        this.barcodeForm.get('barcode').setErrors(null);
                        if (otherErrors.length) {
                          forEach(otherErrors, (otherError) => this.barcodeForm.get('barcode').setErrors({ [otherError]: true }));
                        }
                      }
                      return throwError(() => new Error(error));
                    }),
                  )
                  .subscribe((res) => {
                    if (res) {
                      this.barcodeForm.get('barcode').setErrors({ alreadyExists: true });
                      this.translate.get('MENUITEMS.TS.BARCODE_EXISTS').subscribe((barcodeExists: string) => {
                        Swal.fire({
                          title: 'Oops...',
                          text: barcodeExists,
                          icon: 'warning',
                          showCancelButton: false,
                          confirmButtonColor: 'rgb(3, 142, 220)',
                          cancelButtonColor: 'rgb(243, 78, 78)',
                        });
                      });
                    } else {
                      if (this.barcodeForm.get('barcode').hasError('alreadyExists')) {
                        let otherErrors: string[] = [];
                        if (this.barcodeForm.get('barcode').hasError('required')) {
                          otherErrors.push('required');
                        }
                        if (this.barcodeForm.get('barcode').hasError('invalid')) {
                          otherErrors.push('invalid');
                        }
                        this.barcodeForm.get('barcode').setErrors(null);
                        if (otherErrors.length) {
                          forEach(otherErrors, (otherError) => this.barcodeForm.get('barcode').setErrors({ [otherError]: true }));
                        }
                      }
                    }
                  });
              }
            });
          this.barcodeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((barcodeFormValues) => {
            if (this.barcode) {
              const simpleFields = ['name', 'price', 'status', 'barcode', 'condition'];
              this.isButtonDisabled = isEqual(this.initialValues, barcodeFormValues) || this.barcodeForm.invalid;
              // this.isButtonDisabled =
              //   (isEqual(
              //     pickBy(barcode, (value, key) => includes(simpleFields, key) && !!value),
              //     pickBy(barcodeFormValues, (value, key) => includes(simpleFields, key) && !!value),
              //   ) &&
              //     (((!barcodeFormValues.pixel || !keys(barcodeFormValues.pixel).length) &&
              //       (!barcode.pixel || !keys(barcode.pixel).length)) ||
              //       (!barcode.pixel?.include && !barcodeFormValues.pixel?.include) ||
              //       barcodeFormValues.pixel?.include === barcode.pixel?.include) &&
              //     ((!(barcodeFormValues.discount || !keys(barcodeFormValues.discount).length) &&
              //       (!barcode.discount || !keys(barcode.discount).length)) ||
              //       (barcodeFormValues.discount?.discountType === 'No discount' && (!barcode.discount || !keys(barcode.discount).length)) ||
              //       (barcodeFormValues.discount?.discountType === barcode.discount?.discountType &&
              //         +barcodeFormValues.discount?.amount === +barcode.discount?.amount)) &&
              //     barcodeFormValues.supplier === barcode.supplier?.id &&
              //     barcodeFormValues.internalProduct?.id === barcode.internalProduct?.id &&
              //     isEqual(
              //       map(barcodeFormValues.media?.pictures, (picture) => `${picture.baseUrl}/${picture.path}`),
              //       map(barcode?.media?.pictures, (picture) => `${picture.baseUrl}/${picture.path}`),
              //     ) &&
              //     isEqualWith(
              //       barcode.priceCredit,
              //       barcodeFormValues.priceCredit,
              //       (credit, formCredit) =>
              //         isEqual(map(credit, 'amount').sort(), map(formCredit, 'amount').sort()) &&
              //         isEqual(map(credit, 'periodValue').sort(), map(formCredit, 'periodValue').sort()) &&
              //         isEqual(map(credit, 'periodCycle').sort(), map(formCredit, 'periodCycle').sort()),
              //     ) &&
              //     isEqual(
              //       clone(barcodeFormValues.productAttributesValues).sort(),
              //       map(barcode?.productAttributesValues?.attributesValues, 'id').sort(),
              //     )) ||
              //   this.barcodeForm.invalid;
            } else {
              this.isButtonDisabled = this.barcodeForm.invalid;
            }
            this.changeDetectorRef.markForCheck();
          });
          this.barcodeForm
            .get('discount.discountType')
            .valueChanges.pipe(
              takeUntil(this.unsubscribeAll),
              rxMap((discountType) => {
                const amountField = this.barcodeForm.get('discount.amount');
                if (discountType === 'No discount') {
                  amountField.reset(0);
                  amountField.disable();
                }
                if (discountType !== 'No discount' && !amountField.enabled) {
                  amountField.enable();
                }
              }),
            )
            .subscribe();
        }),
      )
      .subscribe();
    this.barcodeService.infiniteAttributes$.pipe(takeUntil(this.unsubscribeAll)).subscribe((attributes: AttributeType[]) => {
      this.attributes = attributes;
      this.changeDetectorRef.markForCheck();
    });
    this.barcodeService.infiniteAttributeValues$.pipe(takeUntil(this.unsubscribeAll)).subscribe((attributeValues: AttributeValueType[]) => {
      this.attributeValues = attributeValues;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.barcodeService.searchAttributeByTarget().subscribe(() => this.changeDetectorRef.markForCheck());
  }

  onChangeLanguage(translate: LanguageType) {
    const selectedTranslation = find(this.barcode?.translation, (trs) => trs?.language.id === translate?.id);
    if (translate) {
      this.barcodeForm.get('translation').patchValue({
        language: selectedTranslation?.language || translate,
        content: {
          name: selectedTranslation?.content?.name || '',
        },
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  loadMoreSuppliers() {
    combineLatest([this.suppliersService.isSuppliersLastPage$, this.inventoryService.action$])
      .pipe(take(1))
      .subscribe(([isLast, action]) => {
        if (!isLast) {
          this.suppliersService.suppliersPageIndex += 1;
          this.suppliersService.searchInfiniteSuppliersByTarget().subscribe();
        }
      });
  }

  loadMoreAttributeValues() {
    this.barcodeService.isLastAttributeValues$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.barcodeService.valuesPageIndex += 1;
        this.barcodeService.getAttributeValuesByAttributePaginated(this.selectedAttribute.id).subscribe();
      }
    });
  }

  loadMoreAttributes() {
    this.barcodeService.isLastAttribute$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.barcodeService.attributePageIndex += 1;
        this.barcodeService.searchAttributeByTarget().subscribe();
      }
    });
  }

  isAttributeExist(attributeValue: any): boolean {
    let exist = false;
    if (this.selectedAttributeValues?.length) {
      this.selectedAttributeValues.filter((item) => {
        item === attributeValue.id;
        if (item === attributeValue.id) {
          exist = true;
        }
      });
    }
    return exist;
  }

  checkRadioAttributes(change: any): void {
    let attributeName = find(this.attributeValues, { id: this.selectedAttributeValue });
    if (this.selectedAttributeValue && attributeName) {
      this.selectedAttributeNames = without(this.selectedAttributeNames, attributeName.label);
      this.selectedAttributeValues = without(this.selectedAttributeValues, this.selectedAttributeValue);
    }
    this.selectedAttributeValue = change?.target?.value;
    attributeName = find(this.attributeValues, { id: this.selectedAttributeValue });
    this.selectedAttributeValues.push(change?.target?.value);
    this.selectedAttributeNames.push(attributeName?.label);
    if (this.selectedAttributeValues.length && this.barcodeForm.get('internalProduct').value) {
      this.getBarCode();
    }
    this.barcodeForm.get('productAttributesValues').patchValue(this.selectedAttributeValues);
    this.changeDetectorRef.markForCheck();
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

  isAttributeRadioExist(attributeValue: any): boolean {
    let exist = false;
    if (this.selectedAttributeValues?.length) {
      this.selectedAttributeValues.filter((item) => {
        item === attributeValue.id;
        if (item === attributeValue.id) {
          exist = true;
        }
      });
    }
    return exist;
  }

  checkAttributes(attributeValue: AttributeValueType, change: any, index: number): void {
    if (change?.target?.checked) {
      this.selectedAttributeValues.push(attributeValue.id);
      this.selectedAttributeNames.push(attributeValue.label);
    } else {
      this.selectedAttributeValues = without(this.selectedAttributeValues, attributeValue.id);
      this.selectedAttributeNames = without(this.selectedAttributeNames, attributeValue.label);
    }
    this.barcodeForm.get('productAttributesValues').patchValue(this.selectedAttributeValues);
    if (this.selectedAttributeValues.length && this.barcodeForm.get('internalProduct').value) {
      this.getBarCode();
    }
  }

  getAttributeValues(event: NgbPanelChangeEvent) {
    const panelsArray = this.panels.toArray();
    const index = panelsArray.findIndex((panel) => panel.id === event.panelId);
    if (index > -1) {
      const attribute = this.attributes[index];
      if (event.nextState === true) {
        this.selectedAttributeValue = null;
        this.selectedAttribute = attribute;
        this.barcodeService.valuesPageIndex = 0;
        this.barcodeService.infiniteAttributeValues$ = null;
        this.barcodeService.getAttributeValuesByAttributePaginated(attribute.id).subscribe((res) => {
          if (res) {
            if (!this.attributeValues[0]?.attribute?.isMultipleChoice) {
              this.selectedAttributeValue = find(this.attributeValues, (attributeValue) =>
                includes(this.selectedAttributeValues, attributeValue.id),
              )?.id;
            }
            this.changeDetectorRef.markForCheck();
          }
        });
      }
    }
  }

  save() {
    let translation;
    let maintenance;
    let translations = this.barcode?.translation;
    if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
      const index = findIndex(this.barcode?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
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
    const discount = FormHelper.getNonEmptyAndChangedValues(
      this.barcodeForm.get('discount').value,
      this.barcode?.discount ? this.barcode?.discount : {},
    );
    if (this.barcodeForm.get('maintenance')?.value) {
      maintenance = FormHelper.getDifference(this.initialValues?.maintenance, this.barcodeForm.get('maintenance')?.value);
    }
    const pixel = FormHelper.getDifference(this.initialValues?.pixel, this.barcodeForm.get('pixel').value);
    combineLatest([this.pageId$, this.barcodeService.targetServiceProduct$])
      .pipe(
        take(1),
        rxMap(([pageId, targetServiceProduct]) => {
          const changedValues: any = {
            ...FormHelper.getDifference(
              omit(this.initialValues, 'discount', 'internalProduct', 'productAttributesValues', 'translation', 'maintenance', 'pixel'),
              omit(this.barcodeForm.value, 'discount', 'internalProduct', 'productAttributesValues', 'translation', 'maintenance', 'pixel'),
            ),
            ...(pageId === 'equipments-articles' && keys(maintenance)?.length ? { maintenance } : {}),
            ...(keys(pixel)?.length ? { pixel } : {}),
            ...(pageId === 'services' ||
            isEqual(
              (this.barcode?.productAttributesValues?.attributesValues?.length
                ? cloneDeep(map(this.barcode?.productAttributesValues?.attributesValues, 'id'))
                : []
              ).sort(),
              (this.selectedAttributeValues?.length ? cloneDeep(this.selectedAttributeValues) : []).sort(),
            )
              ? {}
              : { productAttributesValues: this.selectedAttributeValues }),
            ...(pageId !== 'services' && targetServiceProduct
              ? { internalProduct: targetServiceProduct?.id }
              : this.barcode?.internalProduct?.id === this.barcodeForm.get('internalProduct').value?.id
              ? {}
              : { internalProduct: this.barcodeForm.get('internalProduct').value.id }),
            ...(discount?.amount && discount?.discountType !== 'No discount'
              ? {
                  discount: {
                    amount: this.barcodeForm.value?.discount?.amount,
                    discountType: this.barcodeForm.value?.discount?.discountType,
                  },
                }
              : this.barcode?.discount?.amount && this.barcode?.discount?.discountType && discount?.discountType === 'No discount'
              ? {
                  discount: {
                    amount: '0',
                    discountType: this.barcode?.discount?.discountType,
                  },
                }
              : {}),
            ...(keys(translation)?.length &&
            this.translation?.get('language').value?.name &&
            this.translation?.get('language').value?.name !== 'Default'
              ? { translation }
              : {}),
          };
          if (this.barcode) {
            this.barcodeService
              .updateBarcode({ id: this.barcode?.id, ...changedValues })
              .pipe(
                catchError(() => {
                  this.modalError();
                  return of(null);
                }),
              )
              .subscribe((res) => {
                if (res) {
                  this.position();
                  this.parentLink$
                    .pipe(
                      take(1),
                      rxMap((parentLink) => {
                        // this.router.navigate([parentLink], { relativeTo: this.activatedRoute });
                      }),
                    )
                    .subscribe();
                  this.changeDetectorRef.markForCheck();
                }
              });
          } else {
            (this.barcodeService[pageId === 'services' ? 'createServiceProduct' : 'createBarcode'](changedValues) as any)
              .pipe(
                catchError((error) => {
                  this.modalError();
                  return of(null);
                }),
              )
              .subscribe((res: any) => {
                if (res) {
                  this.position();
                  this.parentLink$
                    .pipe(
                      take(1),
                      rxMap((parentLink) => {
                        // this.router.navigate([parentLink], { relativeTo: this.activatedRoute });
                      }),
                    )
                    .subscribe();
                  this.changeDetectorRef.markForCheck();
                }
              });
          }
        }),
      )
      .subscribe();
  }

  getBarCode() {
    const formValue = {
      internalProduct: this.barcodeForm.get('internalProduct')?.value?.id,
      ...(this.selectedAttributeValues.length ? { productAttributesValues: this.selectedAttributeValues } : {}),
    };
    this.barcodeService
      .getBarcodeByProductAndAttributes(formValue)
      .pipe(
        catchError(() => {
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          if (res?.id === this.barcode?.id) {
            return;
          }
          this.translate.get('MENUITEMS.TS.BARCODE_COMBINATION_EXISTS').subscribe((barcodeCombinationExists: string) => {
            Swal.fire({
              title: 'Oops...',
              text: barcodeCombinationExists,
              icon: 'warning',
              showCancelButton: false,
              confirmButtonColor: 'rgb(3, 142, 220)',
              cancelButtonColor: 'rgb(243, 78, 78)',
            });
          });
        }
        this.changeDetectorRef.markForCheck();
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
    this.barcodeService.infiniteAttributes$ = null;
    this.barcodeService.attributePageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.barcodeService.pageIndex = 0;
    this.barcodeService.searchString = '';
    this.barcodeForm.reset();
    this.barcodeService.barcodeWithStock$ = null;
  }
}
