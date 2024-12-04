import { ReplaySubject, of } from 'rxjs';
import Swal from 'sweetalert2';
import { find, findIndex, isEqual, keys, map, omit } from 'lodash';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, TemplateRef } from '@angular/core';
import { catchError, Subject, takeUntil, take, switchMap, Observable, debounceTime, distinctUntilChanged } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { AttributeType, AttributeValueType, LanguageType, ProductVarietyEnum, UserType } from '@sifca-monorepo/terminal-generator';

import { AttributesService } from '../attributes.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { ConvertorHelper, FormHelper } from '@diktup/frontend/helpers';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SheetsNames } from '@sifca-monorepo/terminal-generator';
import { ProductsService } from '../../products/products.service';
import { UserService } from '../../../../../core/services/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  selector: 'sifca-monorepo-attributes-list',
})
export class AttributesListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInput = this.document.createElement('input');
  private fileInputExcel = this.document.createElement('input');

  page = 0;
  valuePage = 0;
  editable = false;
  fullPath: string;
  languages: any[];
  initialValues: any;
  pageChanged: boolean;
  emailForm: FormGroup;
  valuePageSize: number;
  loadingImport: boolean;
  pagination: IPagination;
  attributeForm: FormGroup;
  isButtonDisabled: boolean;
  selectedAttributeId: string;
  breadCrumbItems!: Array<any>;
  isValueButtonDisabled = true;
  valuesPaginationSize: number;
  isEmailButtonDisabled = true;
  attributeValueForm: FormGroup;
  valuesPagination: IPagination;
  loadingImportPictures: boolean;
  website: WebsiteIntegrationType;
  selectedAttributeValueId: string;
  selectedAttribute: AttributeType;
  productAttributes: AttributeValueType[];
  selectedAttributeValue: AttributeValueType;
  defaultLanguage: any = { name: 'Default', id: '1' };
  pageId$: Observable<string> = this.inventoryService.pageId$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  attributes$: Observable<AttributeType[]> = this.attributeService.attributes$;
  loadingAttributes$: Observable<boolean> = this.attributeService.loadingAttributes$;

  get translation() {
    return this.attributeForm.get('translation');
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
    private sharedService: SharedService,
    private websiteService: WebsiteService,
    private offcanvasService: NgbOffcanvas,
    private convertorHelper: ConvertorHelper,
    private productsService: ProductsService,
    private translate: TranslateService,
    private inventoryService: InventoryService,
    private attributeService: AttributesService,
    private changeDetectorRef: ChangeDetectorRef,
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
    this.valuePageSize = this.attributeService.valuesFilterLimit;
    this.attributeService.productAttributes$.pipe(takeUntil(this.unsubscribeAll)).subscribe((productAttributes: AttributeValueType[]) => {
      this.productAttributes = productAttributes;
      this.changeDetectorRef.markForCheck();
    });
    this.attributeService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      if (pagination) {
        this.pagination = {
          length: pagination?.length,
          page: this.attributeService.pageIndex || 0,
          size: this.attributeService.filterLimit,
          lastPage: pagination?.length - 1,
          startIndex: (this.attributeService.pageIndex || 0) * this.attributeService.filterLimit,
          endIndex: Math.min(((this.attributeService.pageIndex || 0) + 1) * this.attributeService.filterLimit - 1, pagination?.length - 1),
        };
        this.changeDetectorRef.markForCheck();
      }
    });
    this.attributeService.valuesPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      if (pagination) {
        this.valuesPagination = pagination;
        this.valuesPaginationSize = pagination?.length;
        this.changeDetectorRef.markForCheck();
      }
    });
    this.websiteService.website$.pipe(takeUntil(this.unsubscribeAll)).subscribe((website: WebsiteIntegrationType) => {
      this.website = website;
      this.languages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
      this.changeDetectorRef.markForCheck();
    });

    this.inventoryService.pageId$.subscribe();
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.attributeService.searchString = searchValues.searchString;
          return this.attributeService.searchAttributeByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  send() {
    this.pageId$.pipe(take(1)).subscribe((pageTitle) => {
      const input: any = {
        emails: this.emailForm.get('emails').value,
        ...(pageTitle === 'products'
          ? {
              sheets: [SheetsNames?.ATTRIBUTES, SheetsNames?.ATTRIBUTES_VALUES],
              variety: ProductVarietyEnum.PRODUCT,
            }
          : {}),
        ...(pageTitle === 'equipments'
          ? {
              sheets: [SheetsNames?.ATTRIBUTES, SheetsNames?.ATTRIBUTES_VALUES],
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

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
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
          ...(pageId === 'products'
            ? {
                sheets: [SheetsNames?.ATTRIBUTES, SheetsNames?.ATTRIBUTES_VALUES],
                variety: ProductVarietyEnum.PRODUCT,
              }
            : {}),
          ...(pageId === 'equipments'
            ? {
                sheets: [SheetsNames?.ATTRIBUTES, SheetsNames?.ATTRIBUTES_VALUES],
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

  openAttributeModal(content: any, attribute: AttributeType | null) {
    this.isButtonDisabled = true;
    this.selectedAttribute = attribute;
    this.modalService.open(content, { centered: true });
    this.attributeForm = this.formBuilder.group({
      label: [attribute?.label || '', Validators.required],
      pixel: this.formBuilder.group({
        pixelAttribute: [attribute?.pixel?.pixelAttribute || ''],
      }),
      ...(!this.selectedAttribute && { externalId: ['', [Validators.required]] }),
      isRequired: [attribute?.isRequired || false, Validators.required],
      isMultipleChoice: [attribute?.isMultipleChoice || false, Validators.required],
      translation: this.formBuilder.group({
        language: [this.defaultLanguage],
        content: this.formBuilder.group({
          label: [''],
        }),
      }),
    });
    this.initialValues = this.attributeForm.value;
    this.attributeForm.valueChanges.subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.initialValues);
    });
  }

  onChangeLanguage(translate: LanguageType) {
    const selectedTranslation = find(this.selectedAttribute?.translation, (trs) => trs?.language.id === translate?.id);
    if (translate) {
      this.attributeForm.get('translation').patchValue({
        language: selectedTranslation?.language || translate,
        content: {
          label: selectedTranslation?.content?.label || '',
        },
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  saveAttribute() {
    let translation;
    let translations = this.selectedAttribute?.translation;
    if (this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default') {
      const index = findIndex(this.selectedAttribute?.translation, (trs) => trs?.language?.id === this.translation.value?.language?.id);
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
    const input: any = {
      ...FormHelper.getDifference(omit(this.initialValues, 'pixel', 'translation'), omit(this.attributeForm.value, 'pixel', 'translation')),
      ...(this.initialValues?.pixel?.pixelAttribute === this.attributeForm.value?.pixel?.pixelAttribute
        ? {}
        : { pixel: { pixelAttribute: this.attributeForm.value?.pixel?.pixelAttribute } }),
      ...(keys(translation)?.length && this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
        ? { translation }
        : {}),
    };
    this.isButtonDisabled = true;
    if (this.selectedAttribute?.id) {
      this.attributeService
        .updateAttribute({ id: this.selectedAttribute.id, ...input })
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.inventoryService.variety$
        .pipe(
          take(1),
          switchMap((variety) => this.attributeService.addAttribute({ variety, ...input })),
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.attributeService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.attributeService.searchAttributeByTarget().subscribe();
    }
  }

  onValuePageChange(page: number) {
    this.valuePage = page;
    this.attributeService.valuesPageIndex = page - 1;
    this.attributeService.getAttributeValuesByAttributePaginated(this.selectedAttribute.id).subscribe();
  }

  openDeleteModal(content: NgbModal, attr: any, field?: string) {
    if (field === 'attribute') {
      this.selectedAttributeId = attr.id;
    } else {
      this.selectedAttributeValueId = attr.id;
    }
    this.modalService.open(content, { centered: true });
  }

  attributeSideMenu(content: TemplateRef<any>, attribute: AttributeType) {
    this.offcanvasService.open(content, { position: 'end' });
    this.selectedAttribute = attribute;
    this.editable = true;
    this.attributeService.getAttributeValuesByAttributePaginated(this.selectedAttribute.id).subscribe();
  }

  deleteAttr() {
    if (this.selectedAttributeId) {
      this.attributeService
        .deleteAttribute(this.selectedAttributeId)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe(() => {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        });
    } else if (this.selectedAttributeValueId) {
      this.attributeService
        .deleteAttributeValue(this.selectedAttributeValueId)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe(() => {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  saveValue() {
    this.isValueButtonDisabled = true;
    if (this.selectedAttributeValue?.id) {
      this.attributeService
        .updateAttributeValue({ id: this.selectedAttributeValue.id, ...this.attributeValueForm.value })
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe(() => {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.attributeService
        .addProductAttributeValue({ attribute: this.selectedAttribute.id, ...this.attributeValueForm.value })
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
          }
        });
    }
  }

  openValueModal(valueModal: any, attributeValue: AttributeValueType | null) {
    this.isButtonDisabled = true;
    this.selectedAttributeValue = attributeValue;
    this.modalService.open(valueModal, { centered: true });
    this.attributeValueForm = this.formBuilder.group({
      label: [this.selectedAttributeValue?.label || '', Validators.required],
      ...(!this.selectedAttributeValue && { externalId: ['', [Validators.required]] }),
    });
    const initialValues = this.attributeValueForm.value;
    this.attributeValueForm.valueChanges.subscribe((ivalues) => {
      this.isValueButtonDisabled = isEqual(ivalues, initialValues);
    });
  }

  requiredChange(event: any) {
    this.attributeForm.get('isRequired').patchValue(event.target.checked);
  }

  multipleChoiceChange(event: any) {
    this.attributeForm.get('isMultipleChoice').patchValue(event.target.checked);
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
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.attributeService.pageIndex = 0;
    this.attributeService.valuesPageIndex = 0;
  }
}
