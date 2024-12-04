import Swal from 'sweetalert2';
import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { chain, find, findIndex, groupBy, includes, isEqual, keys, map, omit, values, without } from 'lodash';
import { take, Subject, switchMap, takeUntil, Observable, catchError, throwError, debounceTime, combineLatest, distinctUntilChanged } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { BarcodePeriodCreditInput, DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL, WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper, ValidationHelper } from '@diktup/frontend/helpers';
import { BarcodeStatsType, BarcodeWithStockType } from '@sifca-monorepo/terminal-generator';
import {
  UserType,
  PriceType,
  BarcodeType,
  DiscountType,
  AttributeType,
  RecurrenceType,
  AttributeValueType,
  InternalProductType,
  ProductConditionEnum,
  BarcodePricesType,
} from '@sifca-monorepo/terminal-generator';

import { BarcodeService } from '../articles.service';
import { ProductsService } from '../../products/products.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { SettingsService } from '../../../../system/settings/settings.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { AltPicturesComponent } from '../../../../../shared/components/alt-pictures/alt-pictures.component';
import { DOCUMENT } from '@angular/common';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./detail.component.scss'],
  templateUrl: './detail.component.html',
  selector: 'sifca-monorepo-article-detail',
})
export class ArticleDetailComponent implements OnInit {
  public productDetail!: BarcodeType[];
  private unsubscribeAll: Subject<any> = new Subject<any>();

  noBarCode = false;
  isLoading: boolean;
  attributePairs: any;
  creditForm: FormGroup;
  selectedIndex: number;
  pricesForm: FormGroup;
  barcodeForm: FormGroup;
  priceList: PriceType[];
  // barcode: BarcodeType;
  isButtonDisabled = true;
  priceListForm: FormGroup;
  initialPricesValues: any;
  selectedAttrIndex: number;
  initBarcodeForm: FormGroup;
  maintenanceForm: FormGroup;
  breadCrumbItems!: Array<{}>;
  attributes: AttributeType[];
  barcode: BarcodeWithStockType;
  isCreditButtonDisabled = true;
  generatedBarcode: BarcodeType;
  isPricesButtonDisabled = true;
  isBarcodeButtonDisabled = true;
  selectedAttributeValue: string;
  isRemoveButtonDisabled: boolean;
  isUploadButtonDisabled: boolean;
  website: WebsiteIntegrationType;
  selectedAttribute: AttributeType;
  isPriceListButtonDisabled = true;
  discountTypes = values(DiscountType);
  periodCycles = values(RecurrenceType);
  selectedAttributeNames: string[] = [];
  attributeValues: AttributeValueType[];
  selectedAttributeValues: string[] = [];
  barcodeWithStock: BarcodeWithStockType;
  conditions = values(ProductConditionEnum);
  isMaintenanceButtonDisabled: boolean = true;
  validateBarcode = this.validationHelper.validateBarcode;
  pageId$: Observable<string> = this.inventoryService.pageId$;
  productSearchInput$: Subject<string> = new Subject<string>();
  owners$: Observable<UserType[]> = this.productsService.owners$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  parentLink$: Observable<string> = this.inventoryService.parentLink$;
  priceList$: Observable<PriceType[]> = this.settingsService.priceList$;
  technicians$: Observable<UserType[]> = this.productsService.technicians$;
  products$: Observable<InternalProductType[]> = this.barcodeService.products$;
  barcodeStats$: Observable<BarcodeStatsType> = this.barcodeService.barcodeStats$;
  ownersPagination$: Observable<IPagination> = this.productsService.ownersPagination$;
  isLastAttributeValues$: Observable<boolean> = this.barcodeService.isLastAttributeValues$;
  techniciansPagination$: Observable<IPagination> = this.productsService.techniciansPagination$;

