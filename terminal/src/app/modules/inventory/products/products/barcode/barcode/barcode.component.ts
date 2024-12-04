import { catchError, Subject, takeUntil, throwError } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatRadioChange } from '@angular/material/radio';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { find, includes, omit, without } from 'lodash';

import { AttributeType, AttributeValueType, BarcodeFindInput, BarcodeType, InternalProductType } from '@sifca-monorepo/terminal-generator';
import { ProductsService } from '../../products.service';
import { ValidationHelper } from '@diktup/frontend/helpers';
import { Clipboard } from '@angular/cdk/clipboard';
import { AttributesService } from '../../../attributes/attributes.service';

@Component({
  selector: 'bosk-barcode-modal',
  templateUrl: './barcode.component.html',
  styleUrls: [`./barcode.component.scss`],
})
export class AddBarcodeModalComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  validateBarcode = this.validationHelper.validateBarcode;

  spinner = false;
  isLoading = false;
  removable = true;
  addOnBlur = true;
  loading1 = false;
  loading2 = false;
  noBarCode: boolean;
  selectable = true;
  barcodeExist = false;
  barcodeForm: FormGroup;
  attributesExist = false;
  attributes: AttributeType[];
  selectedAttribute: AttributeType;
  selectedAttributeValues: string[] = [];
  selectedAttributeNames: string[] = [];
  selectedAttributeValue: string;
  attributeValues: AttributeValueType[];
  isButtonDisabled = true;
  barcode: BarcodeType;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  selectedProduct: InternalProductType;
  showMessageError: boolean;

  get productAttributes(): FormControl {
    return this.barcodeForm.get('productAttributes') as FormControl;
  }

  constructor(
    private clipboard: Clipboard,
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private validationHelper: ValidationHelper,
    private attributesService: AttributesService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: InternalProductType,
    private matDialogRef: MatDialogRef<AddBarcodeModalComponent>,
  ) {
    this.attributesService.attributes$.pipe(takeUntil(this.unsubscribeAll)).subscribe((attributes: AttributeType[]) => {
      this.attributes = attributes;
      this.isLoading = false;
      this.changeDetectorRef.markForCheck();
    });
    this.attributesService.productAttributes$.pipe(takeUntil(this.unsubscribeAll)).subscribe((attributeValues: AttributeValueType[]) => {
      this.attributeValues = attributeValues;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.spinner = true;
    this.isLoading = true;
    this.selectedProduct = this.productsService.selectedProduct;
    this.attributesService.searchAttributeByTarget().subscribe();
    this.barcodeForm = this.formBuilder.group({
      barcode: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
      product: [this.selectedProduct.product.id],
    });
    const formValue = {
      ...omit(this.barcodeForm.value, 'barcode'),
    };
    this.productsService.getByProductAndAttributes(formValue as BarcodeFindInput).subscribe((res) => {
      if (res) {
        this.barcode = res;
        this.spinner = false;
        this.noBarCode = false;
        this.changeDetectorRef.markForCheck();
      } else {
        this.noBarCode = true;
      }
    });
  }
  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }
  getBarCode() {
    this.spinner = true;
    const formValue = {
      ...omit(this.barcodeForm.value, 'barcode'),
      ...(this.selectedAttributeValues.length ? { productAttributesValues: this.selectedAttributeValues } : {}),
    };
    this.productsService.getByProductAndAttributes(formValue as BarcodeFindInput).subscribe((res) => {
      this.barcode = res;
      if (res) {
        this.noBarCode = false;
        this.spinner = false;
      } else {
        this.noBarCode = true;
        this.spinner = false;
      }
      this.changeDetectorRef.markForCheck();
    });
  }
  isAttributeExist(attributeValue: any): boolean {
    let exist = false;
    if (this.selectedAttributeValues?.length) {
      this.selectedAttributeValues.filter((item) => {
        // tslint:disable-next-line: no-unused-expression
        item === attributeValue.id;
        if (item === attributeValue.id) {
          exist = true;
        }
      });
    }
    return exist;
  }
  checkRadioAttributes(change: MatRadioChange): void {
    let attributeName = find(this.attributeValues, { id: this.selectedAttributeValue });
    if (this.selectedAttributeValue) {
      this.selectedAttributeNames = without(this.selectedAttributeNames, attributeName.label);
      this.selectedAttributeValues = without(this.selectedAttributeValues, this.selectedAttributeValue);
    }
    this.selectedAttributeValue = change.value;
    attributeName = find(this.attributeValues, { id: this.selectedAttributeValue });
    this.selectedAttributeValues.push(change.value);
    this.selectedAttributeNames.push(attributeName.label);
    this.getBarCode();
  }
  isAttributeRadioExist(attributeValue: any): boolean {
    let exist = false;
    if (this.selectedAttributeValues?.length) {
      this.selectedAttributeValues.filter((item) => {
        // tslint:disable-next-line: no-unused-expression
        item === attributeValue.id;
        if (item === attributeValue.id) {
          exist = true;
        }
      });
    }
    return exist;
  }
  checkAttributes(attributeValue: AttributeValueType, change: MatCheckboxChange, index: number): void {
    if (change.checked) {
      this.selectedAttributeValues.push(attributeValue.id);
      this.selectedAttributeNames.push(attributeValue.label);
    } else {
      this.selectedAttributeValues = without(this.selectedAttributeValues, attributeValue.id);
      this.selectedAttributeNames = without(this.selectedAttributeNames, attributeValue.label);
    }
    this.getBarCode();
  }
  closeDetails(): void {
    this.selectedAttribute = null;
  }
  getAttributeValues(attributeId: string) {
    this.selectedAttributeValue = null;
    if (this.selectedAttribute && this.selectedAttribute.id === attributeId) {
      this.closeDetails();
      return;
    }
    this.attributesService.getAttributeValuesByAttributePaginated(attributeId).subscribe((res) => {
      if (res) {
        this.selectedAttribute = this.attributes.filter((item) => item.id === attributeId)[0];
        if (!this.attributeValues[0]?.attribute?.isMultipleChoice) {
          this.selectedAttributeValue = find(this.attributeValues, (attributeValue) => includes(this.selectedAttributeValues, attributeValue.id))?.id;
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  resetForm() {
    this.barcodeForm.patchValue({ barcode: '' });
    this.selectedAttributeValues = [];
    this.selectedAttributeNames = [];
    delete this.selectedAttributeValue;
    this.getBarCode();
    this.changeDetectorRef.markForCheck();
  }

  cancel(): void {
    this.matDialogRef.close();
  }

  save(): void {
    const formValue = {
      ...this.barcodeForm.value,
      ...(this.selectedAttributeValues.length ? { productAttributesValues: this.selectedAttributeValues } : {}),
    };
    if (!this.barcode) {
      this.productsService
        .createBarcodeForTargetWithStock(formValue)
        .pipe(
          catchError((error) => {
            this.showMessageError = true;
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.matDialogRef.close(res);
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.productsService
        .addBarcodeToInternalProductAndProduct(this.barcode.id, this.selectedProduct.product.id, this.selectedProduct.id)
        .subscribe((result) => {
          if (result) {
            this.matDialogRef.close();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  addAttributeToProduct(attribute: any): void {
    this.productAttributes.patchValue([attribute, ...this.productAttributes.value]);
    this.changeDetectorRef.markForCheck();
  }

  removeAttributeFromProduct(attribute: any): void {
    const attributes = this.productAttributes.value;
    attributes.splice(
      attributes.findIndex((a) => a === attribute),
      1,
    );
    this.productAttributes.patchValue(attributes);
    this.changeDetectorRef.markForCheck();
  }

  toggleProductAttribute(attribute: any, change: MatRadioChange | MatCheckboxChange): void {
    if (change instanceof MatRadioChange) {
      this.productAttributes.patchValue([change.value]);
      this.changeDetectorRef.markForCheck();
    }
    if (change instanceof MatCheckboxChange) {
      this[change.checked ? 'addAttributeToProduct' : 'removeAttributeFromProduct'](attribute);
    }
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
