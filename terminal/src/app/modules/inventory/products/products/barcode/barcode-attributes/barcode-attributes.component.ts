import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BarcodeType, DeleteStockGQL, GetStockByTargetAndBarcodeGQL } from '@sifca-monorepo/terminal-generator';
import { Subject } from 'rxjs';
import { ProductsService } from '../../products.service';
import { AppCookieService } from '@sifca-monorepo/clients';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'barcode-attributes-modal',
  templateUrl: './barcode-attributes.component.html',
})
export class BarcodeAttributesModalComponent implements OnInit, OnDestroy {
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  private unsubscribeAll: Subject<any> = new Subject<any>();

  attributes: any;
  barcodeExist = false;
  attributesExist = false;
  barcodeForm: FormGroup;
  loading1 = false;
  loading2 = false;
  posId: string;

  constructor(
    private clipboard: Clipboard,
    private appCookieService: AppCookieService,
    private deleteStockGQL: DeleteStockGQL,
    private productsService: ProductsService,
    private matDialogRef: MatDialogRef<BarcodeAttributesModalComponent>,
    private getStockByTargetAndBarcodeGQL: GetStockByTargetAndBarcodeGQL,
    @Inject(MAT_DIALOG_DATA) public data: BarcodeType,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {}

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }
  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }

  cancel(): void {
    this.matDialogRef.close();
  }

  copy(val: string) {
    const selBox = this.document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    this.document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    // tslint:disable-next-line: deprecation
    this.document.execCommand('copy');
    this.document.body.removeChild(selBox);
  }

  deleteBarcode(): void {
    // this.getStockByTargetAndBarcodeGQL.fetch({ target: { pos: this.posId }, barcode: this.data.id }).subscribe(({ data, errors }) => {
    //   if (data?.getStockByTargetAndBarcode?.id) {
    //     const confirmationDeleteteStock = this.fuseConfirmationService.open({
    //       title: 'Delete barcode',
    //       message: `Barcode deletion leads to stock deletion. Are you sure you want to delete this barcode '${this.data.barcode}'? This action cannot be undone!`,
    //       actions: {
    //         confirm: {
    //           label: 'Delete',
    //         },
    //       },
    //     });
    //     confirmationDeleteteStock.afterClosed().subscribe((res) => {
    //       if (res === 'confirmed') {
    //         this.deleteStockGQL
    //           .mutate({ id: data.getStockByTargetAndBarcode.id })
    //           .pipe(switchMap((stock) => this.productsService.deleteBarcode(this.data.id)))
    //           .subscribe((resp) => {
    //             if (resp) {
    //               this.matDialogRef.close();
    //             }
    //           });
    //       }
    //     });
    //   } else {
    //     const confirmation = this.fuseConfirmationService.open({
    //       title: 'Delete barcode',
    //       message: `Are you sure you want to delete this barcode '${this.data.barcode}'?`,
    //       actions: {
    //         confirm: {
    //           label: 'Delete',
    //         },
    //       },
    //     });
    //     // Subscribe to the confirmation dialog closed action
    //     confirmation.afterClosed().subscribe((res) => {
    //       if (res === 'confirmed') {
    //         this.productsService.deleteBarcode(this.data.id).subscribe((resp) => {
    //           if (resp) {
    //             this.matDialogRef.close();
    //           }
    //         });
    //       }
    //     });
    //   }
    // });
  }

  /**
   * Track by function for ngFor loops
   *
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