  get pictures(): FormArray {
    return this.barcodeForm.get(['media', 'pictures']) as FormArray;
  }
  get prices(): FormArray {
    return this.pricesForm.get('prices') as FormArray;
  }
  get currentImageIndex(): FormControl {
    return this.barcodeForm.get('currentImageIndex') as FormControl;
  }
  get priceCredit(): FormArray {
    return this.barcodeForm?.get('priceCredit') as FormArray;
  }
  get allList(): FormArray {
    return this.priceListForm?.get('allList') as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private clipboard: Clipboard,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private barcodeService: BarcodeService,
    private websiteService: WebsiteService,
    private amazonS3Helper: AmazonS3Helper,
    private settingsService: SettingsService,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private validationHelper: ValidationHelper,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVENTORY').subscribe((inventory: string) => {
      this.translate.get('MENUITEMS.TS.ARTICLE_DETAILS').subscribe((articleDetails: string) => {
        this.breadCrumbItems = [{ label: inventory }, { label: articleDetails, active: true }];
      });
    });
    combineLatest([this.barcodeService.barcodeWithStock$, this.settingsService.priceList$, this.websiteService.website$])
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(([barcodeWithStock, priceList, website]: [BarcodeWithStockType, PriceType[], WebsiteIntegrationType]) => {
        this.priceList = priceList;
        if (barcodeWithStock) {
          this.barcode = barcodeWithStock;
        }
        this.website = website;
        this.pricesForm = this.formBuilder.group({
          prices: this.formBuilder.array(
            this.website?.multicurrency.currencies?.length
              ? map(this.website?.multicurrency.currencies, (currency) => {
                  const defualtCurrency = find(this.barcode?.prices, (price: BarcodePricesType) => price?.currency?.id === currency?.currency?.id);
                  return this.formBuilder.group({
                    price: [defualtCurrency?.price || ''],
                    currency: [defualtCurrency?.currency || currency?.currency],
                  });
                })
              : [
                  this.formBuilder.group({
                    price: [''],
                    currency: [''],
                  }),
                ],
          ),
        });
        this.initialPricesValues = this.pricesForm.value;
        this.pricesForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
          this.isPricesButtonDisabled = isEqual(values, this.initialPricesValues);
          this.changeDetectorRef.markForCheck();
        });
        const groupedAttributes = groupBy(this.barcode?.productAttributesValues?.attributesValues, 'attribute.label');
        this.attributePairs = Object.entries(groupedAttributes).map(([key, values]) => ({
          key,
          value: values.map((val) => val.label),
        }));
        this.barcodeForm = this.formBuilder.group({
          name: [this.barcode?.name || ''],
          productAttributesValues: [map(this.barcode?.productAttributesValues?.attributesValues, 'attribute') || ''],
          discount: this.formBuilder.group({
            amount: [this.barcode?.discount?.amount || '0'],
            discountType: [this.barcode?.discount?.amount === '0' ? 'No discount' : this.barcode?.discount?.discountType || 'No discount'],
          }),
          priceCredit: this.formBuilder.array(
            this.barcode?.priceCredit?.length
              ? map(this.barcode.priceCredit, (credit) => {
                  return this.formBuilder.group({
                    amount: [credit?.amount || ''],
                    periodCycle: [credit?.periodCycle || ''],
                    periodValue: [credit?.periodValue || ''],
                  });
                })
              : [],
          ),
          price: [this.barcode?.price || ''],
          condition: [this.barcode?.condition || 'No condition selected'],
          pixel: this.formBuilder.group({
            include: [this.barcode?.pixel?.include || false],
          }),
          currentImageIndex: [0],
          media: this.formBuilder.group({
            pictures: this.formBuilder.array(
              this.barcode?.media?.pictures?.length
                ? map(this.barcode?.media.pictures, (picture) => {
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
        });
        const initialBarcodeFormValues = this.barcodeForm?.value;
        this.barcodeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((barcodeFormValues) => {
          this.isButtonDisabled = isEqual(initialBarcodeFormValues, barcodeFormValues);
          this.changeDetectorRef.markForCheck();
        });
        this.priceListForm = this.formBuilder.group({
          allList: this.formBuilder.array(
            this.priceList?.length
              ? map(this.priceList, (list) => {
                  let control = {
                    value: [''],
                    price: [list?.id],
                    label: [list?.label],
                  };
                  const index = findIndex(barcodeWithStock?.priceList, (priceList) => priceList.price.id === list.id);
                  if (index > -1) {
                    control = {
                      value: [barcodeWithStock.priceList[index]?.value],
                      price: [barcodeWithStock.priceList[index]?.price?.id],
                      label: [barcodeWithStock.priceList[index]?.price?.label],
                    };
                  }
                  return this.formBuilder.group(control);
                })
              : [],
          ),
        });
        const initialPriceListFormValues = this.priceListForm?.value;
        this.priceListForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
          this.isPriceListButtonDisabled = isEqual(initialPriceListFormValues, val);
          this.changeDetectorRef.markForCheck();
        });
        this.maintenanceForm = this.formBuilder.group({
          owner: [barcodeWithStock?.maintenance?.owner?.id || undefined],
          technician: [barcodeWithStock?.maintenance?.technician?.id || undefined],
          expectedMeantime: [barcodeWithStock?.maintenance?.expectedMeantime || 0],
          maintenanceDuration: [barcodeWithStock?.maintenance?.maintenanceDuration || 0],
          prevMaintenanceDuration: [barcodeWithStock?.maintenance?.prevMaintenanceDuration || 0],
        });
        const initialMaintenanceFormValues = this.maintenanceForm?.value;
        this.maintenanceForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
          const newValues = FormHelper.getNonEmptyAndChangedValues(val, initialMaintenanceFormValues);
          this.isMaintenanceButtonDisabled = !keys(newValues).length || this.maintenanceForm.invalid;
          this.changeDetectorRef.markForCheck();
        });
        this.changeDetectorRef.markForCheck();
      });
    this.barcodeService.infiniteAttributes$.pipe(takeUntil(this.unsubscribeAll)).subscribe((attributes: AttributeType[]) => {
      this.attributes = attributes;
      this.isLoading = false;
      this.changeDetectorRef.markForCheck();
    });
    this.barcodeService.infiniteAttributeValues$.pipe(takeUntil(this.unsubscribeAll)).subscribe((attributeValues: AttributeValueType[]) => {
      this.attributeValues = attributeValues;
      this.changeDetectorRef.markForCheck();
    });
    this.initBarcodeForm = this.formBuilder.group({
      product: [this.barcode?.internalProduct || '', Validators.required],
      productAttributesValues: [this.selectedAttributeValues],
    });
    this.selectedAttributeValues = map(
      this.barcode?.productAttributesValues?.attributesValues?.length ? this.barcode?.productAttributesValues?.attributesValues : [],
      'id',
    );
    this.selectedAttributeNames = map(
      this.barcode?.productAttributesValues?.attributesValues?.length ? this.barcode?.productAttributesValues?.attributesValues : [],
      'label',
    );
    this.initBarcodeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
      this.isBarcodeButtonDisabled = false;
      if (this.selectedAttributeValues.length && this.initBarcodeForm.get('product').value.id) {
        this.getBarCode();
      }
      this.changeDetectorRef.markForCheck();
    });
    this.productSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.barcodeService.products$ = null;
          this.barcodeService.productPageIndex = 0;
          return this.barcodeService.getSimpleProductWithFilter(searchString);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngAfterViewInit() {
    this.barcodeService.getSimpleProductWithFilter().subscribe();
    this.barcodeService.searchAttributeByTarget().subscribe();
  }

  savePrices() {
    const input: any = [
      ...map(this.prices.value, (price) => {
        return {
          ...(price?.price ? { price: price?.price } : {}),
          ...(price?.currency ? { currency: price?.currency?.id } : {}),
        };
      }),
    ];
    this.updateBarcode({ id: this.barcode?.id, prices: input });
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

  saveMaintenance() {
    this.isMaintenanceButtonDisabled = true;
    this.barcodeService.updateBarcode({ id: this.barcode?.id, maintenance: this.maintenanceForm.value }).pipe(take(1)).subscribe();
  }

  openAltMoadal() {
    const modalRef = this.modalService.open(AltPicturesComponent, { backdrop: 'static' });
    modalRef.componentInstance.picture = this.pictures.value[this.currentImageIndex.value];
    modalRef.result.then((result) => {
      if (result) {
        this.pictures.at(this.currentImageIndex.value).patchValue(result.picture);
        if (this.barcode) {
          this.barcodeService
            .updateBarcode({ id: this.barcode.id, media: this.barcodeForm.get('media').value })
            .pipe(
              catchError((error) => {
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return throwError(() => new Error(error));
              }),
            )
            .subscribe(() => {
              this.position();
              this.changeDetectorRef.markForCheck();
            });
        }
      }
    });
  }

  savePriceList() {
    this.isPriceListButtonDisabled = true;
    const result = chain(this.allList.value)
      .filter((obj) => obj.value !== '')
      .map((obj) => omit(obj, 'label'))
      .value();
    const input: any = {
      id: this.barcode.id,
      priceList: result,
    };
    this.updateBarcode(input);
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  addBarcode(): void {
    this.isBarcodeButtonDisabled = true;
    const input: any = {
      id: this.barcode.id,
      productAttributesValues: this.selectedAttributeValues,
      internalProduct: this.initBarcodeForm.get('product').value.id,
    };
    this.updateBarcode(input);
  }

  resetForm() {
    this.selectedAttributeValues = [];
    this.selectedAttributeNames = [];
    delete this.selectedAttributeValue;
    this.getBarCode();
    this.changeDetectorRef.markForCheck();
  }

  getBarCode() {
    const formValue = {
      internalProduct: this.initBarcodeForm.get('product').value.id,
      ...(this.selectedAttributeValues.length ? { productAttributesValues: this.selectedAttributeValues } : {}),
    };
    this.barcodeService
      .getBarcodeByProductAndAttributes(formValue)
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.generatedBarcode = res;
          this.noBarCode = false;
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
        } else {
          this.noBarCode = true;
        }
        this.changeDetectorRef.markForCheck();
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
      this.selectedAttributeNames = without(this.selectedAttributeNames, attributeName?.label);
      this.selectedAttributeValues = without(this.selectedAttributeValues, this.selectedAttributeValue);
    }
    this.selectedAttributeValue = change?.target?.value;
    attributeName = find(this.attributeValues, { id: this.selectedAttributeValue });
    this.selectedAttributeValues.push(change?.target?.value);
    this.selectedAttributeNames.push(attributeName?.label);
    if (this.selectedAttributeValues.length && this.initBarcodeForm.get('product').value) {
      this.getBarCode();
    }
    this.initBarcodeForm.get('productAttributesValues').patchValue(this.selectedAttributeValues);
    this.changeDetectorRef.markForCheck();
  }

  getAttributeValues(attribute: AttributeType, event: NgbPanelChangeEvent) {
    if (event.nextState === true) {
      this.selectedAttributeValue = null;
      this.selectedAttribute = attribute;
      this.barcodeService.valuesPageIndex = 0;
      this.barcodeService.infiniteAttributeValues$ = null;
      this.barcodeService.getAttributeValuesByAttributePaginated(attribute.id).subscribe((res) => {
        if (res) {
          this.selectedAttribute = this.attributes.filter((item) => item.id === attribute.id)[0];
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
    this.initBarcodeForm.get('productAttributesValues').patchValue(this.selectedAttributeValues);
    if (this.selectedAttributeValues.length && this.initBarcodeForm.get('product').value) {
      this.getBarCode();
    }
  }

  openAddBarcodeModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  loadMoreProducts() {
    this.barcodeService.isLastProducts$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.barcodeService.productPageIndex += 1;
        this.barcodeService.getSimpleProductWithFilter().subscribe();
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

  removePicture(): void {
    this.isRemoveButtonDisabled = true;
    const fileName = this.pictures.at(this.currentImageIndex.value).value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        const pictureFormArray = this.pictures as FormArray;
        pictureFormArray.removeAt(this.currentImageIndex.value);
        const input: any = {
          id: this.barcode.id,
          media: { pictures: null },
        };
        this.updateBarcode(input);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  cycleImages(forward: boolean = true): void {
    const count = this.pictures.value.length;
    const currentIndex = this.barcodeForm.get('currentImageIndex').value;
    const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
    const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;
    this.currentImageIndex.patchValue(forward === true ? nextIndex : prevIndex);
  }

  addImageToSelectedBarcode(): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      this.isLoading = true;
      this.isUploadButtonDisabled = true;
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
          this.pictures.insert(
            0,
            this.formBuilder.group({
              path: picture.path,
              baseUrl: picture.baseUrl,
            }),
          );
          this.isLoading = false;
          this.isUploadButtonDisabled = false;
          const input: any = {
            id: this.barcode.id,
            media: { pictures: this.pictures.value },
          };
          this.updateBarcode(input);
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  updateBarcode(input: any) {
    this.barcodeService
      .updateBarcode(input)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.isRemoveButtonDisabled = false;
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.position();
          this.isRemoveButtonDisabled = false;
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  deleteCredit() {
    this.priceCredit.removeAt(this.selectedIndex);
    const input: any = {
      id: this.barcode.id,
      priceCredit: this.priceCredit.value,
    };
    this.updateBarcode(input);
  }

  save() {
    this.isButtonDisabled = true;
    const discount = FormHelper.getDifference(this.barcode.discount ? this.barcode.discount : {}, this.barcodeForm.get('discount').value);
    const changedValues: any = {
      id: this.barcode.id,
      ...FormHelper.getDifference(
        omit(this.barcode, 'discount', 'media', 'priceList', 'productAttributesValues', 'priceCredit'),
        omit(this.barcodeForm.value, 'discount', 'media', 'priceList', 'productAttributesValues', 'priceCredit'),
      ),
      ...(discount?.amount && discount?.discountType !== 'No discount'
        ? {
            discount: {
              amount: this.barcodeForm.value.discount.amount,
              discountType: this.barcodeForm.value.discount.discountType,
            },
          }
        : this.barcode.discount?.amount && this.barcode.discount?.discountType && discount?.discountType === 'No discount'
        ? {
            discount: {
              amount: '0',
              discountType: this.barcode.discount?.discountType,
            },
          }
        : {}),
    };
    this.updateBarcode(changedValues);
  }

  saveCredit() {
    this.isCreditButtonDisabled = true;
    if (this.selectedIndex > -1 && this.selectedIndex !== null) {
      this.priceCredit.at(this.selectedIndex).patchValue(this.creditForm.value);
    } else {
      this.priceCredit.value.push(this.creditForm.value);
    }
    const input: any = {
      id: this.barcode.id,
      priceCredit: this.priceCredit.value,
    };
    this.updateBarcode(input);
  }

  openDeleteCreditModal(content: any, index?: number) {
    this.selectedIndex = index;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  openCreditModal(content: any, credit?: BarcodePeriodCreditInput, index?: number) {
    this.selectedIndex = index;
    this.modalService.open(content, { size: 'md', centered: true });
    this.creditForm = this.formBuilder.group({
      amount: [credit?.amount || ''],
      periodCycle: [credit?.periodCycle || '', [Validators.required]],
      periodValue: [credit?.periodValue || '', [Validators.required]],
    });
    const initialValues = this.creditForm?.value;
    this.creditForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
      this.isCreditButtonDisabled = isEqual(initialValues, val);
      this.changeDetectorRef.markForCheck();
    });
  }

  openBarcodeModal(content: NgbModal) {
    this.modalService.open(content, { size: 'md', centered: true });
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
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.barcodeService.infiniteAttributes$ = null;
    this.barcodeService.attributePageIndex = 0;
  }
}
